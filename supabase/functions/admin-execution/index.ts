import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: { get: (key: string) => string | undefined };
  serve: (handler: (request: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Real admin gating, same pattern as admin-dashboard/admin-manage-catalog:
// verify the caller's JWT, then check admin_users with the service-role
// client (admin_users has no public policies at all). Also hands back the
// caller's own user id, since notes/tasks need to record who wrote/did them.
const requireAdmin = async (supabase: ReturnType<typeof createClient>, request: Request) => {
  const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
  const accessToken = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice("bearer ".length).trim()
    : null;

  if (!accessToken) return { ok: false as const, response: json({ error: "Unauthorized" }, 401) };

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return { ok: false as const, response: json({ error: "Unauthorized" }, 401) };

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError || !adminRow) return { ok: false as const, response: json({ error: "Forbidden: not an admin." }, 403) };

  return { ok: true as const, userId: userData.user.id };
};

const STAGES = [
  "just_started", "planning", "executed", "production", "on_hold", "cancelled",
  "near_completing", "settlement_pending", "retention_pending", "settled_closed", "jms_pending",
] as const;

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

// Emails everyone tagged in a note. Reuses the same Resend setup already
// sending confirmation emails (RESEND_API_KEY, the verified
// getbabeldesigns.com sender) — no SMS/WhatsApp here by design, see the
// requirements doc's Phase-1 decision on that.
const notifyMentions = async (
  supabase: ReturnType<typeof createClient>,
  mentionedUserIds: string[],
  projectName: string,
  authorName: string,
  noteBody: string,
) => {
  if (mentionedUserIds.length === 0) return;

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("admin-execution: RESEND_API_KEY missing, skipping mention notifications");
    return;
  }
  const fromEmail = Deno.env.get("MENTION_NOTIFICATION_FROM_EMAIL") ?? "Babel Designs <contact@getbabeldesigns.com>";

  const { data: teamRows } = await supabase
    .from("admin_users")
    .select("user_id, email, full_name")
    .in("user_id", mentionedUserIds);

  const recipients = (teamRows ?? []).filter((row) => !!row.email);

  await Promise.all(
    recipients.map((row) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: [row.email],
          subject: `${authorName} mentioned you on ${projectName} | Babel Designs`,
          html: `<p>${escapeHtml(authorName)} mentioned you in a note on <strong>${escapeHtml(projectName)}</strong>:</p>` +
            `<blockquote style="border-left:3px solid #ccc;margin:0;padding-left:12px;color:#333;">${escapeHtml(noteBody)}</blockquote>` +
            `<p>Open the project in the admin dashboard to reply.</p>`,
        }),
      }).catch((error) => console.error("admin-execution: mention email failed", row.email, error)),
    ),
  );
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Missing Supabase environment." }, 500);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const adminCheck = await requireAdmin(supabase, request);
    if (!adminCheck.ok) return adminCheck.response;
    const { userId } = adminCheck;

    const body = (await request.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";

    switch (action) {
      case "create_project": {
        const clientName = typeof body.clientName === "string" ? body.clientName.trim() : "";
        const projectName = typeof body.projectName === "string" ? body.projectName.trim() : "";
        if (!clientName || !projectName) return json({ error: "clientName and projectName are required." }, 400);

        const { data, error } = await supabase
          .from("projects")
          .insert({
            client_name: clientName,
            client_phone: body.clientPhone ?? null,
            client_email: body.clientEmail ?? null,
            project_name: projectName,
            consultancy_request_id: body.consultancyRequestId ?? null,
            owner_user_id: body.ownerUserId ?? userId,
            assigned_mailbox: body.assignedMailbox ?? null,
            tentative_start_date: body.tentativeStartDate ?? null,
            tentative_handover_date: body.tentativeHandoverDate ?? null,
          })
          .select()
          .single();

        if (error) {
          console.error("admin-execution create_project error", error);
          return json({ error: "Failed to create project." }, 500);
        }

        // A project created from a lead marks that lead converted, so the
        // Sales — Lead Insights boxes reflect it immediately.
        if (body.consultancyRequestId) {
          await supabase
            .from("consultancy_requests")
            .update({ status: "converted" })
            .eq("id", body.consultancyRequestId);
        }

        return json({ success: true, project: data });
      }

      case "update_project": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        if (!projectId) return json({ error: "projectId is required." }, 400);

        if (body.stage !== undefined && !STAGES.includes(body.stage as typeof STAGES[number])) {
          return json({ error: "Invalid stage." }, 400);
        }

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        for (const key of [
          "clientName", "clientPhone", "clientEmail", "projectName", "stage",
          "ownerUserId", "assignedMailbox", "tentativeStartDate", "tentativeHandoverDate",
        ] as const) {
          if (body[key] !== undefined) {
            const column = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            updates[column] = body[key];
          }
        }

        const { data, error } = await supabase.from("projects").update(updates).eq("id", projectId).select().single();
        if (error) {
          console.error("admin-execution update_project error", error);
          return json({ error: "Failed to update project." }, 500);
        }
        return json({ success: true, project: data });
      }

      case "add_note": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        const noteBody = typeof body.body === "string" ? body.body.trim() : "";
        if (!projectId || !noteBody) return json({ error: "projectId and body are required." }, 400);

        const mentionedUserIds = Array.isArray(body.mentionedUserIds)
          ? (body.mentionedUserIds as unknown[]).filter((id): id is string => typeof id === "string")
          : [];

        const { data, error } = await supabase
          .from("project_notes")
          .insert({
            project_id: projectId,
            author_user_id: userId,
            body: noteBody,
            mentioned_user_ids: mentionedUserIds,
            client_visible: body.clientVisible === true,
          })
          .select()
          .single();

        if (error) {
          console.error("admin-execution add_note error", error);
          return json({ error: "Failed to add note." }, 500);
        }

        const [{ data: project }, { data: author }] = await Promise.all([
          supabase.from("projects").select("project_name").eq("id", projectId).maybeSingle(),
          supabase.from("admin_users").select("full_name, email").eq("user_id", userId).maybeSingle(),
        ]);

        await notifyMentions(
          supabase,
          mentionedUserIds,
          project?.project_name ?? "a project",
          author?.full_name ?? author?.email ?? "A teammate",
          noteBody,
        );

        return json({ success: true, note: data });
      }

      case "add_task": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const dueDate = typeof body.dueDate === "string" ? body.dueDate : "";
        if (!projectId || !title || !dueDate) return json({ error: "projectId, title and dueDate are required." }, 400);

        const { data, error } = await supabase
          .from("project_tasks")
          .insert({
            project_id: projectId,
            title,
            due_date: dueDate,
            assignee_user_id: body.assigneeUserId ?? null,
            client_visible: body.clientVisible === true,
          })
          .select()
          .single();

        if (error) {
          console.error("admin-execution add_task error", error);
          return json({ error: "Failed to add task." }, 500);
        }
        return json({ success: true, task: data });
      }

      case "update_task": {
        const taskId = typeof body.taskId === "string" ? body.taskId : "";
        if (!taskId) return json({ error: "taskId is required." }, 400);

        const updates: Record<string, unknown> = {};
        if (body.done !== undefined) updates.done = body.done === true;
        if (body.title !== undefined) updates.title = body.title;
        if (body.dueDate !== undefined) updates.due_date = body.dueDate;
        if (body.clientVisible !== undefined) updates.client_visible = body.clientVisible === true;

        const { data, error } = await supabase.from("project_tasks").update(updates).eq("id", taskId).select().single();
        if (error) {
          console.error("admin-execution update_task error", error);
          return json({ error: "Failed to update task." }, 500);
        }
        return json({ success: true, task: data });
      }

      case "update_lead_status": {
        const consultancyRequestId = typeof body.consultancyRequestId === "string" ? body.consultancyRequestId : "";
        const status = typeof body.status === "string" ? body.status : "";
        if (!consultancyRequestId || !["open", "converted", "lost"].includes(status)) {
          return json({ error: "consultancyRequestId and a valid status are required." }, 400);
        }

        const { data, error } = await supabase
          .from("consultancy_requests")
          .update({ status })
          .eq("id", consultancyRequestId)
          .select()
          .single();

        if (error) {
          console.error("admin-execution update_lead_status error", error);
          return json({ error: "Failed to update lead status." }, 500);
        }
        return json({ success: true, lead: data });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("admin-execution error", error);
    return json({ error: "Unexpected failure." }, 500);
  }
});

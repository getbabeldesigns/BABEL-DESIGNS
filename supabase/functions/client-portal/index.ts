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

// Client gating is lighter than admin gating: any signed-in Supabase user
// may call this function (there's no client_users allowlist table — access
// to a specific PROJECT is what's actually restricted, via
// client_project_access, checked per-action below). This just verifies the
// JWT and hands back the user's id + email.
const requireClientUser = async (supabase: ReturnType<typeof createClient>, request: Request) => {
  const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
  const accessToken = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice("bearer ".length).trim()
    : null;

  if (!accessToken) return { ok: false as const, response: json({ error: "Unauthorized" }, 401) };

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user || !userData.user.email) {
    return { ok: false as const, response: json({ error: "Unauthorized" }, 401) };
  }

  return { ok: true as const, userId: userData.user.id, email: userData.user.email };
};

// A client never gets a manually-created login (no admin_users-style
// allowlist for them) — instead, whichever project(s) list their email as
// client_email are auto-linked to their auth account the moment they sign
// in, by matching on email (case-insensitively). Idempotent: safe to call on
// every bootstrap.
const autoLinkProjectsByEmail = async (supabase: ReturnType<typeof createClient>, userId: string, email: string) => {
  const { data: matchingProjects, error } = await supabase
    .from("projects")
    .select("id")
    .ilike("client_email", email);

  if (error || !matchingProjects || matchingProjects.length === 0) return;

  await supabase
    .from("client_project_access")
    .upsert(
      matchingProjects.map((p) => ({ user_id: userId, project_id: p.id })),
      { onConflict: "user_id,project_id", ignoreDuplicates: true },
    );
};

// Confirms this user actually has access to this project (via
// client_project_access), re-running the email auto-link first in case
// bootstrap wasn't called yet or a project was added after their last login.
const verifyProjectAccess = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  projectId: string,
) => {
  await autoLinkProjectsByEmail(supabase, userId, email);
  const { data } = await supabase
    .from("client_project_access")
    .select("id")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .maybeSingle();
  return Boolean(data);
};

const sanitizeFileName = (name: string) => {
  const trimmed = name.trim().slice(-120);
  return trimmed.replace(/[^a-zA-Z0-9.\-_]/g, "_") || "upload";
};

const stripDataUrlPrefix = (value: string) => {
  const commaIndex = value.indexOf(",");
  if (value.startsWith("data:") && commaIndex !== -1) return value.slice(commaIndex + 1);
  return value;
};

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_DECODED_BYTES = 8 * 1024 * 1024;

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Missing Supabase environment." }, 500);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const authCheck = await requireClientUser(supabase, request);
    if (!authCheck.ok) return authCheck.response;
    const { userId, email } = authCheck;

    const body = (await request.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";

    switch (action) {
      // Called right after the client signs in. Links any project(s) with
      // a matching client_email, then returns the list they can now see.
      case "bootstrap": {
        await autoLinkProjectsByEmail(supabase, userId, email);

        const { data: access } = await supabase
          .from("client_project_access")
          .select("project_id")
          .eq("user_id", userId);

        const projectIds = (access ?? []).map((row) => row.project_id);
        if (projectIds.length === 0) return json({ success: true, projects: [] });

        const { data: projects, error } = await supabase
          .from("projects")
          .select("id, project_name, stage, tentative_start_date, tentative_handover_date")
          .in("id", projectIds)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("client-portal bootstrap error", error);
          return json({ error: "Failed to load your projects." }, 500);
        }
        return json({ success: true, projects: projects ?? [] });
      }

      case "get_project": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        if (!projectId) return json({ error: "projectId is required." }, 400);

        const hasAccess = await verifyProjectAccess(supabase, userId, email, projectId);
        if (!hasAccess) return json({ error: "You don't have access to this project." }, 403);

        const [projectResult, notesResult, tasksResult, inspirationResult] = await Promise.all([
          supabase
            .from("projects")
            .select("id, project_name, stage, tentative_start_date, tentative_handover_date")
            .eq("id", projectId)
            .maybeSingle(),
          supabase
            .from("project_notes")
            .select("id, body, created_at")
            .eq("project_id", projectId)
            .eq("client_visible", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("project_tasks")
            .select("id, title, due_date, done")
            .eq("project_id", projectId)
            .eq("client_visible", true)
            .order("due_date", { ascending: true }),
          supabase
            .from("project_inspiration")
            .select("id, source, kind, url, caption, created_at")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false }),
        ]);

        if (!projectResult.data) return json({ error: "Project not found." }, 404);

        return json({
          success: true,
          project: projectResult.data,
          // Notes are shown as updates from the design team — no author
          // name surfaced here, deliberately (client-facing, keeps it about
          // the project, not internal team attribution).
          notes: notesResult.data ?? [],
          tasks: tasksResult.data ?? [],
          inspiration: inspirationResult.data ?? [],
        });
      }

      case "add_inspiration_link": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        const url = typeof body.url === "string" ? body.url.trim() : "";
        const caption = typeof body.caption === "string" ? body.caption.trim() : null;
        if (!projectId || !url) return json({ error: "projectId and url are required." }, 400);

        const hasAccess = await verifyProjectAccess(supabase, userId, email, projectId);
        if (!hasAccess) return json({ error: "You don't have access to this project." }, 403);

        const { data, error } = await supabase
          .from("project_inspiration")
          .insert({ project_id: projectId, source: "client", kind: "link", url, caption, created_by_user_id: userId })
          .select()
          .single();

        if (error) {
          console.error("client-portal add_inspiration_link error", error);
          return json({ error: "Failed to add that." }, 500);
        }
        return json({ success: true, item: data });
      }

      case "upload_inspiration_image": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        const fileName = typeof body.fileName === "string" ? body.fileName : "";
        const fileBase64 = typeof body.fileBase64 === "string" ? body.fileBase64 : "";
        const contentType = typeof body.contentType === "string" ? body.contentType : "";
        const caption = typeof body.caption === "string" ? body.caption.trim() : null;
        if (!projectId || !fileName || !fileBase64 || !contentType) {
          return json({ error: "projectId, fileName, fileBase64 and contentType are required." }, 400);
        }
        if (!ALLOWED_IMAGE_TYPES.has(contentType)) return json({ error: "Unsupported image type." }, 400);

        const hasAccess = await verifyProjectAccess(supabase, userId, email, projectId);
        if (!hasAccess) return json({ error: "You don't have access to this project." }, 403);

        const base64Payload = stripDataUrlPrefix(fileBase64);
        const approxDecodedBytes = Math.floor((base64Payload.length * 3) / 4);
        if (approxDecodedBytes > MAX_DECODED_BYTES) return json({ error: "Image is too large. Maximum size is 8MB." }, 400);

        let bytes: Uint8Array;
        try {
          const binaryString = atob(base64Payload);
          bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
        } catch {
          return json({ error: "fileBase64 is not valid base64." }, 400);
        }
        if (bytes.byteLength > MAX_DECODED_BYTES) return json({ error: "Image is too large. Maximum size is 8MB." }, 400);

        const path = `${projectId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
        const { error: uploadError } = await supabase.storage
          .from("project-inspiration")
          .upload(path, bytes, { contentType, upsert: false });

        if (uploadError) {
          console.error("client-portal upload_inspiration_image storage error", uploadError);
          return json({ error: "Failed to upload image." }, 500);
        }

        const { data: publicUrlData } = supabase.storage.from("project-inspiration").getPublicUrl(path);

        const { data, error } = await supabase
          .from("project_inspiration")
          .insert({
            project_id: projectId,
            source: "client",
            kind: "image",
            url: publicUrlData.publicUrl,
            caption,
            created_by_user_id: userId,
          })
          .select()
          .single();

        if (error) {
          console.error("client-portal upload_inspiration_image insert error", error);
          return json({ error: "Uploaded, but failed to record it." }, 500);
        }
        return json({ success: true, item: data });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("client-portal error", error);
    return json({ error: "Unexpected failure." }, 500);
  }
});

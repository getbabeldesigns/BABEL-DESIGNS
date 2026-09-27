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

  return { ok: true as const };
};

// Timeline bucketing: due within the next 7 days (and not done) = "current",
// further out = "upcoming", past due and not done = "delayed". 7 days is a
// starting default, not something the requirements doc pinned down — easy
// to change here later if the team wants a different window.
const CURRENT_WINDOW_DAYS = 7;

const bucketTask = (dueDate: string, done: boolean): "done" | "delayed" | "current" | "upcoming" => {
  if (done) return "done";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "delayed";
  if (diffDays <= CURRENT_WINDOW_DAYS) return "current";
  return "upcoming";
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

    const body = (await request.json()) as { projectId?: string };
    const projectId = body.projectId;
    if (!projectId) return json({ error: "projectId is required." }, 400);

    const [projectResult, notesResult, tasksResult, documentsResult, inspirationResult, teamResult] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).maybeSingle(),
      supabase
        .from("project_notes")
        .select("id, body, mentioned_user_ids, client_visible, created_at, author_user_id")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("project_tasks")
        .select("id, title, due_date, done, assignee_user_id, client_visible, created_at")
        .eq("project_id", projectId)
        .order("due_date", { ascending: true }),
      supabase
        .from("project_documents")
        .select("id, folder, file_name, kind, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("project_inspiration")
        .select("id, source, kind, url, caption, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase.from("admin_users").select("user_id, full_name, email"),
    ]);

    if (!projectResult.data) return json({ error: "Project not found." }, 404);

    const teamById = new Map((teamResult.data ?? []).map((row) => [row.user_id, row.full_name ?? row.email ?? "Unknown"]));

    const notes = (notesResult.data ?? []).map((note) => ({
      ...note,
      author_name: teamById.get(note.author_user_id ?? "") ?? "Unknown",
      mentioned_names: (note.mentioned_user_ids ?? []).map((id: string) => teamById.get(id) ?? "Unknown"),
    }));

    const tasks = (tasksResult.data ?? []).map((task) => ({
      ...task,
      bucket: bucketTask(task.due_date, task.done),
      assignee_name: task.assignee_user_id ? teamById.get(task.assignee_user_id) ?? "Unknown" : null,
    }));

    const timelineSummary = {
      current: tasks.filter((t) => t.bucket === "current").length,
      upcoming: tasks.filter((t) => t.bucket === "upcoming").length,
      delayed: tasks.filter((t) => t.bucket === "delayed").length,
      done: tasks.filter((t) => t.bucket === "done").length,
    };

    return json({
      project: projectResult.data,
      notes,
      tasks,
      timelineSummary,
      documents: documentsResult.data ?? [],
      inspiration: inspirationResult.data ?? [],
      teamMembers: (teamResult.data ?? []).map((row) => ({
        id: row.user_id,
        name: row.full_name ?? row.email ?? "Unknown",
        email: row.email,
      })),
    });
  } catch (error) {
    console.error("admin-project-detail error", error);
    return json({ error: "Unexpected failure." }, 500);
  }
});

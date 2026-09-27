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

  return { ok: true as const, userId: userData.user.id };
};

// Broader than admin-upload-image's allowlist (that one is images-only for
// public catalog photos) — this bucket is private and takes PDFs, images,
// and CAD/drawing files, which browsers commonly hand over as
// application/octet-stream since they don't recognize .dwg specifically.
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf", "image/png", "image/jpeg", "image/webp",
  "image/vnd.dwg", "application/acad", "application/octet-stream",
]);
// 25MB starting limit — flagged in the requirements doc as worth revisiting
// once real DWG file sizes are known; bump here (and check the Supabase
// project's own storage/upload-size limits) if that turns out too small.
const MAX_DECODED_BYTES = 25 * 1024 * 1024;
const BUCKET = "project-documents";

const sanitizeFileName = (name: string) => {
  const trimmed = name.trim().slice(-150);
  return trimmed.replace(/[^a-zA-Z0-9.\-_]/g, "_") || "upload";
};

const stripDataUrlPrefix = (value: string) => {
  const commaIndex = value.indexOf(",");
  if (value.startsWith("data:") && commaIndex !== -1) return value.slice(commaIndex + 1);
  return value;
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
      case "list": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        if (!projectId) return json({ error: "projectId is required." }, 400);

        const { data, error } = await supabase
          .from("project_documents")
          .select("id, folder, file_name, file_url, kind, created_at")
          .eq("project_id", projectId)
          .order("folder", { ascending: true })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("admin-project-documents list error", error);
          return json({ error: "Failed to list documents." }, 500);
        }
        // kind='link' rows already hold the real (external) URL; kind='file'
        // rows hold a storage path only — the frontend calls get_url for
        // those when the admin actually wants to open one, rather than every
        // list call minting a fresh signed URL for every file up front.
        return json({ success: true, documents: data ?? [] });
      }

      case "add_link": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        const url = typeof body.url === "string" ? body.url.trim() : "";
        const fileName = typeof body.fileName === "string" ? body.fileName.trim() : url;
        if (!projectId || !url) return json({ error: "projectId and url are required." }, 400);

        const { data, error } = await supabase
          .from("project_documents")
          .insert({
            project_id: projectId,
            folder: typeof body.folder === "string" && body.folder.trim() ? body.folder.trim() : "General",
            file_name: fileName,
            file_url: url,
            kind: "link",
            uploaded_by: userId,
          })
          .select()
          .single();

        if (error) {
          console.error("admin-project-documents add_link error", error);
          return json({ error: "Failed to add link." }, 500);
        }
        return json({ success: true, document: data });
      }

      case "upload": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        const fileName = typeof body.fileName === "string" ? body.fileName : "";
        const fileBase64 = typeof body.fileBase64 === "string" ? body.fileBase64 : "";
        const contentType = typeof body.contentType === "string" ? body.contentType : "";
        if (!projectId || !fileName || !fileBase64 || !contentType) {
          return json({ error: "projectId, fileName, fileBase64 and contentType are required." }, 400);
        }
        if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
          return json({ error: "Unsupported file type." }, 400);
        }

        const base64Payload = stripDataUrlPrefix(fileBase64);
        const approxDecodedBytes = Math.floor((base64Payload.length * 3) / 4);
        if (approxDecodedBytes > MAX_DECODED_BYTES) {
          return json({ error: "File is too large. Maximum size is 25MB." }, 400);
        }

        let bytes: Uint8Array;
        try {
          const binaryString = atob(base64Payload);
          bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
        } catch {
          return json({ error: "fileBase64 is not valid base64." }, 400);
        }
        if (bytes.byteLength > MAX_DECODED_BYTES) {
          return json({ error: "File is too large. Maximum size is 25MB." }, 400);
        }

        const folder = typeof body.folder === "string" && body.folder.trim() ? body.folder.trim() : "General";
        const path = `${projectId}/${folder}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, bytes, { contentType, upsert: false });

        if (uploadError) {
          console.error("admin-project-documents upload error", uploadError);
          return json({ error: "Failed to upload file." }, 500);
        }

        const { data, error } = await supabase
          .from("project_documents")
          .insert({
            project_id: projectId,
            folder,
            file_name: sanitizeFileName(fileName),
            file_url: path,
            kind: "file",
            uploaded_by: userId,
          })
          .select()
          .single();

        if (error) {
          console.error("admin-project-documents insert-row error", error);
          return json({ error: "Uploaded, but failed to record it." }, 500);
        }
        return json({ success: true, document: data });
      }

      case "get_url": {
        const documentId = typeof body.documentId === "string" ? body.documentId : "";
        if (!documentId) return json({ error: "documentId is required." }, 400);

        const { data: doc, error: docError } = await supabase
          .from("project_documents")
          .select("kind, file_url")
          .eq("id", documentId)
          .maybeSingle();

        if (docError || !doc) return json({ error: "Document not found." }, 404);
        if (doc.kind === "link") return json({ success: true, url: doc.file_url });

        const { data: signed, error: signError } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(doc.file_url, 3600);

        if (signError || !signed) {
          console.error("admin-project-documents get_url sign error", signError);
          return json({ error: "Failed to generate a download link." }, 500);
        }
        return json({ success: true, url: signed.signedUrl });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("admin-project-documents error", error);
    return json({ error: "Unexpected failure." }, 500);
  }
});

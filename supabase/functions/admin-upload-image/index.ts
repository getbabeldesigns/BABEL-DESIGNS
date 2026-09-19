import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Real admin gating: the caller must send a signed-in Supabase user's JWT as
// `Authorization: Bearer <token>` (not a shared secret), and that user's id
// must have a row in admin_users. supabase.auth.getUser() verifies the JWT
// against Supabase Auth; the admin_users lookup then uses the service-role
// client to bypass RLS (admin_users has no public policies at all).
// Copied verbatim from admin-manage-catalog/index.ts — keep both in sync if
// the admin auth pattern ever changes.
const requireAdmin = async (supabase: ReturnType<typeof createClient>, request: Request) => {
  const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
  const accessToken = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice("bearer ".length).trim()
    : null;

  const unauthorized = () =>
    new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!accessToken) return { ok: false as const, response: unauthorized() };

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return { ok: false as const, response: unauthorized() };

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    return {
      ok: false as const,
      response: new Response(JSON.stringify({ error: "Forbidden: not an admin." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  return { ok: true as const };
};

interface UploadImageBody {
  fileName: string;
  fileBase64: string;
  contentType: string;
  folder?: "collections" | "products";
}

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_DECODED_BYTES = 8 * 1024 * 1024; // 8MB

const badRequest = (message: string) =>
  new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sanitizeFileName = (name: string) => {
  const trimmed = name.trim().slice(-120);
  return trimmed.replace(/[^a-zA-Z0-9.\-_]/g, "_") || "upload";
};

// Strips a data: URL prefix if the caller sent one (e.g. "data:image/png;base64,...").
const stripDataUrlPrefix = (value: string) => {
  const commaIndex = value.indexOf(",");
  if (value.startsWith("data:") && commaIndex !== -1) {
    return value.slice(commaIndex + 1);
  }
  return value;
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const adminCheck = await requireAdmin(supabase, request);
    if (!adminCheck.ok) return adminCheck.response;

    const body = (await request.json()) as Partial<UploadImageBody>;

    if (!body.fileName || typeof body.fileName !== "string") {
      return badRequest("fileName is required.");
    }
    if (!body.fileBase64 || typeof body.fileBase64 !== "string") {
      return badRequest("fileBase64 is required.");
    }
    if (!body.contentType || typeof body.contentType !== "string") {
      return badRequest("contentType is required.");
    }
    if (!ALLOWED_CONTENT_TYPES.has(body.contentType)) {
      return badRequest("Unsupported contentType. Allowed: image/png, image/jpeg, image/webp, image/gif.");
    }

    const folder = body.folder === "collections" || body.folder === "products" ? body.folder : "misc";

    const base64Payload = stripDataUrlPrefix(body.fileBase64);

    // Base64 encodes 3 bytes as 4 chars, so this is a cheap upper-bound check
    // before we actually decode (decoding first would let an oversized
    // payload burn CPU/memory before we reject it).
    const approxDecodedBytes = Math.floor((base64Payload.length * 3) / 4);
    if (approxDecodedBytes > MAX_DECODED_BYTES) {
      return badRequest("Image is too large. Maximum size is 8MB.");
    }

    let bytes: Uint8Array;
    try {
      const binaryString = atob(base64Payload);
      bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    } catch {
      return badRequest("fileBase64 is not valid base64.");
    }

    if (bytes.byteLength > MAX_DECODED_BYTES) {
      return badRequest("Image is too large. Maximum size is 8MB.");
    }

    const path = `${folder}/${crypto.randomUUID()}-${sanitizeFileName(body.fileName)}`;

    const { error: uploadError } = await supabase.storage
      .from("catalog-images")
      .upload(path, bytes, { contentType: body.contentType, upsert: false });

    if (uploadError) {
      console.error("admin-upload-image storage upload error", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload image." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrlData } = supabase.storage.from("catalog-images").getPublicUrl(path);

    return new Response(JSON.stringify({ success: true, publicUrl: publicUrlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("admin-upload-image error", error);
    return new Response(JSON.stringify({ error: "Unexpected failure." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

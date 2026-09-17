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

type ManageCatalogBody =
  | {
      action: "update_collection";
      collectionId: string;
      tagline: string;
      description: string;
      heroImageUrl: string;
    }
  | {
      action: "update_product";
      productId: string;
      active: boolean;
      imageUrl: string;
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

    const body = (await request.json()) as ManageCatalogBody;

    if (body.action === "update_collection") {
      const { error } = await supabase
        .from("collections")
        .update({
          tagline: body.tagline,
          description: body.description,
          hero_image_url: body.heroImageUrl || null,
        })
        .eq("id", body.collectionId);

      if (error) {
        return new Response(JSON.stringify({ error: "Failed to update collection." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (body.action === "update_product") {
      const { error } = await supabase
        .from("products")
        .update({
          active: body.active,
          image_url: body.imageUrl || null,
        })
        .eq("id", body.productId);

      if (error) {
        return new Response(JSON.stringify({ error: "Failed to update product." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("admin-manage-catalog error", error);
    return new Response(JSON.stringify({ error: "Unexpected failure." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

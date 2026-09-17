import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

// Constant-time comparison, consistent with the Razorpay signature checks
// elsewhere in this project (plain `!==` leaks a timing signal).
const timingSafeEqualStrings = (a: string, b: string) => {
  const bufA = new TextEncoder().encode(a);
  const bufB = new TextEncoder().encode(b);
  const length = Math.max(bufA.length, bufB.length);
  let mismatch = bufA.length === bufB.length ? 0 : 1;
  for (let i = 0; i < length; i++) {
    mismatch |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  }
  return mismatch === 0;
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
    const adminToken = request.headers.get("x-admin-token");
    const expectedToken = Deno.env.get("ADMIN_DASHBOARD_TOKEN");

    if (!adminToken || !expectedToken || !timingSafeEqualStrings(adminToken, expectedToken)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as ManageCatalogBody;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

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

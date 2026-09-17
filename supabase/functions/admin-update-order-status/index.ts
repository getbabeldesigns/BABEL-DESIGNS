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

interface UpdateOrderStatusBody {
  orderId: string;
  status: string;
  paymentStatus?: string | null;
}

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

    const body = (await request.json()) as UpdateOrderStatusBody;
    const orderId = body.orderId?.trim();
    const status = body.status?.trim();

    if (!orderId || !status) {
      return new Response(JSON.stringify({ error: "orderId and status are required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const updatePayload: Record<string, string | null> = { status };
    if (typeof body.paymentStatus !== "undefined") {
      updatePayload.payment_status = body.paymentStatus;
    }

    const { error } = await supabase.from("orders").update(updatePayload).eq("id", orderId);

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to update order status." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("admin-update-order-status error", error);
    return new Response(JSON.stringify({ error: "Unexpected failure." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

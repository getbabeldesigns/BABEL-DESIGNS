import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

// Plain `!==` leaks a timing signal proportional to how many leading
// characters match. This function is not used for anything, but it brings
// the admin-token check in line with the constant-time comparison already
// used for the Razorpay signature checks elsewhere in this project.
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

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const [
      { data: orders = [] },
      { data: consultancyRequests = [] },
      { data: subscribers = [] },
      { data: collections = [] },
      { data: products = [] },
      // True totals via `count: 'exact', head: true` (no rows returned, just
      // the count) so the dashboard's KPI tiles reflect the whole table, not
      // just the most-recent 20 rows fetched above for the list views.
      { count: totalOrders = 0 },
      { count: totalPaidOrders = 0 },
      { count: totalConsultancyRequests = 0 },
      { count: totalSubscribers = 0 },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("id,status,payment_status,total_amount,currency,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("consultancy_requests")
        .select("id,name,email,project_type,preferred_date,preferred_slot,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("studio_dispatch_subscribers")
        .select("id,email,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("collections")
        .select("id,slug,name,tagline,description,hero_image_url")
        .order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select("id,slug,name,active,image_url")
        .order("sort_order", { ascending: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "paid"),
      supabase.from("consultancy_requests").select("id", { count: "exact", head: true }),
      supabase.from("studio_dispatch_subscribers").select("id", { count: "exact", head: true }),
    ]);

    const metrics = {
      orders: totalOrders ?? 0,
      paidOrders: totalPaidOrders ?? 0,
      consultancyRequests: totalConsultancyRequests ?? 0,
      subscribers: totalSubscribers ?? 0,
    };

    return new Response(
      JSON.stringify({
        metrics,
        orders,
        consultancyRequests,
        subscribers,
        collections,
        products,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("admin-dashboard error", error);
    return new Response(JSON.stringify({ error: "Failed to load dashboard." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

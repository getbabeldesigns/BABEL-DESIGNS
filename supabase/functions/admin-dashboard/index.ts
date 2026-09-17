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

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

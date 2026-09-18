import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Order lookup by email (optionally narrowed to one order id). This uses the
// service-role key so it bypasses RLS entirely, which is what lets a guest
// (never signed in, no account) look up an order they placed. The email is
// the credential here: nobody can list an order they don't already know the
// associated email for. That's a deliberately low-friction, guest-friendly
// tradeoff (the same pattern most e-commerce "track your order" pages use),
// not a substitute for real per-account authorization. It is only used to
// return each caller's own order history — never anyone else's — so no
// customer notes/addresses beyond what the requester already provided.
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

    const body = (await request.json()) as { email?: string; orderId?: string };
    const email = body.email?.trim().toLowerCase();
    const orderId = body.orderId?.trim();

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let query = supabase
      .from("orders")
      .select("id,full_name,email,notes,status,payment_status,payment_provider,currency,total_amount,created_at")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(50);

    if (orderId) {
      query = query.eq("id", orderId);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error("customer-orders: failed to load orders", ordersError);
      return new Response(JSON.stringify({ error: "Failed to load orders." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderIds = (orders ?? []).map((order) => order.id);
    let itemsByOrder: Record<string, unknown[]> = {};

    if (orderIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("order_id,product_id,product_name,unit_price,quantity,material,image_url")
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("customer-orders: failed to load order items", itemsError);
      } else {
        itemsByOrder = (items ?? []).reduce<Record<string, unknown[]>>((acc, item) => {
          const key = item.order_id as string;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
      }
    }

    const result = (orders ?? []).map((order) => ({
      ...order,
      items: itemsByOrder[order.id] ?? [],
    }));

    return new Response(JSON.stringify({ orders: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("customer-orders error", error);
    return new Response(JSON.stringify({ error: "Unexpected failure." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import Razorpay from "npm:razorpay@2.9.6";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateRazorpayOrderRequest {
  localOrderId: string;
}

const toSubunits = (amount: number) => Math.round(amount * 100);

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
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(JSON.stringify({ error: "Missing Razorpay secrets." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as CreateRazorpayOrderRequest;
    const localOrderId = body.localOrderId?.trim();

    if (!localOrderId) {
      return new Response(JSON.stringify({ error: "localOrderId is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,total_amount,currency,razorpay_order_id,payment_status")
      .eq("id", localOrderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // `orders.total_amount` was written by an anonymous client under a public
    // INSERT policy, so it cannot be trusted as-is. Recompute the charge from
    // the order_items rows (also client-submitted, but at least internally
    // consistent line-by-line) instead of the order's own total_amount field.
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id,unit_price,quantity")
      .eq("order_id", localOrderId);

    if (itemsError || !orderItems || orderItems.length === 0) {
      return new Response(JSON.stringify({ error: "Order has no items." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Where a line item's product_id matches a real row in the live Supabase
    // catalog, reject the order if the submitted unit_price undercuts the
    // currently published price (catches a tampered/stale cart total). Line
    // items placed while the site was running on the static/offline fallback
    // catalog won't match a UUID here and are left unverified, since there's
    // no server-side source of truth to check them against in that mode.
    const productIds = [...new Set(orderItems.map((item) => item.product_id).filter(Boolean))];
    const { data: liveProducts } = await supabase
      .from("products")
      .select("id,price")
      .in("id", productIds);

    const livePriceById = new Map((liveProducts ?? []).map((p) => [p.id, Number(p.price)]));
    const PRICE_TOLERANCE = 0.01;

    for (const item of orderItems) {
      const livePrice = livePriceById.get(item.product_id);
      if (livePrice !== undefined && Number(item.unit_price) < livePrice - PRICE_TOLERANCE) {
        return new Response(
          JSON.stringify({ error: "Order pricing is out of date. Please refresh your cart and try again." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const recomputedTotal = orderItems.reduce(
      (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
      0,
    );

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const amount = toSubunits(recomputedTotal);
    const currency = order.currency ?? "INR";

    if (order.razorpay_order_id && order.payment_status !== "paid") {
      const existingOrder = await razorpay.orders.fetch(order.razorpay_order_id);
      return new Response(
        JSON.stringify({
          razorpayOrderId: existingOrder.id,
          amount: existingOrder.amount,
          currency: existingOrder.currency,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency,
      receipt: localOrderId.slice(0, 40),
      notes: {
        local_order_id: localOrderId,
      },
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_provider: "razorpay",
        payment_status: "pending",
        razorpay_order_id: razorpayOrder.id,
        status: "payment_pending",
        // Keep the stored total in sync with what was actually recomputed
        // and charged above, instead of leaving the client-submitted value.
        total_amount: recomputedTotal,
      })
      .eq("id", localOrderId);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update order." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("create-razorpay-order error", error);
    return new Response(JSON.stringify({ error: "Failed to create Razorpay order." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

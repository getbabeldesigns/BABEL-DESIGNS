import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

type WebhookPayload = {
  type?: string;
  table?: string;
  record?: Record<string, unknown> | null;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const formatMoney = (value: unknown, currency?: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) return formatValue(value);
  const label = currency ? String(currency) : "";
  return `${label} ${parsed.toFixed(2)}`.trim();
};

const buildRows = (entries: Array<[string, unknown]>) =>
  entries
    .map(
      ([label, value]) =>
        `<tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">${escapeHtml(
          label,
        )}</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${escapeHtml(
          formatValue(value),
        )}</td></tr>`,
    )
    .join("");

const buildItemsTable = (
  items: Array<{ product_name?: string; quantity?: number; unit_price?: number; material?: string }> | null,
) => {
  if (!items || items.length === 0) {
    return "<p style=\"margin: 0 0 16px;\">No order items were found.</p>";
  }

  const rows = items
    .map((item) => {
      const name = escapeHtml(formatValue(item.product_name));
      const quantity = escapeHtml(formatValue(item.quantity));
      const unitPrice = escapeHtml(formatValue(item.unit_price));
      const material = escapeHtml(formatValue(item.material));
      return `<tr>
        <td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${name}</td>
        <td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${quantity}</td>
        <td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${unitPrice}</td>
        <td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${material}</td>
      </tr>`;
    })
    .join("");

  return `
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 6px 10px; border: 1px solid #e6e6e6;">Item</th>
          <th style="text-align: left; padding: 6px 10px; border: 1px solid #e6e6e6;">Qty</th>
          <th style="text-align: left; padding: 6px 10px; border: 1px solid #e6e6e6;">Unit Price</th>
          <th style="text-align: left; padding: 6px 10px; border: 1px solid #e6e6e6;">Material</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
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
    const webhookSecret = Deno.env.get("ADMIN_WEBHOOK_SECRET");
    const providedSecret = request.headers.get("x-webhook-secret");
    if (webhookSecret && providedSecret && webhookSecret !== providedSecret) {
      return new Response(JSON.stringify({ error: "Invalid webhook secret." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await request.json()) as WebhookPayload;
    const table = payload.table;
    const record = payload.record ?? null;
    const inferredType =
      table === "consultancy_requests"
        ? "consultancy"
        : table === "orders"
          ? "order"
          : undefined;
    const type = payload.type?.toLowerCase() === "insert" ? inferredType : payload.type ?? inferredType;

    if (!type || !record) {
      return new Response(JSON.stringify({ error: "Missing webhook payload." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    const fromEmail = Deno.env.get("ADMIN_NOTIFICATION_FROM_EMAIL") ?? "Babel Designs <onboarding@resend.dev>";
    const replyToEmail = Deno.env.get("ADMIN_NOTIFICATION_REPLY_TO");

    if (!resendApiKey || !adminEmail) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject = "New submission received";
    let htmlBody = "";
    let textBody = "";

    if (type === "consultancy") {
      subject = "New consultancy request";
      const rows = buildRows([
        ["Name", record.name],
        ["Email", record.email],
        ["Phone", record.phone],
        ["Project type", record.project_type],
        ["Timeline", record.timeline],
        ["Message", record.message],
        ["Submitted at", record.created_at],
        ["Request ID", record.id],
      ]);

      htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #1f1f1f; line-height: 1.6;">
          <h2 style="margin: 0 0 16px;">New consultancy request</h2>
          <table style="border-collapse: collapse; width: 100%;">${rows}</table>
        </div>
      `;

      textBody = `New consultancy request\n` +
        `Name: ${formatValue(record.name)}\n` +
        `Email: ${formatValue(record.email)}\n` +
        `Phone: ${formatValue(record.phone)}\n` +
        `Project type: ${formatValue(record.project_type)}\n` +
        `Timeline: ${formatValue(record.timeline)}\n` +
        `Message: ${formatValue(record.message)}\n` +
        `Submitted at: ${formatValue(record.created_at)}\n` +
        `Request ID: ${formatValue(record.id)}\n`;
    }

    if (type === "order") {
      subject = "New order created";
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !serviceRoleKey) {
        return new Response(JSON.stringify({ error: "Missing Supabase service role configuration." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("product_name,quantity,unit_price,material")
        .eq("order_id", record.id);

      if (itemsError) {
        console.error("notify-admin-on-new-record: order items lookup failed", itemsError);
      }

      const rows = buildRows([
        ["Order ID", record.id],
        ["Name", record.full_name],
        ["Email", record.email],
        ["Notes", record.notes],
        ["Status", record.status],
        ["Payment status", record.payment_status],
        ["Payment provider", record.payment_provider],
        ["Total", formatMoney(record.total_amount, record.currency)],
        ["Created at", record.created_at],
      ]);

      const itemsTable = buildItemsTable(items ?? null);

      htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #1f1f1f; line-height: 1.6;">
          <h2 style="margin: 0 0 16px;">New order created</h2>
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">${rows}</table>
          <h3 style="margin: 0 0 8px;">Items</h3>
          ${itemsTable}
        </div>
      `;

      textBody = `New order created\n` +
        `Order ID: ${formatValue(record.id)}\n` +
        `Name: ${formatValue(record.full_name)}\n` +
        `Email: ${formatValue(record.email)}\n` +
        `Notes: ${formatValue(record.notes)}\n` +
        `Status: ${formatValue(record.status)}\n` +
        `Payment status: ${formatValue(record.payment_status)}\n` +
        `Payment provider: ${formatValue(record.payment_provider)}\n` +
        `Total: ${formatMoney(record.total_amount, record.currency)}\n` +
        `Created at: ${formatValue(record.created_at)}\n` +
        `Items: ${(items ?? []).map((item) => `${formatValue(item.product_name)} x${formatValue(item.quantity)}`).join(", ") || "—"}\n`;
    }

    if (!htmlBody || !textBody) {
      return new Response(JSON.stringify({ error: "Unhandled notification type." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        reply_to: replyToEmail ? [replyToEmail] : undefined,
        subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!resendResponse.ok) {
      const resendErrorBody = await resendResponse.text();
      console.error("notify-admin-on-new-record: Resend API error", resendErrorBody);
      return new Response(JSON.stringify({ error: "Failed to send notification email." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-admin-on-new-record error", error);
    return new Response(JSON.stringify({ error: "Unexpected error while sending notification." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsultancyConfirmationBody {
  name?: string;
  email?: string;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

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
    const body = (await request.json()) as ConsultancyConfirmationBody;
    const name = body.name?.trim() || "there";
    const safeName = escapeHtml(name);
    const email = body.email?.trim();

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("CONSULTANCY_CONFIRMATION_FROM_EMAIL") ?? "Babel Designs <onboarding@resend.dev>";
    const replyToEmail = Deno.env.get("CONSULTANCY_CONFIRMATION_REPLY_TO");

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY secret." }), {
        status: 500,
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
        to: [email],
        reply_to: replyToEmail ? [replyToEmail] : undefined,
        subject: "Your consultancy request was received | Babel Designs",
        html: `
          <div style="font-family: Georgia, serif; line-height: 1.6; color: #1f1f1f; max-width: 620px; margin: 0 auto;">
            <h1 style="font-size: 28px; margin-bottom: 20px;">Babel Designs</h1>
            <p style="font-size: 16px; margin-bottom: 16px;">Hello ${safeName},</p>
            <p style="font-size: 16px; margin-bottom: 16px;">Thank you for submitting your consultancy application.</p>
            <p style="font-size: 16px; margin-bottom: 16px;">Our team has received your request and will get back to you within 48 hours.</p>
            <p style="font-size: 16px; margin-bottom: 24px;">We appreciate the opportunity to collaborate on your space.</p>
            <p style="font-size: 14px; color: #555;">Babel Designs<br />Design that unites all diversities.</p>
          </div>
        `,
        text:
          `Hello ${name},\n\n` +
          "Thank you for submitting your consultancy application.\n" +
          "Our team has received your request and will get back to you within 48 hours.\n\n" +
          "Babel Designs",
      }),
    });

    if (!resendResponse.ok) {
      const resendErrorBody = await resendResponse.text();
      console.error("send-consultancy-confirmation: Resend API error", resendErrorBody);
      return new Response(JSON.stringify({ error: "Failed to send confirmation email." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-consultancy-confirmation error", error);
    return new Response(JSON.stringify({ error: "Unexpected error while sending confirmation email." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsultancyConfirmationBody {
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  timeline?: string;
  preferredDate?: string;
  preferredSlot?: string;
  message?: string;
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
    const email = body.email?.trim();
    const phone = body.phone?.trim() || "Not provided";
    const projectType = body.projectType?.trim() || "Not provided";
    const timeline = body.timeline?.trim() || "Not provided";
    const preferredDate = body.preferredDate?.trim() || "Not provided";
    const preferredSlot = body.preferredSlot?.trim() || "Not provided";
    const message = body.message?.trim() || "Not provided";

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeProjectType = escapeHtml(projectType);
    const safeTimeline = escapeHtml(timeline);
    const safePreferredDate = escapeHtml(preferredDate);
    const safePreferredSlot = escapeHtml(preferredSlot);
    const safeMessage = escapeHtml(message);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("CONSULTANCY_CONFIRMATION_FROM_EMAIL") ?? "Babel Designs <onboarding@resend.dev>";
    const replyToEmail = Deno.env.get("CONSULTANCY_CONFIRMATION_REPLY_TO");
    const adminEmail = Deno.env.get("CONSULTANCY_NOTIFICATION_EMAIL") ?? "getbabeldesigns@gmail.com";

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY secret." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientResponse = await fetch("https://api.resend.com/emails", {
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

    if (!clientResponse.ok) {
      const resendErrorBody = await clientResponse.text();
      console.error("send-consultancy-confirmation: client email error", resendErrorBody);
      return new Response(JSON.stringify({ error: "Failed to send confirmation email." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        reply_to: replyToEmail ? [replyToEmail] : undefined,
        subject: "New consultancy submission received",
        html: `
          <div style="font-family: Arial, sans-serif; color: #1f1f1f; line-height: 1.6; max-width: 620px; margin: 0 auto;">
            <h2 style="margin: 0 0 16px;">New consultancy submission</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Name</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeName}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Email</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeEmail}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Phone</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safePhone}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Project Type</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeProjectType}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Timeline</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeTimeline}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Preferred Date</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safePreferredDate}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Preferred Slot</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safePreferredSlot}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Message</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeMessage}</td></tr>
            </table>
          </div>
        `,
        text:
          "New consultancy submission\n\n" +
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Phone: ${phone}\n` +
          `Project Type: ${projectType}\n` +
          `Timeline: ${timeline}\n` +
          `Preferred Date: ${preferredDate}\n` +
          `Preferred Slot: ${preferredSlot}\n` +
          `Message: ${message}\n`,
      }),
    });

    if (!adminResponse.ok) {
      const resendErrorBody = await adminResponse.text();
      console.error("send-consultancy-confirmation: admin email error", resendErrorBody);
      return new Response(JSON.stringify({ error: "Failed to send admin notification email." }), {
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
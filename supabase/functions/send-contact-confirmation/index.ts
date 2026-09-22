declare const Deno: {
  env: { get: (key: string) => string | undefined };
  serve: (handler: (request: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactConfirmationBody {
  name?: string;
  email?: string;
  subject?: string;
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
    const body = (await request.json()) as ContactConfirmationBody;
    const name = body.name?.trim() || "there";
    const email = body.email?.trim();
    const subject = body.subject?.trim() || "General inquiry";
    const message = body.message?.trim() || "Not provided";

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("CONTACT_CONFIRMATION_FROM_EMAIL") ?? "Babel Designs <contact@getbabeldesigns.com>";
    const replyToEmail = Deno.env.get("CONTACT_CONFIRMATION_REPLY_TO");
    const adminEmail = Deno.env.get("CONTACT_NOTIFICATION_EMAIL") ?? "contact@getbabeldesigns.com";

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
        subject: "We received your message | Babel Designs",
        html: `
          <div style="font-family: Georgia, serif; line-height: 1.6; color: #1f1f1f; max-width: 620px; margin: 0 auto;">
            <h1 style="font-size: 28px; margin-bottom: 20px;">Babel Designs</h1>
            <p style="font-size: 16px; margin-bottom: 16px;">Hello ${safeName},</p>
            <p style="font-size: 16px; margin-bottom: 16px;">Thank you for reaching out. We've received your message and will get back to you within 48 hours.</p>
            <p style="font-size: 14px; color: #555;">Babel Designs<br />Design that unites all diversities.</p>
          </div>
        `,
        text:
          `Hello ${name},\n\n` +
          "Thank you for reaching out. We've received your message and will get back to you within 48 hours.\n\n" +
          "Babel Designs",
      }),
    });

    if (!clientResponse.ok) {
      const resendErrorBody = await clientResponse.text();
      console.error("send-contact-confirmation: client email error", resendErrorBody);
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
        reply_to: replyToEmail ? [replyToEmail] : [email],
        subject: `New contact message: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1f1f1f; line-height: 1.6; max-width: 620px; margin: 0 auto;">
            <h2 style="margin: 0 0 16px;">New contact message</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Name</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeName}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Email</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeEmail}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Subject</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeSubject}</td></tr>
              <tr><td style="padding: 6px 10px; font-weight: 600; border: 1px solid #e6e6e6;">Message</td><td style="padding: 6px 10px; border: 1px solid #e6e6e6;">${safeMessage}</td></tr>
            </table>
          </div>
        `,
        text:
          "New contact message\n\n" +
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Subject: ${subject}\n` +
          `Message: ${message}\n`,
      }),
    });

    if (!adminResponse.ok) {
      const resendErrorBody = await adminResponse.text();
      console.error("send-contact-confirmation: admin email error", resendErrorBody);
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
    console.error("send-contact-confirmation error", error);
    return new Response(JSON.stringify({ error: "Unexpected error while sending confirmation email." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

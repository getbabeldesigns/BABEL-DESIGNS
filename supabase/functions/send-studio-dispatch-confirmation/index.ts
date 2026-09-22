const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequestBody {
  email: string;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const body = (await request.json()) as ConfirmationRequestBody;
    const email = body.email?.trim();

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required." }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("STUDIO_DISPATCH_FROM_EMAIL") ?? "Babel Designs <contact@getbabeldesigns.com>";
    const replyToEmail = Deno.env.get("STUDIO_DISPATCH_REPLY_TO");

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY secret." }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
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
        subject: "Welcome to Studio Dispatch | Babel Designs",
        html: `
          <div style="font-family: Georgia, serif; line-height: 1.6; color: #1f1f1f; max-width: 600px; margin: 0 auto;">
            <h1 style="font-size: 28px; margin-bottom: 20px;">Babel Designs</h1>
            <p style="font-size: 16px; margin-bottom: 16px;">Thank you for subscribing to <strong>Studio Dispatch</strong>.</p>
            <p style="font-size: 16px; margin-bottom: 16px;">You will receive collection notes, material studies, and selected project stories from the atelier.</p>
            <p style="font-size: 16px; margin-bottom: 24px;">We are glad to have you with us.</p>
            <p style="font-size: 14px; color: #555;">Babel Designs<br />Design that unites all diversities.</p>
          </div>
        `,
        text: "Thank you for subscribing to Studio Dispatch. You will receive curated notes from Babel Designs.",
      }),
    });

    if (!resendResponse.ok) {
      const resendErrorBody = await resendResponse.text();
      console.error("Resend API error", resendErrorBody);
      return new Response(JSON.stringify({ error: "Failed to send confirmation email." }), {
        status: 502,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Confirmation email error", error);
    return new Response(JSON.stringify({ error: "Unexpected error while sending email." }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

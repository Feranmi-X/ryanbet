// Supabase Edge Function: send-withdrawal-email
//
// Sends a "withdrawal request received" confirmation email.
// Deploy with:
//   supabase functions deploy send-withdrawal-email
//   supabase secrets set RESEND_API_KEY=your_resend_api_key
//
// Swap the `sendEmail` implementation below if you use a different
// provider (SendGrid, Postmark, SES, etc).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_ADDRESS = Deno.env.get("WITHDRAWAL_EMAIL_FROM") || "RyanBet <noreply@yourdomain.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalEmailPayload {
  email: string;
  name?: string;
  amount?: number;
  method?: string;
}

function formatMoney(n: number | undefined) {
  if (typeof n !== "number" || isNaN(n)) return "";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildEmail(payload: WithdrawalEmailPayload) {
  const amountStr = formatMoney(payload.amount);
  const methodStr = payload.method ? ` via ${payload.method}` : "";
  const subject = "Withdrawal Request Received";
  const text =
    `Dear Customer,\n\n` +
    `We've received your withdrawal request${amountStr ? ` for ${amountStr}` : ""}${methodStr}.\n\n` +
    `Our team will review and respond within 24 hours.\n\n` +
    `Best regards,\n` +
    `Customer Support Team`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1a1d28;line-height:1.6;">
      <p>Dear Customer,</p>
      <p>We've received your withdrawal request${amountStr ? ` for <strong>${amountStr}</strong>` : ""}${methodStr}.</p>
      <p>Our team will review and respond within 24 hours.</p>
      <p>Best regards,<br/>Customer Support Team</p>
    </div>
  `;
  return { subject, text, html };
}

async function sendEmail(payload: WithdrawalEmailPayload) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const { subject, text, html } = buildEmail(payload);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [payload.email],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Email provider error (${res.status}): ${errText}`);
  }
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: WithdrawalEmailPayload = await req.json();

    if (!payload.email || typeof payload.email !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'email' field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await sendEmail(payload);

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
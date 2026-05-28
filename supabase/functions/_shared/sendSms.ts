/**
 * Shared SMS sender — uses Twilio REST API.
 *
 * Required Supabase secrets:
 *   TWILIO_ACCOUNT_SID  — from console.twilio.com
 *   TWILIO_AUTH_TOKEN   — from console.twilio.com
 *   TWILIO_FROM_NUMBER  — your Twilio phone number, e.g. +18041234567
 *   ALERT_SMS_TO        — ops phone number to receive alerts, e.g. +14257530838
 *
 * Usage:
 *   import { sendSms, getAlertSmsTo } from "../_shared/sendSms.ts";
 *   await sendSms("Your message here");
 *   await sendSms("Custom recipient message", "+12223334444");
 */

export function getAlertSmsTo(): string {
  return Deno.env.get("ALERT_SMS_TO") ?? "";
}

export async function sendSms(
  body: string,
  to?: string,
): Promise<{ ok: boolean; error?: string }> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken  = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from       = Deno.env.get("TWILIO_FROM_NUMBER");
  const recipient  = to ?? getAlertSmsTo();

  if (!accountSid || !authToken || !from) {
    return { ok: false, error: "Twilio env vars not set (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER)" };
  }
  if (!recipient) {
    return { ok: false, error: "No recipient: pass `to` param or set ALERT_SMS_TO env var" };
  }

  // Twilio limits SMS to 1600 chars; truncate gracefully
  const safeBody = body.slice(0, 1560);

  const params = new URLSearchParams({
    To:   recipient,
    From: from,
    Body: safeBody,
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Twilio ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

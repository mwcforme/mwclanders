// lead-notify — sends email to eobrien@menswellnesscenters.com on every new lead
// Triggered via Supabase Database Webhook on lead_captures INSERT
// Uses Resend API (or falls back to SMTP via fetch)

import { corsHeaders, jsonResponse as json, corsResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "invalid json" });
  }

  // Supabase DB webhook wraps the row in `record`
  const record = (payload.record ?? payload) as Record<string, unknown>;

  const name     = record.name     as string | null;
  const phone    = record.phone    as string | null;
  const email    = record.email    as string | null;
  const location = record.location as string | null;
  const source   = record.source   as string | null;
  const service  = record.service  as string | null;
  const status   = record.crm_status as string | null;
  const pageUrl  = record.page_url as string | null;
  const created  = record.created_at as string | null;
  const id       = record.id       as string | null;

  // Skip partial/non-lead rows if desired — keep for now, tag them
  const isPartial = status === "partial";

  const subject = isPartial
    ? `[MWC] Partial lead captured — ${name || phone || "Unknown"}`
    : `[MWC] New lead — ${name || "Unknown"} · ${location || "No location"} · ${source || ""}`;

  const bodyHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: Inter, Arial, sans-serif; background: #f9fafb; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="background: ${isPartial ? "#f97316" : "#0B1029"}; padding: 20px 28px;">
      <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 700; letter-spacing: 0.03em;">
        ${isPartial ? "Partial Lead Captured" : "New Lead"}
      </h1>
      <p style="color: rgba(255,255,255,0.70); font-size: 13px; margin: 4px 0 0;">${created ? new Date(created).toLocaleString("en-US", { timeZone: "America/New_York" }) + " ET" : ""}</p>
    </div>
    <div style="padding: 24px 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 110px;">Name</td><td style="padding: 6px 0; font-weight: 600; color: #0b1029;">${name || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Phone</td><td style="padding: 6px 0; font-weight: 600; color: #0b1029;"><a href="tel:${phone?.replace(/\D/g, "") || ""}" style="color: #e8670a;">${phone || "—"}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Email</td><td style="padding: 6px 0; color: #0b1029;">${email ? `<a href="mailto:${email}" style="color: #e8670a;">${email}</a>` : "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Location</td><td style="padding: 6px 0; color: #0b1029;">${location || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Service</td><td style="padding: 6px 0; color: #0b1029;">${service || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Source</td><td style="padding: 6px 0; color: #0b1029;">${source || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">CRM Status</td><td style="padding: 6px 0; color: #0b1029;">${status || "—"}</td></tr>
        ${pageUrl ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Page</td><td style="padding: 6px 0; font-size: 12px; color: #6b7280;">${pageUrl}</td></tr>` : ""}
      </table>

      ${id ? `
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
        <a href="https://book.menswellnesscenters.com/admin/leads"
           style="display: inline-block; background: #e8670a; color: #ffffff; font-weight: 700; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
          View in Admin
        </a>
      </div>` : ""}
    </div>
  </div>
</body>
</html>`;

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.warn("[lead-notify] RESEND_API_KEY not set — skipping email");
    return json(200, { ok: true, skipped: "no api key" });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MWC Leads <leads@book.menswellnesscenters.com>",
        to: ["eobrien@menswellnesscenters.com"],
        subject,
        html: bodyHtml,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[lead-notify] resend error", data);
      return json(502, { ok: false, error: data });
    }

    return json(200, { ok: true, email_id: data.id });
  } catch (e) {
    console.error("[lead-notify] fetch error", e);
    return json(502, { ok: false, error: (e as Error).message });
  }
});

// lead-notify — fires on every lead_captures INSERT via Supabase DB webhook
// Sends a structured notification email to eobrien@menswellnesscenters.com

import { jsonResponse as json, corsResponse } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/sendEmail.ts";

const log = {
  info:  (msg: string, d?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info",  fn: "lead-notify", msg, ts: new Date().toISOString(), ...d })),
  warn:  (msg: string, d?: Record<string, unknown>) => console.warn(JSON.stringify({ level: "warn",  fn: "lead-notify", msg, ts: new Date().toISOString(), ...d })),
  error: (msg: string, d?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", fn: "lead-notify", msg, ts: new Date().toISOString(), ...d })),
};

function cell(label: string, value: string | null | undefined, href?: string) {
  const display = value || "—";
  const content = href && value
    ? `<a href="${href}" style="color:#e8670a;text-decoration:none;">${display}</a>`
    : `<span style="color:${value ? "#111827" : "#9ca3af"};font-weight:${value ? "600" : "400"};">${display}</span>`;
  return `<tr>
    <td style="padding:6px 0;color:#6b7280;font-size:13px;width:130px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:13px;">${content}</td>
  </tr>`;
}

function block(title: string, rows: string) {
  return `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#9ca3af;margin:0 0 8px;">${title}</p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  let payload: Record<string, unknown>;
  try { payload = await req.json(); }
  catch { return json(400, { error: "invalid json" }); }

  const record = (payload.record ?? payload) as Record<string, unknown>;

  const name      = record.name        as string | null;
  const phone     = record.phone       as string | null;
  const email     = record.email       as string | null;
  const location  = record.location    as string | null;
  const source    = record.source      as string | null;
  const service   = record.service     as string | null;
  const status    = record.crm_status  as string | null;
  const pageUrl   = record.page_url    as string | null;
  const created   = record.created_at  as string | null;
  const id        = record.id          as string | null;
  const contactId = record.crm_contact_id as string | null;
  const tags      = record.tags        as string[] | null;
  const attr      = record.attribution as Record<string, string> | null;

  const isPartial = status === "partial";
  const isFailed  = status === "failed";

  const timeET = created
    ? new Date(created).toLocaleString("en-US", {
        timeZone: "America/New_York",
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      }) + " ET"
    : "";

  // ── Subject line: specific and actionable ─────────────────────────────────
  const locationLabel = location
    ? ({ richmond: "Richmond", "virginia-beach": "Virginia Beach", "newport-news": "Newport News" }[location] ?? location)
    : null;
  const serviceLabel = service
    ? ({ trt: "TRT", ed: "ED", wl: "Weight Loss" }[service] ?? service)
    : null;

  const subject = isFailed
    ? `ACTION NEEDED — GHL failed for ${name || phone || "unknown lead"} (${locationLabel ?? "?"})`
    : isPartial
    ? `Partial lead — ${name || phone || "Unknown"} left without booking`
    : `New ${serviceLabel ?? ""} lead — ${name || "Unknown"} · ${locationLabel ?? "?"} · ${timeET}`;

  // ── Header color by status ────────────────────────────────────────────────
  const headerBg = isFailed ? "#dc2626" : isPartial ? "#f97316" : "#0B1029";
  const headerLabel = isFailed ? "GHL Submission Failed — Action Required" : isPartial ? "Partial Lead" : "New Lead";

  // ── Attribution fields ────────────────────────────────────────────────────
  const utmSource   = attr?.utm_source   || null;
  const utmMedium   = attr?.utm_medium   || null;
  const utmCampaign = attr?.utm_campaign || null;
  const gclid       = attr?.gclid        || null;
  const fbclid      = attr?.fbclid       || null;

  const bodyHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;padding:24px;margin:0;">
<div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

  <div style="background:${headerBg};padding:18px 24px;">
    <h1 style="color:#fff;font-size:17px;margin:0;font-weight:700;">${headerLabel}</h1>
    <p style="color:rgba(255,255,255,0.75);font-size:12px;margin:4px 0 0;">${timeET}</p>
  </div>

  <div style="padding:20px 24px;">

    ${block("Contact", `
      ${cell("Name", name)}
      ${cell("Phone", phone ? phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : null, phone ? `tel:${phone.replace(/\D/g,"")}` : undefined)}
      ${cell("Email", email, email ? `mailto:${email}` : undefined)}
    `)}

    ${block("Appointment Intent", `
      ${cell("Location", locationLabel)}
      ${cell("Service", serviceLabel)}
      ${cell("Source", source)}
      ${cell("Page", pageUrl, pageUrl ?? undefined)}
    `)}

    ${block("CRM Status", `
      ${cell("Status", status)}
      ${cell("GHL Contact", contactId, contactId ? `https://app.gohighlevel.com/contacts/${contactId}` : undefined)}
      ${tags?.length ? cell("Tags", tags.join(", ")) : ""}
    `)}

    ${(utmSource || gclid || fbclid) ? block("Ad Attribution", `
      ${cell("UTM Source", utmSource)}
      ${cell("UTM Medium", utmMedium)}
      ${cell("UTM Campaign", utmCampaign)}
      ${gclid ? cell("Google Click ID", gclid) : ""}
      ${fbclid ? cell("Meta Click ID", fbclid) : ""}
    `) : ""}

    ${isFailed ? `<div style="margin-top:16px;padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
      <p style="color:#dc2626;font-weight:700;font-size:13px;margin:0 0 4px;">Lead saved to database. GHL contact was NOT created.</p>
      <p style="color:#7f1d1d;font-size:13px;margin:0;">Open the admin panel to manually create the GHL contact for this lead.</p>
    </div>` : ""}

    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;display:flex;gap:10px;flex-wrap:wrap;">
      ${phone ? `<a href="tel:${phone.replace(/\D/g,"")}" style="display:inline-block;background:#e8670a;color:#fff;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">Call ${phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</a>` : ""}
      ${contactId ? `<a href="https://app.gohighlevel.com/contacts/${contactId}" style="display:inline-block;background:#0b1029;color:#fff;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">Open in GHL</a>` : ""}
      <a href="https://book.menswellnesscenters.com/admin/leads" style="display:inline-block;background:#fff;border:1px solid #e5e7eb;color:#374151;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">Admin Panel</a>
    </div>

  </div>
</div>
</body>
</html>`;

  const result = await sendEmail({
    to: "eobrien@menswellnesscenters.com",
    subject,
    html: bodyHtml,
  });

  if (!result.ok) {
    log.error("sendgrid error", { error: result.error, subject });
    return json(502, { ok: false, error: result.error });
  }

  log.info("email sent", { subject });
  return json(200, { ok: true });
});

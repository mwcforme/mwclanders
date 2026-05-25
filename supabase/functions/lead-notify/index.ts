// lead-notify — sends email to eobrien@menswellnesscenters.com on every new lead
// Triggered via Supabase Database Webhook on lead_captures INSERT
// Uses Resend API

import { corsHeaders, jsonResponse as json, corsResponse } from "../_shared/cors.ts";

const log = {
  info:  (msg: string, data?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info",  fn: "lead-notify", msg, ts: new Date().toISOString(), ...data })),
  warn:  (msg: string, data?: Record<string, unknown>) => console.warn(JSON.stringify({ level: "warn",  fn: "lead-notify", msg, ts: new Date().toISOString(), ...data })),
  error: (msg: string, data?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", fn: "lead-notify", msg, ts: new Date().toISOString(), ...data })),
};

function row(label: string, value: string | null | undefined, link?: string) {
  if (!value) return `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;width:130px;vertical-align:top">${label}</td><td style="padding:5px 0;color:#9ca3af;font-size:13px;">—</td></tr>`;
  const cell = link
    ? `<a href="${link}" style="color:#e8670a;text-decoration:none;">${value}</a>`
    : `<span style="color:#0b1029;">${value}</span>`;
  return `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;width:130px;vertical-align:top">${label}</td><td style="padding:5px 0;font-weight:600;">${cell}</td></tr>`;
}

function section(title: string, content: string) {
  return `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;">
      <p style="font-size:11px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#9ca3af;margin:0 0 8px;">${title}</p>
      <table style="width:100%;border-collapse:collapse;">${content}</table>
    </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "invalid json" });
  }

  const record = (payload.record ?? payload) as Record<string, unknown>;

  const name       = record.name        as string | null;
  const phone      = record.phone       as string | null;
  const email      = record.email       as string | null;
  const location   = record.location    as string | null;
  const source     = record.source      as string | null;
  const service    = record.service     as string | null;
  const status     = record.crm_status  as string | null;
  const pageUrl    = record.page_url    as string | null;
  const created    = record.created_at  as string | null;
  const id         = record.id          as string | null;
  const contactId  = record.crm_contact_id as string | null;
  const tags       = record.tags        as string[] | null;
  const attr       = record.attribution as Record<string, string> | null;

  const isPartial  = status === "partial";
  const isFailed   = status === "failed";

  const statusColor = isFailed ? "#dc2626" : isPartial ? "#f97316" : "#0B1029";
  const statusLabel = isFailed ? "GHL FAILED" : isPartial ? "Partial Lead" : "New Lead";

  const formattedTime = created
    ? new Date(created).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) + " ET"
    : "";

  const subject = isFailed
    ? `[MWC ALERT] GHL failed — ${name || phone || "Unknown"}`
    : isPartial
    ? `[MWC] Partial lead — ${name || phone || "Unknown"}`
    : `[MWC] New lead — ${name || "Unknown"} · ${location || "?"} · ${service || source || ""}`;

  // ── Attribution metadata ─────────────────────────────────────────────────
  const utmSource   = attr?.utm_source   || null;
  const utmMedium   = attr?.utm_medium   || null;
  const utmCampaign = attr?.utm_campaign || null;
  const utmContent  = attr?.utm_content  || null;
  const utmTerm     = attr?.utm_term     || null;
  const gclid       = attr?.gclid        || null;
  const fbclid      = attr?.fbclid       || null;
  const msclkid     = attr?.msclkid      || null;
  const pageId      = attr?.page_id      || null;

  const hasAttribution = utmSource || gclid || fbclid || msclkid;

  const bodyHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;padding:24px;margin:0;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

  <!-- Header -->
  <div style="background:${statusColor};padding:18px 24px;">
    <h1 style="color:#fff;font-size:17px;margin:0;font-weight:700;letter-spacing:0.02em;">${statusLabel}</h1>
    <p style="color:rgba(255,255,255,0.75);font-size:12px;margin:4px 0 0;">${formattedTime}</p>
  </div>

  <div style="padding:20px 24px;">

    <!-- Contact -->
    ${section("Contact", `
      ${row("Name", name)}
      ${row("Phone", phone ? phone.replace(/\D/g,"").replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "($2) $3-$4") : null, phone ? `tel:${phone.replace(/\D/g,"")}` : undefined)}
      ${row("Email", email, email ? `mailto:${email}` : undefined)}
    `)}

    <!-- Intent -->
    ${section("Intent", `
      ${row("Location", location)}
      ${row("Service", service)}
      ${row("Source", source)}
      ${row("Page URL", pageUrl, pageUrl ?? undefined)}
    `)}

    <!-- CRM -->
    ${section("CRM", `
      ${row("Status", status)}
      ${row("GHL Contact ID", contactId, contactId ? `https://app.gohighlevel.com/contacts/${contactId}` : undefined)}
      ${row("Capture ID", id)}
      ${tags?.length ? row("Tags", tags.join(", ")) : ""}
    `)}

    <!-- Attribution -->
    ${hasAttribution ? section("Attribution", `
      ${row("UTM Source", utmSource)}
      ${row("UTM Medium", utmMedium)}
      ${row("UTM Campaign", utmCampaign)}
      ${row("UTM Content", utmContent)}
      ${row("UTM Term", utmTerm)}
      ${row("GCLID", gclid)}
      ${row("FBCLID", fbclid)}
      ${row("MSCLKID", msclkid)}
      ${row("Page ID", pageId)}
    `) : ""}

    ${isFailed ? `
    <div style="margin-top:16px;padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
      <p style="color:#dc2626;font-weight:700;font-size:13px;margin:0 0 4px;">GHL submission failed</p>
      <p style="color:#7f1d1d;font-size:13px;margin:0;">Lead saved to database. Manual GHL contact creation required.</p>
    </div>` : ""}

    <!-- Actions -->
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;display:flex;gap:10px;flex-wrap:wrap;">
      <a href="https://book.menswellnesscenters.com/admin/leads"
         style="display:inline-block;background:#e8670a;color:#fff;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">
        View in Admin
      </a>
      ${contactId ? `<a href="https://app.gohighlevel.com/contacts/${contactId}"
         style="display:inline-block;background:#0b1029;color:#fff;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">
        Open in GHL
      </a>` : ""}
      ${phone ? `<a href="tel:${phone.replace(/\D/g,"")}"
         style="display:inline-block;background:#fff;color:#0b1029;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;border:1px solid #e5e7eb;">
        Call ${phone}
      </a>` : ""}
    </div>

  </div>
</div>
</body>
</html>`;

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    log.warn("RESEND_API_KEY not set — skipping email");
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
      log.error("resend API error", { status: res.status, body: JSON.stringify(data) });
      return json(502, { ok: false, error: data });
    }
    log.info("email sent", { email_id: data.id, subject });
    return json(200, { ok: true, email_id: data.id });
  } catch (e) {
    log.error("fetch error", { error: (e as Error).message });
    return json(502, { ok: false, error: (e as Error).message });
  }
});

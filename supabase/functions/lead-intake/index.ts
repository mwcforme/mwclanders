// lead-intake — headless intake for external form posts (WordPress / Gravity
// Forms, generic JSON, partner sites). Persists every submission to
// `lead_captures` first, then forwards to GHL CRM. Zero-data-loss guarantee.

import { mapToCanonical, splitName, type CanonicalLead } from "./mapping.ts";
import { corsHeadersFor, jsonResponse, corsResponse } from "../_shared/cors.ts";
import { tryGetGhlCreds, GHL_API_BASE, GHL_API_VERSION } from "../_shared/ghlEnv.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { sendEmail } from "../_shared/sendEmail.ts";

// ---- Structured logger ----
const log = {
  info:  (msg: string, data?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info",  fn: "lead-intake", msg, ts: new Date().toISOString(), ...data })),
  warn:  (msg: string, data?: Record<string, unknown>) => console.warn(JSON.stringify({ level: "warn",  fn: "lead-intake", msg, ts: new Date().toISOString(), ...data })),
  error: (msg: string, data?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", fn: "lead-intake", msg, ts: new Date().toISOString(), ...data })),
};

// ---- Failure alert via SendGrid ----
async function sendFailureAlert(opts: {
  captureId: string;
  name: string;
  phone: string;
  error: string;
  env: string;
}): Promise<void> {
  try {
    await sendEmail({
      to: "eobrien@menswellnesscenters.com",
      subject: `[MWC ALERT] GHL lead submission failed — ${opts.name || opts.phone}`,
      html: `<div style="font-family:Arial,sans-serif;padding:24px;">
        <h2 style="color:#dc2626;margin:0 0 16px">GHL Lead Submission Failed</h2>
        <p><strong>Capture ID:</strong> ${opts.captureId}</p>
        <p><strong>Name:</strong> ${opts.name || "—"}</p>
        <p><strong>Phone:</strong> ${opts.phone || "—"}</p>
        <p><strong>Error:</strong> <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px">${opts.error}</code></p>
        <p style="margin-top:20px">The lead was saved to the database. <a href="https://book.menswellnesscenters.com/admin/leads" style="color:#e8670a">View in Admin</a> and manually create the GHL contact.</p>
      </div>`,
    });
  } catch (e) {
    log.warn("failure alert email error", { error: (e as Error).message });
  }
}

// ---- Rate limit (best-effort, in-memory; per-instance) ----
const RL_WINDOW_MS = 60_000;
const RL_MAX = 10;
const rlMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const cur = rlMap.get(ip);
  if (!cur || cur.resetAt < now) {
    rlMap.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return true;
  }
  if (cur.count >= RL_MAX) return false;
  cur.count++;
  return true;
}

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();
  if (ct.includes("application/json")) {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  }
  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const out: Record<string, unknown> = {};
    for (const [k, v] of form.entries()) {
      out[k] = typeof v === "string" ? v : v.name;
    }
    return out;
  }
  // Fallback: try urlencoded.
  const text = await req.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return Object.fromEntries(new URLSearchParams(text).entries());
  }
}

function validate(c: CanonicalLead): { ok: true } | { ok: false; error: string } {
  if (!c.fullName || c.fullName.length < 2 || c.fullName.length > 200) {
    return { ok: false, error: "fullName required (2-200 chars)" };
  }
  if (!c.email && !c.phone) return { ok: false, error: "email or phone required" };
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
    return { ok: false, error: "invalid email" };
  }
  if (c.email && c.email.length > 255) return { ok: false, error: "email too long" };
  if (c.phone) {
    if (c.phone.length > 40) return { ok: false, error: "phone too long" };
    if (!/^\+?[\d\s\-().]{7,20}$/.test(c.phone)) return { ok: false, error: "invalid phone format" };
  }
  if (c.location && c.location.length > 100) return { ok: false, error: "location too long" };
  // Consent is required — reject if falsy
  const consent = c.consent;
  if (consent !== true && consent !== "true" && consent !== "1" && consent !== 1) {
    return { ok: false, error: "consent required" };
  }
  return { ok: true };
}

async function forwardToGhl(c: CanonicalLead, accessToken: string, locationId: string): Promise<{ contactId: string }> {
  const { firstName, lastName } = splitName(c.fullName);
  const tags = ["external-intake"];
  if (c.form_source_label) tags.push(`form:${c.form_source_label}`);
  if (c.utm_source) tags.push(`utm_source:${c.utm_source}`);
  if (c.location) tags.push(`location:${c.location}`);

  const payload = {
    firstName,
    ...(lastName ? { lastName } : {}),
    ...(c.email ? { email: c.email } : {}),
    ...(c.phone ? { phone: c.phone } : {}),
    locationId,
    source: c.form_source_label ?? "wordpress-intake",
    tags,
  };

  const res = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GHL ${res.status}: ${text.slice(0, 500)}`);
  const data = JSON.parse(text);
  const contactId = data?.contact?.id ?? data?.id;
  if (!contactId) throw new Error("GHL response missing contact id");
  return { contactId };
}

Deno.serve(async (req) => {
  // Correlation ID — propagated through all downstream calls
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  if (req.method === "OPTIONS") return corsResponse(req);
  if (req.method !== "POST") return jsonResponse(405, { ok: false, error: "method not allowed" }, req);

  // Body size guard — reject oversized payloads (DoS protection)
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > 10_240) return jsonResponse(413, { ok: false, error: "payload too large" }, req);

  // Optional shared-secret check (required if LEAD_INTAKE_TOKEN env var is set)
  const expectedToken = Deno.env.get("LEAD_INTAKE_TOKEN");
  if (expectedToken) {
    const got = req.headers.get("x-intake-token") ?? "";
    if (got !== expectedToken) return jsonResponse(401, { ok: false, error: "unauthorized" }, req);
  }

  // Rate limit — use last IP in X-Forwarded-For chain (trusted proxy sets this)
  const xffChain = req.headers.get("x-forwarded-for") ?? "";
  const ips = xffChain.split(",").map(s => s.trim()).filter(Boolean);
  const ip = ips[ips.length - 1] ?? "unknown";
  if (!rateLimit(ip)) return jsonResponse(429, { ok: false, error: "rate limit exceeded" }, req);

  let raw: Record<string, unknown>;
  try {
    raw = await parseBody(req);
  } catch (e) {
    return jsonResponse(400, { ok: false, error: `bad body: ${(e as Error).message}` }, req);
  }

  const referer = req.headers.get("referer") ?? undefined;
  const canonical = mapToCanonical(raw, referer);

  // Honeypot — silently accept and drop
  if (canonical.honeypot && canonical.honeypot.length > 0) {
    return jsonResponse(200, { ok: true, dropped: "honeypot" }, req);
  }

  const v = validate(canonical);
  if (!v.ok) return jsonResponse(400, { ok: false, error: v.error }, req);

  // ---- Persist FIRST (zero data loss) ----
  const supabase = createAdminClient();

  const tags: string[] = [];
  if (canonical.form_source_label) tags.push(`form:${canonical.form_source_label}`);
  if (canonical.utm_source) tags.push(`utm_source:${canonical.utm_source}`);

  const captureRow = {
    name: canonical.fullName,
    phone: canonical.phone ?? null,
    email: canonical.email ?? null,
    location: canonical.location ?? null,
    service: canonical.service ?? null,
    source: canonical.form_source_label ?? "wordpress-intake",
    page_url: canonical.landing_page_url ?? null,
    tags: tags.length ? tags : null,
    attribution: {
      utm_source: canonical.utm_source,
      utm_medium: canonical.utm_medium,
      utm_campaign_id: canonical.utm_campaign_id,
      utm_adgroup_id: canonical.utm_adgroup_id,
      gclid: canonical.gclid,
      fbclid: canonical.fbclid,
      consent: canonical.consent,
      ip,
      referer,
      raw: canonical.raw,
    },
    crm_status: "pending",
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("lead_captures")
    .insert(captureRow)
    .select("id")
    .single();

  if (insertErr || !inserted) {
    log.error("db insert failed", { error: insertErr?.message, request_id: requestId });
    return jsonResponse(500, { ok: false, error: "failed to persist lead" }, req);
  }
  const captureId = inserted.id as string;

  // ---- Forward to GHL (env-aware) ----
  const creds = tryGetGhlCreds();
  if (!creds) {
    await supabase
      .from("lead_captures")
      .update({ crm_status: "failed", crm_error: "GHL credentials not configured" })
      .eq("id", captureId);
    return jsonResponse(502, { ok: false, capture_id: captureId, error: "CRM not configured" }, req);
  }
  const appEnv = "prod";
  const { apiKey: ghlToken, locationId: ghlLocationId } = creds;

  try {
    const { contactId } = await forwardToGhl(canonical, ghlToken, ghlLocationId);
    await supabase
      .from("lead_captures")
      .update({ crm_status: "synced", crm_contact_id: contactId })
      .eq("id", captureId);

    // ---- Issue a short-lived funnel handoff token ----
    // Allows WordPress (or any external site) to redirect the user into the
    // booking funnel with their identity pre-seeded — no PHI in the URL.
    const { firstName, lastName } = splitName(canonical.fullName);
    const funnelBase = Deno.env.get("FUNNEL_BASE_URL") ?? "https://book.menswellnesscenters.com";
    let funnelUrl: string | null = null;

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("wp_intake_tokens")
      .insert({
        capture_id: captureId,
        contact_id: contactId,
        first_name: firstName,
        last_name: lastName ?? null,
        email: canonical.email ?? null,
        phone: canonical.phone ?? "",
        location: canonical.location ?? null,
        service: canonical.service ?? null,
        source: canonical.form_source_label ?? "wordpress-intake",
      })
      .select("token")
      .single();

    if (!tokenErr && tokenRow?.token) {
      funnelUrl = `${funnelBase}/book/entry?t=${tokenRow.token}`;
    } else {
      log.warn("token insert failed", { error: tokenErr?.message });
    }

    // Fire lead notification email (fire-and-forget — never block the response)
    const locationLabel: Record<string, string> = { richmond: "Richmond", "virginia-beach": "Virginia Beach", "newport-news": "Newport News" };
    const serviceLabel: Record<string, string> = { trt: "TRT", ed: "ED", wl: "Weight Loss" };
    const locName = locationLabel[canonical.location ?? ""] ?? canonical.location ?? "?";
    const svcName = serviceLabel[canonical.service ?? ""] ?? canonical.service ?? "";
    const timeET = new Date().toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) + " ET";
    // firstName already declared above (line: const { firstName, lastName } = splitName(...))
    void sendEmail({
      to: "eobrien@menswellnesscenters.com",
      subject: `New ${svcName} lead \u2014 ${canonical.fullName || "Unknown"} \u00b7 ${locName} \u00b7 ${timeET}`,
      html: `<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
  <div style="background:#0B1029;padding:16px 24px;">
    <h1 style="color:#fff;font-size:17px;margin:0;font-weight:700;">New ${svcName} Lead</h1>
    <p style="color:rgba(255,255,255,0.70);font-size:12px;margin:4px 0 0;">${timeET}</p>
  </div>
  <div style="padding:20px 24px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;width:110px;">Name</td><td style="padding:5px 0;font-weight:600;color:#111827;font-size:13px;">${canonical.fullName || "\u2014"}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Phone</td><td style="padding:5px 0;font-size:13px;"><a href="tel:${(canonical.phone ?? "").replace(/\D/g,"")}" style="color:#e8670a;text-decoration:none;font-weight:600;">${canonical.phone || "\u2014"}</a></td></tr>
      <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:5px 0;font-size:13px;">${canonical.email ? `<a href="mailto:${canonical.email}" style="color:#e8670a;text-decoration:none;">${canonical.email}</a>` : "\u2014"}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Location</td><td style="padding:5px 0;font-weight:600;color:#111827;font-size:13px;">${locName}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Service</td><td style="padding:5px 0;font-weight:600;color:#111827;font-size:13px;">${svcName}</td></tr>
      <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Source</td><td style="padding:5px 0;color:#111827;font-size:13px;">${canonical.form_source_label || "\u2014"}</td></tr>
      ${canonical.utm_source ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">UTM Source</td><td style="padding:5px 0;color:#111827;font-size:13px;">${canonical.utm_source}</td></tr>` : ""}
      ${canonical.utm_campaign_id ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Campaign</td><td style="padding:5px 0;color:#111827;font-size:13px;">${canonical.utm_campaign_id}</td></tr>` : ""}
      ${canonical.gclid ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">GCLID</td><td style="padding:5px 0;color:#111827;font-size:13px;">${canonical.gclid}</td></tr>` : ""}
    </table>
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
      ${canonical.phone ? `<a href="tel:${(canonical.phone ?? "").replace(/\D/g,"")}" style="display:inline-block;background:#e8670a;color:#fff;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">Call ${canonical.phone}</a>` : ""}
      ${contactId ? `<a href="https://app.gohighlevel.com/contacts/${contactId}" style="display:inline-block;background:#0b1029;color:#fff;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">Open in GHL</a>` : ""}
    </div>
  </div>
</div>
</body></html>`,
    }).catch((e) => log.warn("lead notify email error", { error: (e as Error).message }));

    return jsonResponse(200, {
      ok: true,
      capture_id: captureId,
      crm_contact_id: contactId,
      request_id: requestId,
      ...(funnelUrl ? { funnel_url: funnelUrl } : {}),
    }, req);
  } catch (e) {
    const msg = (e as Error).message ?? "GHL forward failed";
    log.error("ghl forward failed", { capture_id: captureId, error: msg, env: appEnv, request_id: requestId });
    await supabase
      .from("lead_captures")
      .update({ crm_status: "failed", crm_error: msg.slice(0, 500) })
      .eq("id", captureId);
    // Fire immediate failure alert so lead is not silently lost
    await sendFailureAlert({
      captureId,
      name: canonical.fullName,
      phone: canonical.phone ?? "",
      error: msg,
      env: appEnv,
    });
    return jsonResponse(502, { ok: false, capture_id: captureId, error: msg, request_id: requestId }, req);
  }
});

// lead-intake — headless intake for external form posts (WordPress / Gravity
// Forms, generic JSON, partner sites). Persists every submission to
// `lead_captures` first, then forwards to GHL CRM. Zero-data-loss guarantee.

import { mapToCanonical, splitName, type CanonicalLead } from "./mapping.ts";
import { corsHeaders, jsonResponse, corsResponse } from "../_shared/cors.ts";
import { detectEnv, tryGetGhlCreds, GHL_API_BASE, GHL_API_VERSION } from "../_shared/ghlEnv.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";

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
  if (c.phone && c.phone.length > 40) return { ok: false, error: "phone too long" };
  if (c.location && c.location.length > 100) return { ok: false, error: "location too long" };
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
  if (req.method === "OPTIONS") return corsResponse();
  if (req.method !== "POST") return jsonResponse(405, { ok: false, error: "method not allowed" });

  // Optional shared-secret check
  const expectedToken = Deno.env.get("LEAD_INTAKE_TOKEN");
  if (expectedToken) {
    const got = req.headers.get("x-intake-token") ?? "";
    if (got !== expectedToken) return jsonResponse(401, { ok: false, error: "unauthorized" });
  }

  // Rate limit by client IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(ip)) return jsonResponse(429, { ok: false, error: "rate limit exceeded" });

  let raw: Record<string, unknown>;
  try {
    raw = await parseBody(req);
  } catch (e) {
    return jsonResponse(400, { ok: false, error: `bad body: ${(e as Error).message}` });
  }

  const referer = req.headers.get("referer") ?? undefined;
  const canonical = mapToCanonical(raw, referer);

  // Honeypot — silently accept and drop
  if (canonical.honeypot && canonical.honeypot.length > 0) {
    return jsonResponse(200, { ok: true, dropped: "honeypot" });
  }

  const v = validate(canonical);
  if (!v.ok) return jsonResponse(400, { ok: false, error: v.error });

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
    console.error("[lead-intake] db insert failed", insertErr);
    return jsonResponse(500, { ok: false, error: "failed to persist lead" });
  }
  const captureId = inserted.id as string;

  // ---- Forward to GHL (env-aware) ----
  const appEnv = detectEnv(req, (raw as Record<string, unknown>).__env);
  const creds = tryGetGhlCreds(appEnv);
  if (!creds) {
    await supabase
      .from("lead_captures")
      .update({ crm_status: "failed", crm_error: `GHL ${appEnv} credentials not configured` })
      .eq("id", captureId);
    return jsonResponse(502, { ok: false, capture_id: captureId, error: "CRM not configured" });
  }
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
      console.warn("[lead-intake] token insert failed", tokenErr);
    }

    return jsonResponse(200, {
      ok: true,
      capture_id: captureId,
      crm_contact_id: contactId,
      ...(funnelUrl ? { funnel_url: funnelUrl } : {}),
    });
  } catch (e) {
    const msg = (e as Error).message ?? "GHL forward failed";
    console.error("[lead-intake] ghl forward failed", msg);
    await supabase
      .from("lead_captures")
      .update({ crm_status: "failed", crm_error: msg.slice(0, 500) })
      .eq("id", captureId);
    return jsonResponse(502, { ok: false, capture_id: captureId, error: msg });
  }
});

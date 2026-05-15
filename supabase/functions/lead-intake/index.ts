// lead-intake — headless intake for external form posts (WordPress / Gravity
// Forms, generic JSON, partner sites). Persists every submission to
// `lead_captures` first, then forwards to GHL CRM. Zero-data-loss guarantee.

import { createClient } from "npm:@supabase/supabase-js@2";
import { mapToCanonical, splitName, type CanonicalLead } from "./mapping.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-intake-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

// ---- GHL config (mirrors ghl-proxy) ----
const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";
const PROD_LOCATION_ID = "Ghstz8eIsHWLeXek47dk";

type AppEnv = "prod" | "stage";
const PROD_HOSTS = new Set<string>([
  "book.menswellnesscenters.com",
  "menswellnesscenters.com",
  "www.menswellnesscenters.com",
]);
function detectEnv(req: Request, hint?: unknown): AppEnv {
  if (hint === "prod" || hint === "stage") return hint;
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (PROD_HOSTS.has(host)) return "prod";
  } catch { /* ignore */ }
  return "stage";
}
function envCreds(env: AppEnv) {
  if (env === "stage") {
    return {
      apiKey: Deno.env.get("GHL_API_KEY_STAGE"),
      locationId: Deno.env.get("GHL_LOCATION_ID_STAGE") ?? "",
    };
  }
  return {
    apiKey: Deno.env.get("GHL_API_KEY"),
    locationId: Deno.env.get("GHL_LOCATION_ID") ?? PROD_LOCATION_ID,
  };
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
  const data = JSON.parse(text);
  const contactId = data?.contact?.id ?? data?.id;
  if (!contactId) throw new Error("GHL response missing contact id");
  return { contactId };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { ok: false, error: "method not allowed" });

  // Optional shared-secret check
  const expectedToken = Deno.env.get("LEAD_INTAKE_TOKEN");
  if (expectedToken) {
    const got = req.headers.get("x-intake-token") ?? "";
    if (got !== expectedToken) return json(401, { ok: false, error: "unauthorized" });
  }

  // Rate limit by client IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(ip)) return json(429, { ok: false, error: "rate limit exceeded" });

  let raw: Record<string, unknown>;
  try {
    raw = await parseBody(req);
  } catch (e) {
    return json(400, { ok: false, error: `bad body: ${(e as Error).message}` });
  }

  const referer = req.headers.get("referer") ?? undefined;
  const canonical = mapToCanonical(raw, referer);

  // Honeypot — silently accept and drop
  if (canonical.honeypot && canonical.honeypot.length > 0) {
    return json(200, { ok: true, dropped: "honeypot" });
  }

  const v = validate(canonical);
  if (!v.ok) return json(400, { ok: false, error: v.error });

  // ---- Persist FIRST (zero data loss) ----
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

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
    return json(500, { ok: false, error: "failed to persist lead" });
  }
  const captureId = inserted.id as string;

  // ---- Forward to GHL (env-aware) ----
  const appEnv = detectEnv(req, (raw as Record<string, unknown>).__env);
  const { apiKey: ghlToken, locationId: ghlLocationId } = envCreds(appEnv);
  if (!ghlToken || !ghlLocationId) {
    await supabase
      .from("lead_captures")
      .update({ crm_status: "failed", crm_error: `GHL ${appEnv} credentials not configured` })
      .eq("id", captureId);
    return json(502, { ok: false, capture_id: captureId, error: "CRM not configured" });
  }

  try {
    const { contactId } = await forwardToGhl(canonical, ghlToken, ghlLocationId);
    await supabase
      .from("lead_captures")
      .update({ crm_status: "synced", crm_contact_id: contactId })
      .eq("id", captureId);
    return json(200, { ok: true, capture_id: captureId, crm_contact_id: contactId });
  } catch (e) {
    const msg = (e as Error).message ?? "GHL forward failed";
    console.error("[lead-intake] ghl forward failed", msg);
    await supabase
      .from("lead_captures")
      .update({ crm_status: "failed", crm_error: msg.slice(0, 500) })
      .eq("id", captureId);
    return json(502, { ok: false, capture_id: captureId, error: msg });
  }
});

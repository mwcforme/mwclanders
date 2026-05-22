// Meta Conversions API + GA4 Measurement Protocol mirror.
// Public endpoint (no JWT). Validates input, hashes PII, dedupes via event_id.
import { z } from "npm:zod@3.23.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
const CAPI_TOKEN = Deno.env.get("META_CAPI_TOKEN");
const TEST_CODE = Deno.env.get("META_TEST_EVENT_CODE"); // optional
const GA4_MEASUREMENT_ID = Deno.env.get("GA4_MEASUREMENT_ID"); // e.g. G-KHD64CYC2G
const GA4_API_SECRET = Deno.env.get("GA4_API_SECRET"); // optional

const STANDARD_EVENTS = [
  "Lead",
  "Schedule",
  "InitiateCheckout",
  "ViewContent",
  "CompleteRegistration",
  "Contact",
  "SubmitApplication",
] as const;

const EventSchema = z.object({
  event_name: z.enum(STANDARD_EVENTS),
  event_id: z.string().min(8).max(128),
  event_source_url: z.string().url().max(2048),
  action_source: z.enum(["website", "phone_call", "system_generated"]).default("website"),
  user_data: z
    .object({
      email: z.string().email().max(255).optional(),
      phone: z.string().max(32).optional(), // raw digits ok
      first_name: z.string().max(80).optional(),
      last_name: z.string().max(80).optional(),
      city: z.string().max(80).optional(),
      state: z.string().max(40).optional(),
      zip: z.string().max(16).optional(),
      country: z.string().length(2).optional(),
      external_id: z.string().max(128).optional(),
      client_ip: z.string().max(64).optional(),
      client_user_agent: z.string().max(512).optional(),
      fbp: z.string().max(128).optional(),
      fbc: z.string().max(256).optional(),
    })
    .default({}),
  custom_data: z
    .object({
      value: z.number().nonnegative().optional(),
      currency: z.string().length(3).optional(),
      content_name: z.string().max(120).optional(),
      content_category: z.string().max(120).optional(),
      lp_slug: z.string().max(120).optional(),
      campaign: z.string().max(160).optional(),
      source: z.string().max(80).optional(),
      medium: z.string().max(80).optional(),
    })
    .default({}),
});

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const norm = (s?: string) => (s ?? "").trim().toLowerCase();
const digits = (s?: string) => (s ?? "").replace(/\D/g, "");

async function hashUserData(u: z.infer<typeof EventSchema>["user_data"]) {
  const out: Record<string, unknown> = {};
  if (u.email) out.em = await sha256(norm(u.email));
  if (u.phone) {
    const d = digits(u.phone);
    if (d) out.ph = await sha256(d.length === 10 ? `1${d}` : d);
  }
  if (u.first_name) out.fn = await sha256(norm(u.first_name));
  if (u.last_name) out.ln = await sha256(norm(u.last_name));
  if (u.city) out.ct = await sha256(norm(u.city).replace(/\s+/g, ""));
  if (u.state) out.st = await sha256(norm(u.state).replace(/\s+/g, ""));
  if (u.zip) out.zp = await sha256(digits(u.zip));
  if (u.country) out.country = await sha256(norm(u.country));
  if (u.external_id) out.external_id = await sha256(norm(u.external_id));
  if (u.client_ip) out.client_ip_address = u.client_ip;
  if (u.client_user_agent) out.client_user_agent = u.client_user_agent;
  if (u.fbp) out.fbp = u.fbp;
  if (u.fbc) out.fbc = u.fbc;
  return out;
}

async function sendMeta(parsed: z.infer<typeof EventSchema>) {
  if (!PIXEL_ID || !CAPI_TOKEN) return { skipped: "meta_not_configured" };
  const body: Record<string, unknown> = {
    data: [
      {
        event_name: parsed.event_name,
        event_id: parsed.event_id,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: parsed.event_source_url,
        action_source: parsed.action_source,
        user_data: await hashUserData(parsed.user_data),
        custom_data: parsed.custom_data,
      },
    ],
  };
  if (TEST_CODE) body.test_event_code = TEST_CODE;

  const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(
    CAPI_TOKEN
  )}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`meta_${r.status}: ${text}`);
  return JSON.parse(text);
}

async function sendGA4(parsed: z.infer<typeof EventSchema>) {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) return { skipped: "ga4_not_configured" };
  const clientId = parsed.user_data.external_id || parsed.event_id;
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;
  const body = {
    client_id: clientId,
    events: [
      {
        name: parsed.event_name === "Lead" ? "generate_lead" : parsed.event_name.toLowerCase(),
        params: {
          event_id: parsed.event_id,
          page_location: parsed.event_source_url,
          ...parsed.custom_data,
        },
      },
    ],
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  return { status: r.status, body: text || "ok" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }

  const parsed = EventSchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse(400, { error: "validation_failed", details: parsed.error.flatten() });
  }

  // Auto-fill ip/ua server-side (more reliable than client guess).
  const data = parsed.data;
  data.user_data.client_ip ||=
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  data.user_data.client_user_agent ||= req.headers.get("user-agent") || undefined;

  const results: Record<string, unknown> = {};
  try {
    results.meta = await sendMeta(data);
  } catch (e) {
    results.meta_error = e instanceof Error ? e.message : String(e);
  }
  try {
    results.ga4 = await sendGA4(data);
  } catch (e) {
    results.ga4_error = e instanceof Error ? e.message : String(e);
  }

  return jsonResponse(200, { ok: true, event_id: data.event_id, results });
});

// ghl-proxy v5 — env-aware (prod vs stage) + route allowlist + manual CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API_BASE = "https://services.leadconnectorhq.com";
const PROD_LOCATION_ID = "Ghstz8eIsHWLeXek47dk";
const API_VERSION = "2021-07-28";

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

function envCreds(env: AppEnv): { apiKey: string | undefined; locationId: string } {
  if (env === "stage") {
    return {
      apiKey: Deno.env.get("GHL_API_KEY_STAGE_1") ?? Deno.env.get("GHL_API_KEY_STAGE"),
      locationId: Deno.env.get("GHL_LOCATION_ID_STAGE_1") ?? Deno.env.get("GHL_LOCATION_ID_STAGE") ?? "",
    };
  }
  return {
    apiKey: Deno.env.get("GHL_API_KEY"),
    locationId: Deno.env.get("GHL_LOCATION_ID") ?? PROD_LOCATION_ID,
  };
}

// Strict allowlist: only these (method, path-pattern) pairs are forwarded to GHL.
// Anything else returns 403. This prevents the anon-callable proxy from being
// abused to enumerate contacts, delete appointments, etc.
const ALLOW: { m: string; re: RegExp }[] = [
  { m: "GET",  re: /^\/calendars\/[A-Za-z0-9_-]+\/free-slots$/ },
  { m: "POST", re: /^\/contacts\/upsert$/ },
  { m: "POST", re: /^\/calendars\/events\/appointments$/ },
  { m: "PUT",  re: /^\/contacts\/[A-Za-z0-9_-]+$/ },
  { m: "POST", re: /^\/contacts\/[A-Za-z0-9_-]+\/tags$/ },
];

// Paths where we must NOT inject locationId into the upstream body
// (GHL contact update + tag endpoints reject extra fields).
const NO_LOC_INJECT = [
  /^\/contacts\/[A-Za-z0-9_-]+$/,
  /^\/contacts\/[A-Za-z0-9_-]+\/tags$/,
];

interface ProxyRequest {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  injectLocationId?: boolean;
}

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Lightweight body-shape validators (avoids Zod dep). Keep additive: unknown
// fields are dropped rather than rejected so GHL schema changes don't 500 us.
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length < 500;
const isOptStr = (v: unknown) => v === undefined || isStr(v);

function validateBody(method: string, path: string, body: unknown): { ok: true; body: Record<string, unknown> } | { ok: false; error: string } {
  if (method === "GET" || method === "DELETE") return { ok: true, body: {} };
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "body must be an object" };
  const b = body as Record<string, unknown>;

  if (path === "/contacts/upsert") {
    if (!isStr(b.firstName)) return { ok: false, error: "firstName required" };
    if (!isOptStr(b.lastName)) return { ok: false, error: "lastName invalid" };
    if (!isOptStr(b.email)) return { ok: false, error: "email invalid" };
    if (!isOptStr(b.phone)) return { ok: false, error: "phone invalid" };
    if (!isOptStr(b.source)) return { ok: false, error: "source invalid" };
    // tags: optional string[], cap count + length to prevent abuse
    let tags: string[] | undefined;
    if (b.tags !== undefined) {
      if (!Array.isArray(b.tags)) return { ok: false, error: "tags must be array" };
      const filtered = (b.tags as unknown[])
        .filter((t): t is string => typeof t === "string" && t.length > 0 && t.length <= 100)
        .slice(0, 30);
      if (filtered.length) tags = filtered;
    }
    // Allowlisted PHI-safe structured fields. Anything else is silently dropped
    // so the proxy can never be used to write arbitrary contact properties.
    const ALLOWED_CF = new Set([
      "mwc_symptom",
      "mwc_symptom_duration",
      "mwc_urgency_tier",
      "mwc_clinical_note",
      "mwc_funnel_service",
      "mwc_lp_slug",
    ]);
    let customFields: Record<string, string> | undefined;
    if (b.customFields !== undefined) {
      if (!b.customFields || typeof b.customFields !== "object" || Array.isArray(b.customFields)) {
        return { ok: false, error: "customFields must be object" };
      }
      const cf: Record<string, string> = {};
      for (const [k, v] of Object.entries(b.customFields as Record<string, unknown>)) {
        if (!ALLOWED_CF.has(k)) continue;
        if (typeof v !== "string" || v.length === 0 || v.length > 500) continue;
        cf[k] = v;
      }
      if (Object.keys(cf).length) customFields = cf;
    }
    return {
      ok: true,
      body: {
        firstName: b.firstName,
        ...(b.lastName ? { lastName: b.lastName } : {}),
        ...(b.email ? { email: b.email } : {}),
        ...(b.phone ? { phone: b.phone } : {}),
        ...(b.source ? { source: b.source } : {}),
        ...(tags ? { tags } : {}),
        ...(customFields ? { customFields } : {}),
      },
    };
  }

  if (path === "/calendars/events/appointments") {
    if (!isStr(b.calendarId)) return { ok: false, error: "calendarId required" };
    if (!isStr(b.contactId)) return { ok: false, error: "contactId required" };
    if (!isStr(b.startTime)) return { ok: false, error: "startTime required" };
    return {
      ok: true,
      body: {
        calendarId: b.calendarId,
        contactId: b.contactId,
        startTime: b.startTime,
        ...(isStr(b.endTime) ? { endTime: b.endTime } : {}),
        title: isStr(b.title) ? b.title : "Consultation",
        appointmentStatus: "confirmed",
        ignoreDateRange: false,
        toNotify: true,
        ...(isStr(b.notes) ? { notes: b.notes } : {}),
      },
    };
  }

  if (path === "/calendars/events/appointments") {
    if (!isStr(b.calendarId)) return { ok: false, error: "calendarId required" };
    if (!isStr(b.contactId)) return { ok: false, error: "contactId required" };
    if (!isStr(b.startTime)) return { ok: false, error: "startTime required" };
    return {
      ok: true,
      body: {
        calendarId: b.calendarId,
        contactId: b.contactId,
        startTime: b.startTime,
        ...(isStr(b.endTime) ? { endTime: b.endTime } : {}),
        title: isStr(b.title) ? b.title : "Consultation",
        appointmentStatus: "confirmed",
        ignoreDateRange: false,
        toNotify: true,
        ...(isStr(b.notes) ? { notes: b.notes } : {}),
      },
    };
  }

  // PUT /contacts/{id} — partial update. Reuse the upsert allowlist for safe fields.
  if (method === "PUT" && /^\/contacts\/[A-Za-z0-9_-]+$/.test(path)) {
    const ALLOWED_CF = new Set([
      "mwc_symptom",
      "mwc_symptom_duration",
      "mwc_urgency_tier",
      "mwc_clinical_note",
      "mwc_funnel_service",
      "mwc_lp_slug",
      "mwc_attribution_source",
      "mwc_commitment_given",
    ]);
    const out: Record<string, unknown> = {};
    if (isStr(b.firstName)) out.firstName = b.firstName;
    if (isStr(b.lastName)) out.lastName = b.lastName;
    if (isStr(b.email)) out.email = b.email;
    if (isStr(b.phone)) out.phone = b.phone;
    if (b.customFields && typeof b.customFields === "object" && !Array.isArray(b.customFields)) {
      const cf: Record<string, string> = {};
      for (const [k, v] of Object.entries(b.customFields as Record<string, unknown>)) {
        if (!ALLOWED_CF.has(k)) continue;
        if (typeof v !== "string" || v.length === 0 || v.length > 500) continue;
        cf[k] = v;
      }
      if (Object.keys(cf).length) out.customFields = cf;
    }
    if (!Object.keys(out).length) return { ok: false, error: "no updatable fields" };
    return { ok: true, body: out };
  }

  // POST /contacts/{id}/tags — add tags.
  if (method === "POST" && /^\/contacts\/[A-Za-z0-9_-]+\/tags$/.test(path)) {
    if (!Array.isArray(b.tags)) return { ok: false, error: "tags must be array" };
    const tags = (b.tags as unknown[])
      .filter((t): t is string => typeof t === "string" && t.length > 0 && t.length <= 100)
      .slice(0, 30);
    if (!tags.length) return { ok: false, error: "tags empty" };
    return { ok: true, body: { tags } };
  }

  return { ok: false, error: "unsupported path" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let payload: ProxyRequest & { __env?: AppEnv };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const env = detectEnv(req, payload.__env);
  const { apiKey, locationId } = envCreds(env);
  if (!apiKey) {
    return json(500, { error: `GHL API key for ${env} is not configured` });
  }
  if (!locationId) {
    return json(500, { error: `GHL location id for ${env} is not configured` });
  }

  const { path, method = "GET", query = {}, body } = payload;
  if (!path || typeof path !== "string" || !path.startsWith("/")) {
    return json(400, { error: "`path` must start with /" });
  }

  // Allowlist check — strip query/hash before matching
  const cleanPath = path.split("?")[0].split("#")[0];
  const allowed = ALLOW.some((a) => a.m === method && a.re.test(cleanPath));
  if (!allowed) return json(403, { error: "endpoint not allowed" });

  const validated = validateBody(method, cleanPath, body);
  if (!validated.ok) return json(400, { error: validated.error });

  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (k === "locationId") continue; // server-injected only
    search.set(k, String(v));
  }
  if (method === "GET" && payload.injectLocationId !== false && !search.has("locationId")) search.set("locationId", locationId);

  const url = `${API_BASE}${cleanPath}${search.toString() ? `?${search}` : ""}`;

  let outBody: string | undefined;
  if (method !== "GET" && method !== "DELETE") {
    outBody = JSON.stringify({ locationId, ...validated.body });
  }

  try {
    const upstream = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: API_VERSION,
        Accept: "application/json",
        ...(outBody ? { "Content-Type": "application/json" } : {}),
      },
      body: outBody,
    });

    const text = await upstream.text();
    const data = text ? safeJson(text) : null;
    if (!upstream.ok) {
      console.error(`[ghl-proxy] ${env} ${method} ${cleanPath} -> ${upstream.status} locId=${locationId}: ${text.slice(0, 800)}`);
    }
    // Always return 200 so the supabase-js client surfaces the body to callers.
    // Real upstream status lives in the JSON payload.
    return json(200, { ok: upstream.ok, status: upstream.status, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json(502, { error: `GHL request failed: ${message}` });
  }
});

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

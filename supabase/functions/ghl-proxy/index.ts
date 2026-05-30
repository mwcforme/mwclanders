// ghl-proxy v8 — debug version
import { corsHeadersFor, jsonResponse, corsResponse } from "../_shared/cors.ts";
import { tryGetGhlCreds, GHL_API_BASE, GHL_API_VERSION } from "../_shared/ghlEnv.ts";

const log = {
  info:  (msg: string, data?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info",  fn: "ghl-proxy", msg, ts: new Date().toISOString(), ...data })),
  error: (msg: string, data?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", fn: "ghl-proxy", msg, ts: new Date().toISOString(), ...data })),
};

const ALLOW = [
  { m: "GET",  re: /^\/calendars\/[A-Za-z0-9_-]+\/free-slots$/ },
  { m: "POST", re: /^\/contacts\/upsert$/ },
  { m: "POST", re: /^\/calendars\/events\/appointments$/ },
  { m: "PUT",  re: /^\/contacts\/[A-Za-z0-9_-]+$/ },
  { m: "POST", re: /^\/contacts\/[A-Za-z0-9_-]+\/tags$/ },
];

const NO_LOC_INJECT = [
  /^\/contacts\/(?!upsert)[A-Za-z0-9_-]{10,}$/,  // contact/{id} — exclude /contacts/upsert
  /^\/contacts\/(?!upsert)[A-Za-z0-9_-]{10,}\/tags$/,
  /^\/calendars\/[A-Za-z0-9_-]+\/free-slots$/,
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return corsResponse(req);

  const url = new URL(req.url);
  if (req.method === "GET" && url.pathname.endsWith("/health")) {
    const creds = tryGetGhlCreds();
    return jsonResponse(200, { 
      ok: true, fn: "ghl-proxy", credsOk: !!creds,
      // Debug: show first/last chars of key and location
      keyPrefix: creds?.apiKey?.slice(0, 8) ?? "none",
      locationId: creds?.locationId ?? "none",
      traceId: crypto.randomUUID() 
    });
  }

  const creds = tryGetGhlCreds();
  if (!creds) return jsonResponse(500, { ok: false, error: "GHL credentials not configured", data: null });

  let payload: Record<string, unknown>;
  try { payload = await req.json(); }
  catch { return jsonResponse(200, { ok: false, status: 400, error: "Invalid JSON body", data: null }); }

  const path = (payload.path as string ?? "").replace(/[^a-zA-Z0-9/_\-=&?%.]/g, "");
  const method = (payload.method as string ?? "GET").toUpperCase();
  const body = payload.body as Record<string, unknown> ?? {};
  const query = payload.query as Record<string, string | number | boolean> ?? {};

  const allowed = ALLOW.some(a => a.m === method && a.re.test(path));
  if (!allowed) return jsonResponse(200, { ok: false, status: 403, error: "endpoint not allowed", data: null });

  const skipLoc = NO_LOC_INJECT.some(re => re.test(path));
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (k === "locationId") continue;
    search.set(k, String(v));
  }
  if (method === "GET" && !skipLoc) search.set("locationId", creds.locationId);

  const upstream_url = `${GHL_API_BASE}${path}${search.toString() ? `?${search}` : ""}`;
  let outBody: string | undefined;
  if (method !== "GET") {
    outBody = JSON.stringify(skipLoc ? body : { locationId: creds.locationId, ...body });
  }

  try {
    const upstream = await fetch(upstream_url, {
      method,
      headers: {
        "Authorization": `Bearer ${creds.apiKey}`,
        "Version": GHL_API_VERSION,
        "Content-Type": "application/json",
      },
      body: outBody,
    });

    const text = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!upstream.ok) log.error("upstream error", { method, path, status: upstream.status, body: text.slice(0, 200) });

    // Auto-apply tags after upsert — GHL ignores inline tags on /contacts/upsert
    if (upstream.ok && method === "POST" && path === "/contacts/upsert") {
      const tagsToApply = (body as Record<string, unknown>).tags as string[] | undefined;
      const contactId = (data as Record<string, Record<string, Record<string, string>>>)?.contact?.id;
      if (tagsToApply?.length && contactId) {
        fetch(`${GHL_API_BASE}/contacts/${contactId}/tags`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${creds.apiKey}`,
            "Version": GHL_API_VERSION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags: tagsToApply }),
        }).catch((err: Error) => log.error("tag apply failed", { error: err.message, contactId }));
      }
    }

    return jsonResponse(200, { ok: upstream.ok, status: upstream.status, data }, req);
  } catch (err) {
    log.error("fetch error", { error: (err as Error).message });
    return jsonResponse(200, { ok: false, status: 502, error: "upstream fetch failed", data: null });
  }
});

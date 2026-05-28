/**
 * warm-ping — keeps ghl-proxy and lead-intake edge functions warm.
 *
 * Supabase edge functions cold-start after ~5 min idle. This function
 * calls the /health endpoint on each critical function every 5 minutes
 * to eliminate cold-start latency for real booking traffic.
 *
 * Schedule: Supabase cron → every 5 minutes
 *   Supabase dashboard → Edge Functions → Schedules → */5 * * * *
 *
 * Also callable manually: POST to /warm-ping (no body required).
 */
import { jsonResponse, corsResponse } from "../_shared/cors.ts";

const log = {
  info:  (msg: string, d?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info",  fn: "warm-ping", msg, ts: new Date().toISOString(), ...d })),
  error: (msg: string, d?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", fn: "warm-ping", msg, ts: new Date().toISOString(), ...d })),
};

// Functions to keep warm — hit their /health endpoint
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const TARGETS = [
  "ghl-proxy",
  "stuck-leads-monitor",
  "lead-intake",
  "lead-notify",
];

async function pingFunction(name: string): Promise<{ name: string; ok: boolean; ms: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}/health`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000), // 5s timeout per ping
    });
    const ms = Date.now() - start;
    if (!res.ok) {
      return { name, ok: false, ms, error: `HTTP ${res.status}` };
    }
    return { name, ok: true, ms };
  } catch (err) {
    return { name, ok: false, ms: Date.now() - start, error: (err as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  const url = new URL(req.url);
  if (req.method === "GET" && url.pathname.endsWith("/health")) {
    return jsonResponse(200, { ok: true, fn: "warm-ping", ts: new Date().toISOString() });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log.error("missing env vars", { hasUrl: !!SUPABASE_URL, hasKey: !!SUPABASE_ANON_KEY });
    return jsonResponse(500, { ok: false, error: "SUPABASE_URL or SUPABASE_ANON_KEY not configured" });
  }

  // Ping all targets in parallel
  const results = await Promise.all(TARGETS.map(pingFunction));

  const failures = results.filter(r => !r.ok);
  if (failures.length > 0) {
    log.error("some pings failed", { failures: failures.map(f => `${f.name}: ${f.error}`) });
  } else {
    log.info("all pings ok", { results: results.map(r => `${r.name} ${r.ms}ms`) });
  }

  return jsonResponse(200, {
    ok: failures.length === 0,
    results,
    ts: new Date().toISOString(),
  });
});

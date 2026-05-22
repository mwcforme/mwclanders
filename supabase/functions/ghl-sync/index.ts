// ghl-sync — fetches free slots for all centers (prod + stage) and upserts into the cache.
// Triggered hourly by pg_cron, or manually via POST. Manual triggers return 202 immediately
// and run the actual sync as a background task so the admin UI never times out.
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { GHL_API_BASE, GHL_API_VERSION } from "../_shared/ghlEnv.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";

const TIMEZONE = "America/New_York";

interface Env {
  name: "prod" | "stage";
  apiKey: string | undefined;
  centers: { key: string; calendarId: string }[];
}

function loadEnvs(): Env[] {
  return [
    {
      name: "prod",
      apiKey: Deno.env.get("GHL_API_KEY"),
      centers: [
        { key: "richmond", calendarId: "1Cfy5JnO2A4ggiZlMVvX" },
        { key: "virginia-beach", calendarId: "4xmnBGMWJ6TVUKcAPpPb" },
        { key: "newport-news", calendarId: "lBaRbjUpEmesxEloFBME" },
      ],
    },
    {
      name: "stage",
      apiKey: Deno.env.get("GHL_API_KEY_STAGE_1") ?? Deno.env.get("GHL_API_KEY_STAGE"),
      centers: [
        { key: "richmond", calendarId: "CpcOAez2bv3tQTvTdRkO" },
        { key: "virginia-beach", calendarId: "HbuYjmaupXDpYoiYzvUk" },
        { key: "newport-news", calendarId: "6cSOOYintvb8y0B42uTc" },
      ],
    },
  ];
}

const WINDOW_DAYS = 21;

interface FreeSlotsResponse {
  [key: string]: { slots?: string[] } | unknown;
  traceId?: string;
}

async function fetchSlots(calendarId: string, apiKey: string) {
  const start = Date.now();
  const end = start + WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const url = `${GHL_API_BASE}/calendars/${calendarId}/free-slots?startDate=${start}&endDate=${end}&timezone=${encodeURIComponent(TIMEZONE)}`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: GHL_API_VERSION,
      Accept: "application/json",
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`GHL ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as FreeSlotsResponse;
}

function flatten(resp: FreeSlotsResponse): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(resp)) {
    if (k === "traceId" || !v || typeof v !== "object") continue;
    const slots = (v as { slots?: string[] }).slots;
    if (Array.isArray(slots)) out.push(...slots);
  }
  return out;
}

async function runSync(supabase: ReturnType<typeof createAdminClient>, runId: string) {
  const envs = loadEnvs();
  const summary: Record<string, unknown> = {};
  let total = 0;
  let firstError: string | null = null;

  try {
    const cutoff = new Date().toISOString();

    for (const env of envs) {
      if (!env.apiKey) {
        summary[env.name] = "skipped (no API key)";
        continue;
      }

      const envDetail: Record<string, unknown> = {};
      let envCount = 0;
      for (const c of env.centers) {
        let resp: FreeSlotsResponse;
        try {
          resp = await fetchSlots(c.calendarId, env.apiKey);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          envDetail[c.key] = `ERR: ${msg.slice(0, 200)}`;
          if (!firstError) firstError = `${env.name}/${c.key}: ${msg.slice(0, 200)}`;
          continue;
        }
        const slots = flatten(resp);
        envDetail[c.key] = slots.length;
        const rows = slots.map((iso) => {
          const startD = new Date(iso);
          const endD = new Date(startD.getTime() + 30 * 60 * 1000);
          return {
            location: c.key,
            calendar_id: c.calendarId,
            slot_start: startD.toISOString(),
            slot_end: endD.toISOString(),
            fetched_at: cutoff,
          };
        });

        await supabase.from("ghl_free_slots").delete().eq("calendar_id", c.calendarId);

        if (rows.length) {
          for (let i = 0; i < rows.length; i += 500) {
            const chunk = rows.slice(i, i + 500);
            const { error } = await supabase
              .from("ghl_free_slots")
              .upsert(chunk, { onConflict: "calendar_id,slot_start" });
            if (error) throw new Error(`upsert: ${error.message}`);
          }
        }
        envCount += rows.length;
      }
      envDetail.total = envCount;
      summary[env.name] = envDetail;
      total += envCount;
    }

    await supabase
      .from("ghl_sync_runs")
      .update({
        status: firstError ? "error" : "ok",
        slot_count: total,
        error: firstError ?? JSON.stringify(summary),
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase
      .from("ghl_sync_runs")
      .update({ status: "error", error: msg, finished_at: new Date().toISOString() })
      .eq("id", runId);
  }
}

// EdgeRuntime is provided by Supabase Edge Runtime for background tasks.
const edgeRuntime = (globalThis as Record<string, unknown>).EdgeRuntime as
  | { waitUntil?: (p: Promise<unknown>) => void }
  | undefined;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return jsonResponse(500, { error: (e as Error).message });
  }

  const { data: run, error: runErr } = await supabase
    .from("ghl_sync_runs")
    .insert({ status: "running" })
    .select("id")
    .single();
  if (runErr || !run) return jsonResponse(500, { error: `run insert: ${runErr?.message}` });

  const task = runSync(supabase, run.id);
  if (edgeRuntime?.waitUntil) {
    edgeRuntime.waitUntil(task);
  } else {
    // Fallback: fire and forget (cron path also tolerates this).
    task.catch(() => {});
  }

  return jsonResponse(202, { ok: true, run_id: run.id, status: "running" });
});

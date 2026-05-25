// ghl-sync-validate — audits ghl_free_slots + ghl_sync_runs against the canonical
// prod calendar-id set. Stage environment removed 2026-05-25.
//
// What it checks:
//   1. Every distinct calendar_id in ghl_free_slots maps to a known prod calendar.
//      Unknown ids = drift.
//   2. Each prod calendar has at least one row with fetched_at within FRESH_WINDOW_MIN.
//   3. The most recent ghl_sync_runs row finished successfully and is fresh.
//
// Result: a single booking_event_log row of event_type='sync_validation' with
// meta = full report and error = first failure summary (or null when ok).

import { corsHeaders, jsonResponse, corsResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";

// Mirror of src/lib/ghlCalendars.ts + supabase/functions/ghl-sync/index.ts.
// Keep the three lists in lockstep.
const PROD_CALENDARS: Record<string, string> = {
  richmond: "1Cfy5JnO2A4ggiZlMVvX",
  "virginia-beach": "4xmnBGMWJ6TVUKcAPpPb",
  "newport-news": "lBaRbjUpEmesxEloFBME",
};


const FRESH_WINDOW_MIN = 90; // sync runs every 30min, give 3x grace

interface CenterReport {
  env: "prod";
  location: string;
  calendar_id: string;
  slot_count: number;
  fetched_at: string | null;
  fresh: boolean;
}

interface ValidationReport {
  ok: boolean;
  checked_at: string;
  fresh_window_min: number;
  centers: CenterReport[];
  unknown_calendar_ids: string[];
  last_sync_run: {
    id: string | null;
    status: string | null;
    finished_at: string | null;
    fresh: boolean;
    error: string | null;
  };
  failures: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return jsonResponse(500, { error: "missing supabase env" });
  }

  const now = new Date();
  const freshCutoff = new Date(now.getTime() - FRESH_WINDOW_MIN * 60_000);
  const failures: string[] = [];
  const centers: CenterReport[] = [];

  // ---- Per-calendar coverage ----
  const allKnown = [
    ...Object.entries(PROD_CALENDARS).map(([location, id]) =>
      ({ env: "prod" as const, location, calendar_id: id }),
    ),
  ];

  for (const c of allKnown) {
    const { count, error: countErr } = await supabase
      .from("ghl_free_slots")
      .select("calendar_id", { count: "exact", head: true })
      .eq("calendar_id", c.calendar_id);

    const { data: latest, error: latestErr } = await supabase
      .from("ghl_free_slots")
      .select("fetched_at")
      .eq("calendar_id", c.calendar_id)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const fetchedAt = latest?.fetched_at ?? null;
    const fresh = fetchedAt ? new Date(fetchedAt) >= freshCutoff : false;

    centers.push({
      env: c.env,
      location: c.location,
      calendar_id: c.calendar_id,
      slot_count: count ?? 0,
      fetched_at: fetchedAt,
      fresh,
    });

    if (countErr) failures.push(`${c.env}/${c.location} count error: ${countErr.message}`);
    if (latestErr) failures.push(`${c.env}/${c.location} latest error: ${latestErr.message}`);
    if ((count ?? 0) === 0) failures.push(`${c.env}/${c.location} has zero cached slots`);
    if (!fresh) failures.push(`${c.env}/${c.location} last sync ${fetchedAt ?? "never"} is stale (>${FRESH_WINDOW_MIN}m)`);
  }

  // ---- Drift: unknown calendar ids in the table ----
  const known = new Set(Object.values(PROD_CALENDARS));
  const { data: distinctRows } = await supabase
    .from("ghl_free_slots")
    .select("calendar_id")
    .limit(1000);
  const seen = new Set((distinctRows ?? []).map((r) => r.calendar_id));
  const unknown = [...seen].filter((id) => !known.has(id));
  if (unknown.length) {
    failures.push(`unknown calendar ids in ghl_free_slots: ${unknown.join(", ")}`);
  }

  // ---- Last sync run health ----
  const { data: lastRun } = await supabase
    .from("ghl_sync_runs")
    .select("id, status, finished_at, error")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastFinished = lastRun?.finished_at ? new Date(lastRun.finished_at) : null;
  const lastFresh = !!(lastFinished && lastFinished >= freshCutoff);
  if (!lastRun) failures.push("no ghl_sync_runs row found");
  else if (lastRun.status !== "ok") failures.push(`last sync run status=${lastRun.status} error=${lastRun.error ?? "n/a"}`);
  else if (!lastFresh) failures.push(`last sync run finished ${lastRun.finished_at ?? "never"} is stale`);

  const report: ValidationReport = {
    ok: failures.length === 0,
    checked_at: now.toISOString(),
    fresh_window_min: FRESH_WINDOW_MIN,
    centers,
    unknown_calendar_ids: unknown,
    last_sync_run: {
      id: lastRun?.id ?? null,
      status: lastRun?.status ?? null,
      finished_at: lastRun?.finished_at ?? null,
      fresh: lastFresh,
      error: lastRun?.error ?? null,
    },
    failures,
  };

  await supabase.from("booking_event_log").insert({
    event_type: "sync_validation",
    source: "ghl-sync-validate",
    error: report.ok ? null : failures[0],
    meta: report as unknown as Record<string, unknown>,
  });

  return jsonResponse(report.ok ? 200 : 422, report);
});

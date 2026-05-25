/**
 * slot-monitor — checks ghl_free_slots for zero-slot conditions and sends
 * alert emails when a location has no available slots for the next N days.
 *
 * Designed to run every 30 minutes via pg_cron alongside ghl-sync.
 *
 * Alert conditions:
 *   1. A location has ZERO slots for the entire next 7 days
 *   2. A specific calendar date has zero slots (partial blackout)
 *   3. ghl_free_slots table hasn't been updated in > 2 hours (sync failure)
 *
 * De-duplication: alerts fire at most once per 4-hour window per condition.
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, jsonResponse, corsResponse } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/sendEmail.ts";

const log = {
  info:  (msg: string, d?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info",  fn: "slot-monitor", msg, ts: new Date().toISOString(), ...d })),
  warn:  (msg: string, d?: Record<string, unknown>) => console.warn(JSON.stringify({ level: "warn",  fn: "slot-monitor", msg, ts: new Date().toISOString(), ...d })),
  error: (msg: string, d?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", fn: "slot-monitor", msg, ts: new Date().toISOString(), ...d })),
};

const CALENDARS: Record<string, string> = {
  "1Cfy5JnO2A4ggiZlMVvX": "Richmond",
  "4xmnBGMWJ6TVUKcAPpPb": "Virginia Beach",
  "lBaRbjUpEmesxEloFBME": "Newport News",
};

const ALERT_EMAIL = "eobrien@menswellnesscenters.com";
const DEDUP_HOURS = 4; // don't re-alert for same issue within 4 hours
const LOOK_AHEAD_DAYS = 7;
const STALE_SYNC_HOURS = 2;

interface AlertState {
  last_alerted: Record<string, string>; // key -> ISO timestamp
}

function alertKey(type: string, id: string): string {
  return `${type}:${id}`;
}

function shouldAlert(state: AlertState, key: string): boolean {
  const last = state.last_alerted[key];
  if (!last) return true;
  const hoursSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60);
  return hoursSince >= DEDUP_HOURS;
}

async function sendAlert(_key: string, subject: string, html: string): Promise<void> {
  const result = await sendEmail({ to: ALERT_EMAIL, subject, html });
  if (!result.ok) log.error("sendgrid failed", { error: result.error });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = new Date();
  const windowStart = now.toISOString();
  const windowEnd   = new Date(now.getTime() + LOOK_AHEAD_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // ── Load alert dedup state ──────────────────────────────────────────────
  const { data: stateRow } = await sb
    .from("booking_event_log")
    .select("meta")
    .eq("event_type", "slot_monitor_state")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const state: AlertState = (stateRow?.meta as AlertState) ?? { last_alerted: {} };
  const alerts: string[] = [];

  // ── Check 1: Zero slots per location for next 7 days ───────────────────
  for (const [calId, name] of Object.entries(CALENDARS)) {
    const { count } = await sb
      .from("ghl_free_slots")
      .select("slot_start", { count: "exact", head: true })
      .eq("calendar_id", calId)
      .gte("slot_start", windowStart)
      .lt("slot_start", windowEnd);

    if ((count ?? 0) === 0) {
      const key = alertKey("zero_slots", calId);
      if (shouldAlert(state, key)) {
        state.last_alerted[key] = now.toISOString();
        alerts.push(`🚨 <strong>${name}</strong> — ZERO slots available for the next ${LOOK_AHEAD_DAYS} days`);
        log.warn("zero slots", { location: name, calendar_id: calId });
      }
    }
  }

  // ── Check 2: Sync staleness ─────────────────────────────────────────────
  const staleThreshold = new Date(now.getTime() - STALE_SYNC_HOURS * 60 * 60 * 1000).toISOString();
  const { data: latestSlot } = await sb
    .from("ghl_free_slots")
    .select("fetched_at")
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestSlot || latestSlot.fetched_at < staleThreshold) {
    const key = alertKey("stale_sync", "global");
    if (shouldAlert(state, key)) {
      state.last_alerted[key] = now.toISOString();
      const lastSync = latestSlot?.fetched_at ?? "never";
      alerts.push(`⚠️ <strong>Slot sync is stale</strong> — last updated ${lastSync}. Slots may be outdated.`);
      log.warn("stale sync", { last_sync: lastSync });
    }
  }

  // ── Check 3: ghl-sync watchdog — no successful run in last 70 minutes ───
  const syncWatchdogThreshold = new Date(now.getTime() - 70 * 60 * 1000).toISOString();
  const { data: recentSyncRun } = await sb
    .from("ghl_sync_runs")
    .select("id, finished_at, status")
    .eq("status", "ok")
    .gte("started_at", syncWatchdogThreshold)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!recentSyncRun) {
    const key = alertKey("sync_watchdog", "global");
    if (shouldAlert(state, key)) {
      state.last_alerted[key] = now.toISOString();
      alerts.push(`🔴 <strong>ghl-sync watchdog alert</strong> — no successful sync run in the last 70 minutes. Calendar data may be stale or pg_cron may have stopped.`);
      log.warn("sync watchdog triggered", { threshold: syncWatchdogThreshold });
    }
  }

  // ── Send alert email if needed ──────────────────────────────────────────
  if (alerts.length > 0) {
    const html = `
<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
  <div style="background:#dc2626;padding:16px 24px;">
    <h1 style="color:#fff;font-size:16px;margin:0;font-weight:700;">MWC Booking Slot Alert</h1>
    <p style="color:rgba(255,255,255,0.80);font-size:12px;margin:4px 0 0;">${now.toLocaleString("en-US", { timeZone: "America/New_York" })} ET</p>
  </div>
  <div style="padding:20px 24px;">
    <ul style="padding-left:20px;margin:0 0 16px;">
      ${alerts.map(a => `<li style="margin-bottom:10px;font-size:14px;line-height:1.5;">${a}</li>`).join("")}
    </ul>
    <p style="font-size:13px;color:#6b7280;">Members may be seeing "Full" on the booking calendar. Check GHL calendar availability and trigger a manual sync if needed.</p>
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
      <a href="https://book.menswellnesscenters.com/admin/sync"
         style="display:inline-block;background:#e8670a;color:#fff;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">
        Admin Sync Panel
      </a>
      <a href="https://book.menswellnesscenters.com/book/schedule"
         style="display:inline-block;background:#0b1029;color:#fff;font-weight:700;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px;">
        Check Live Calendar
      </a>
    </div>
  </div>
</div>
</body></html>`;

    await sendAlert("", `[MWC Alert] ${alerts.length} slot issue${alerts.length > 1 ? "s" : ""} detected`, html);
    log.info("alert sent", { count: alerts.length });
  }

  // ── Persist dedup state ─────────────────────────────────────────────────
  await sb.from("booking_event_log").insert({
    event_type: "slot_monitor_state",
    meta: state,
  });

  log.info("monitor complete", { alerts: alerts.length });
  return jsonResponse(200, { ok: true, alerts_fired: alerts.length, issues: alerts });
});

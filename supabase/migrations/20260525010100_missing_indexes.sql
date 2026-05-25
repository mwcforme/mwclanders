-- Missing indexes identified in SRE audit 2026-05-25
--
-- Queries observed across edge functions:
-- 1. wp_intake_tokens: .eq("token", token) — token lookup in wp-token-exchange (hot path)
-- 2. wp_intake_tokens: .eq("used", false) — optimistic lock filter
-- 3. ghl_sync_runs: .order("started_at", DESC) .limit(1) — latest sync run lookup
-- 4. booking_event_log: .eq("event_type", ...) .order("created_at", DESC) — dedup state
-- 5. ghl_free_slots: .eq("calendar_id", ...) .gte/.lt("slot_start", ...) — per-calendar range scan
--    (covered by PRIMARY KEY + idx_ghl_free_slots_location_start, but adding calendar_id+slot_start explicitly)
-- 6. lead_captures: .eq("id", captureId) — covered by PRIMARY KEY

-- 1. wp_intake_tokens: token lookup (single-use token exchange — must be fast)
CREATE INDEX IF NOT EXISTS idx_wp_intake_tokens_token
  ON public.wp_intake_tokens (token);

-- 2. wp_intake_tokens: filter unused tokens
CREATE INDEX IF NOT EXISTS idx_wp_intake_tokens_used
  ON public.wp_intake_tokens (used)
  WHERE used = false;

-- 3. ghl_sync_runs: latest run lookup
CREATE INDEX IF NOT EXISTS idx_ghl_sync_runs_started_at
  ON public.ghl_sync_runs (started_at DESC);

-- 4. booking_event_log: dedup state query
CREATE INDEX IF NOT EXISTS idx_booking_event_log_type_created
  ON public.booking_event_log (event_type, created_at DESC);

-- 5. ghl_free_slots: per-calendar slot range scan (slot-monitor)
CREATE INDEX IF NOT EXISTS idx_ghl_free_slots_cal_start
  ON public.ghl_free_slots (calendar_id, slot_start);

-- 6. ghl_free_slots: freshness check (max fetched_at)
CREATE INDEX IF NOT EXISTS idx_ghl_free_slots_fetched_at
  ON public.ghl_free_slots (fetched_at DESC);

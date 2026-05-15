
-- Cache table: one row per available slot per calendar
CREATE TABLE public.ghl_free_slots (
  location TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (calendar_id, slot_start)
);

CREATE INDEX idx_ghl_free_slots_location_start ON public.ghl_free_slots (location, slot_start);

ALTER TABLE public.ghl_free_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "free_slots_public_read"
  ON public.ghl_free_slots
  FOR SELECT
  USING (true);

-- Sync run log
CREATE TABLE public.ghl_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  slot_count INTEGER,
  error TEXT
);

ALTER TABLE public.ghl_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_runs_public_read"
  ON public.ghl_sync_runs
  FOR SELECT
  USING (true);

-- Enable scheduling extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

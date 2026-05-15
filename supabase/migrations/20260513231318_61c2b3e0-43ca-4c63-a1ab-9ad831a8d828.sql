CREATE TABLE public.booking_event_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('attempt','success','error')),
  location TEXT,
  calendar_id TEXT,
  slot_iso TIMESTAMPTZ,
  contact_id TEXT,
  lead_capture_id UUID,
  source TEXT,
  page_url TEXT,
  error TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert booking events"
  ON public.booking_event_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "service role can read booking events"
  ON public.booking_event_log
  FOR SELECT
  TO service_role
  USING (true);

CREATE INDEX idx_booking_event_log_created_at ON public.booking_event_log (created_at DESC);
CREATE INDEX idx_booking_event_log_calendar_id ON public.booking_event_log (calendar_id);
-- Track recent lead submissions per phone to prevent spam.
-- lead-intake already has IP-based in-memory rate limiting;
-- this adds a persistent phone-based layer for cross-instance protection.
CREATE TABLE IF NOT EXISTS public.lead_rate_limit (
  phone_hash text NOT NULL PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_rate_limit ENABLE ROW LEVEL SECURITY;

-- No direct access from any client role — edge functions use service role only.
CREATE POLICY "deny_all_direct" ON public.lead_rate_limit
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Index for efficient cleanup of expired windows (window_start + 1h).
CREATE INDEX IF NOT EXISTS lead_rate_limit_window_idx
  ON public.lead_rate_limit (window_start);

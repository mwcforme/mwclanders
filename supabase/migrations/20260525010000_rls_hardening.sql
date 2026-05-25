-- RLS Hardening: restrict ghl_sync_runs to authenticated role only
-- Anon access to sync run data reveals infrastructure timing, slot counts,
-- calendar IDs, and internal error messages.
--
-- The frontend admin panel uses service role key (via edge functions) so
-- this change does not affect admin functionality.
-- The ghl-sync and slot-monitor edge functions also use service role.

-- Drop the permissive public read policy
DROP POLICY IF EXISTS "sync_runs_public_read" ON public.ghl_sync_runs;

-- Replace with authenticated-only read
CREATE POLICY "authenticated_read_sync_runs"
  ON public.ghl_sync_runs
  FOR SELECT
  TO authenticated
  USING (true);

-- Deny anon explicitly (belt-and-suspenders)
CREATE POLICY "deny_anon_sync_runs"
  ON public.ghl_sync_runs
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

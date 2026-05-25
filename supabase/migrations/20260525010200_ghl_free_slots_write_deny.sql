-- ghl_free_slots: anon may read (frontend queries directly for booking UI)
-- but must never write. This migration adds an explicit write-deny policy.
-- Read policy already exists from initial schema; adding belt-and-suspenders
-- INSERT/UPDATE/DELETE denial for anon and authenticated roles.

CREATE POLICY "deny_anon_write_free_slots"
  ON public.ghl_free_slots
  FOR INSERT TO anon
  WITH CHECK (false);

CREATE POLICY "deny_anon_update_free_slots"
  ON public.ghl_free_slots
  FOR UPDATE TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "deny_anon_delete_free_slots"
  ON public.ghl_free_slots
  FOR DELETE TO anon
  USING (false);

CREATE POLICY "deny_auth_write_free_slots"
  ON public.ghl_free_slots
  FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "deny_auth_update_free_slots"
  ON public.ghl_free_slots
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "deny_auth_delete_free_slots"
  ON public.ghl_free_slots
  FOR DELETE TO authenticated
  USING (false);

-- SECURITY FIX: wp_intake_tokens had an overly permissive RLS policy.
-- The "service role full access" policy had no TO clause, so it applied to
-- anon and authenticated roles, allowing any unauthenticated user to enumerate
-- tokens (which contain first_name, last_name, email, phone PII).
--
-- The wp-token-exchange edge function uses SUPABASE_SERVICE_ROLE_KEY which
-- bypasses RLS entirely, so no policy is needed for service_role access.
-- Anon/authenticated should have zero direct table access.
--
-- REVIEW BEFORE APPLYING: verify no other code paths query this table with
-- the anon key before running this migration.

DROP POLICY IF EXISTS "service role full access" ON public.wp_intake_tokens;

-- Deny all direct access for anon/authenticated roles.
-- Service role bypasses RLS, so edge functions are unaffected.
CREATE POLICY "deny_direct_access"
  ON public.wp_intake_tokens
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

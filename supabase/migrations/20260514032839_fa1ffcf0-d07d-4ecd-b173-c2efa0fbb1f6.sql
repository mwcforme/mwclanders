-- Hardcoded admin allowlist. Edit this list (and the matching TS file
-- src/lib/admin/allowlist.ts) when adding/removing admins.
-- SECURITY DEFINER + STABLE + locked search_path is the recommended pattern.
CREATE OR REPLACE FUNCTION public.is_admin_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(_email) = ANY (ARRAY[
    'chris@menswellnesscenters.com'
  ]::text[]);
$$;

-- Reads the email from the current request's JWT and checks the allowlist.
-- Used by RLS policies. Returns false for anonymous requests.
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin_email(
    coalesce(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
      ''
    )
  );
$$;

-- lead_captures: admins can SELECT and UPDATE. Anon INSERT policy is unchanged.
CREATE POLICY "admins can read lead captures"
  ON public.lead_captures
  FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "admins can update lead captures"
  ON public.lead_captures
  FOR UPDATE
  TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

-- booking_event_log: admins can SELECT. Anon INSERT policy is unchanged.
CREATE POLICY "admins can read booking events"
  ON public.booking_event_log
  FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin());
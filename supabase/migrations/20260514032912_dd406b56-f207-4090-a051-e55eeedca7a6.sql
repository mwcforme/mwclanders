-- Switch both helpers to SECURITY INVOKER. They only read JWT claims and a
-- hardcoded list, so no elevated privileges are required.
CREATE OR REPLACE FUNCTION public.is_admin_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT lower(_email) = ANY (ARRAY[
    'chris@menswellnesscenters.com'
  ]::text[]);
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT public.is_admin_email(
    coalesce(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
      ''
    )
  );
$$;

-- Tighten EXECUTE grants. Only signed-in users should be able to call these.
REVOKE EXECUTE ON FUNCTION public.is_admin_email(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
-- is_admin_email is only used internally by current_user_is_admin; no direct grant needed.
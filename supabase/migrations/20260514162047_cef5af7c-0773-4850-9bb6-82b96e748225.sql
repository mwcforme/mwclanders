
CREATE TABLE public.env_change_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  from_env text,
  to_env text NOT NULL
);

ALTER TABLE public.env_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins can read env change log"
  ON public.env_change_log FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "admins can insert env change log"
  ON public.env_change_log FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_is_admin());

CREATE INDEX env_change_log_changed_at_idx ON public.env_change_log (changed_at DESC);

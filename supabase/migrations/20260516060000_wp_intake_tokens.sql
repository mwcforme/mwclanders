-- Short-lived tokens for WordPress → booking funnel handoff.
-- A token is written by lead-intake after GHL upsert, consumed once by /book/entry.

CREATE TABLE public.wp_intake_tokens (
  token       text        NOT NULL PRIMARY KEY DEFAULT encode(gen_random_bytes(32), 'hex'),
  capture_id  uuid        NOT NULL REFERENCES public.lead_captures(id) ON DELETE CASCADE,
  contact_id  text        NOT NULL,  -- GHL contact id
  first_name  text        NOT NULL,
  last_name   text,
  email       text,
  phone       text        NOT NULL,
  location    text,
  service     text,
  source      text,
  used        boolean     NOT NULL DEFAULT false,
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wp_intake_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can write; anon can consume (exchange) via edge function
CREATE POLICY "service role full access"
  ON public.wp_intake_tokens
  USING (true)
  WITH CHECK (true);

CREATE INDEX wp_intake_tokens_expires_at_idx ON public.wp_intake_tokens (expires_at);

-- Auto-clean expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_wp_intake_tokens()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM public.wp_intake_tokens WHERE expires_at < now() - interval '1 hour';
$$;

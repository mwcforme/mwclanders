-- MWC schema migration — run this in the NEW Supabase project's SQL Editor.
-- Recreates tables, RLS, and the gen_random_bytes default for wp_intake_tokens.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── lead_captures ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_captures (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  phone           text,
  email           text,
  location        text,
  service         text,
  source          text,
  page_url        text,
  tags            text[],
  attribution     jsonb,
  crm_status      text NOT NULL DEFAULT 'pending',
  crm_contact_id  text,
  crm_error       text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_only_lead_captures ON public.lead_captures;
CREATE POLICY service_role_only_lead_captures
  ON public.lead_captures
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── wp_intake_tokens ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wp_intake_tokens (
  token        text PRIMARY KEY DEFAULT encode(gen_random_bytes(32), 'hex'),
  capture_id   uuid NOT NULL,
  contact_id   text NOT NULL,
  first_name   text NOT NULL,
  last_name    text,
  email        text,
  phone        text NOT NULL,
  location     text,
  service      text,
  source       text,
  used         boolean NOT NULL DEFAULT false,
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wp_intake_tokens_expires_at_idx
  ON public.wp_intake_tokens (expires_at);

ALTER TABLE public.wp_intake_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_only_wp_tokens ON public.wp_intake_tokens;
CREATE POLICY service_role_only_wp_tokens
  ON public.wp_intake_tokens
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

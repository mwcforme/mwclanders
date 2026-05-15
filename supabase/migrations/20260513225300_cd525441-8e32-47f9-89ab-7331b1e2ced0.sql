CREATE TABLE public.lead_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  service TEXT,
  source TEXT,
  page_url TEXT,
  tags TEXT[],
  attribution JSONB,
  crm_contact_id TEXT,
  crm_status TEXT NOT NULL DEFAULT 'pending',
  crm_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

-- Public can insert (anonymous visitors submitting the form)
CREATE POLICY "anyone can insert lead captures"
ON public.lead_captures
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies = no public read/write of existing rows.

CREATE INDEX idx_lead_captures_created_at ON public.lead_captures (created_at DESC);
CREATE INDEX idx_lead_captures_crm_status ON public.lead_captures (crm_status);

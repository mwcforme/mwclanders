-- Create a database trigger that calls the lead-notify edge function
-- on every INSERT into lead_captures.
-- This replaces the Supabase Dashboard webhook that wasn't configured
-- on the new project.

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function that fires the edge function via HTTP
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _key text;
BEGIN
  _url := current_setting('app.supabase_url', true) || '/functions/v1/lead-notify';
  _key := current_setting('app.supabase_anon_key', true);

  -- Fire and forget — never block the INSERT
  PERFORM net.http_post(
    url     := _url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || _key
    ),
    body    := jsonb_build_object('record', row_to_json(NEW))
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block lead capture on notification failure
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create fresh
DROP TRIGGER IF EXISTS on_lead_captured ON public.lead_captures;

CREATE TRIGGER on_lead_captured
  AFTER INSERT ON public.lead_captures
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_lead();

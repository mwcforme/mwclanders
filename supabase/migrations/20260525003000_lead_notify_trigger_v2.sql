-- Fix lead-notify trigger — use hardcoded project URL and anon key
-- (current_setting approach didn't resolve correctly on this project)

CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/lead-notify',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcHZxaG1tZ2VkdXVlZGxleWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTgwNDYsImV4cCI6MjA5NTI5NDA0Nn0.VKCzn3kpFtUV3aKGHdAU4TfMPlN97AxVyTjwu7vFIW8'
    ),
    body    := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

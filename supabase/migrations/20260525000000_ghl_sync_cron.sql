-- Schedule ghl-sync to run every 30 minutes to keep calendar slots fresh
SELECT cron.schedule(
  'ghl-sync-every-30min',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/ghl-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

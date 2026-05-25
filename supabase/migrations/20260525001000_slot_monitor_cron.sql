-- Run slot-monitor every 30 minutes alongside ghl-sync
SELECT cron.schedule(
  'slot-monitor-every-30min',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/slot-monitor',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

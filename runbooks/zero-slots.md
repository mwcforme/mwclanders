# Runbook: Zero Slots Available

**Service:** Booking calendar — `ghl_free_slots` table
**SLO:** Slot data < 40 min old (SLO-3)
**Severity:** P2 — respond within 30 minutes

---

## Symptoms

- slot-monitor email alert fires: "ZERO slots available for the next 7 days"
- Members see "No available times" on `/book/schedule`
- `ghl_free_slots` table is empty for one or more calendar IDs

---

## Step 1: Confirm which locations are affected

Query the live slot count via the admin panel at:
https://book.menswellnesscenters.com/admin/sync

Or query directly:
```bash
# Use SUPABASE_ANON_KEY from Supabase Dashboard → Settings → API
curl -s "https://lapvqhmmgeduuedleyhf.supabase.co/rest/v1/ghl_free_slots?select=location,calendar_id&limit=5" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

---

## Step 2: Check if ghl-sync ran recently

Check `ghl_sync_runs` for the most recent run status and any errors.
Via the admin sync panel: https://book.menswellnesscenters.com/admin/sync

---

## Step 3: Trigger a manual sync

Via the admin panel:
1. Go to https://book.menswellnesscenters.com/admin/sync
2. Log in with admin password
3. Click "Trigger Manual Sync"
4. Wait 30-60 seconds
5. Refresh — slot count should update

Or trigger via edge function directly:
```bash
export SUPABASE_ACCESS_TOKEN=$(op read 'op://MWC/Supabase/access-token')  # or set from 1Password
curl -s "https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/ghl-sync" \
  -X POST \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Step 4: Check GHL calendar availability

If manual sync runs but slots are still zero:
1. Log into GHL: https://app.gohighlevel.com
2. Navigate to Calendars for each location (Richmond, Virginia Beach, Newport News)
3. Check if appointment slots are configured and available in the next 7 days
4. If GHL calendar has no slots: add availability or contact the provider

---

## Step 5: Check GHL API health

```bash
# Test GHL API connectivity
curl -s "https://services.leadconnectorhq.com/oauth/token" -X GET | head -5
# Should not time out
```

If GHL API is down, check https://status.gohighlevel.com/

---

## Step 6: Check pg_cron

If auto-sync is failing repeatedly, the pg_cron job may need to be re-created:
```sql
-- Check cron job status
SELECT * FROM cron.job WHERE jobname LIKE '%ghl%';

-- If missing, re-run the migration:
-- supabase/migrations/20260525000000_ghl_sync_cron.sql
```

---

## Recovery Verification

After sync:
1. Check https://book.menswellnesscenters.com/book/schedule
2. Slots should be visible for at least the next 7 days
3. Confirm slot-monitor will not re-alert (check `booking_event_log` for `slot_monitor_state`)

---

## Escalation

If zero-slot condition persists > 2 hours:
- Email: eobrien@menswellnesscenters.com
- GHL Support: https://help.gohighlevel.com/

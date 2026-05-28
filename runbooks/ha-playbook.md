# MWC High-Availability Playbook

> $200k/month in ad spend. Every minute of downtime costs real money.
> This doc is the first thing you open when something breaks.

---

## 🚨 SITE IS DOWN — Do This First

1. **Check Vercel status**: https://www.vercel-status.com/
2. **Check Supabase status**: https://status.supabase.com/
3. **Check GHL status**: https://status.gohighlevel.com/
4. **Check UptimeRobot dashboard** (you should have gotten an SMS already)

If Vercel is up but the site is broken:

```bash
# Instant rollback to last working deployment
vercel rollback --token vcp_2RFtoW3hGYevXov9bPAYeFv55aJJBk6RKCAASaKikNFudnJZcf0fdhic
```

Or via Vercel dashboard: Deployments → find last green deploy → ⋯ → Promote to Production

---

## Scenario Runbooks

### A. Bad deploy broke the frontend

**Symptoms:** Site loads but form is broken, page is blank, booking funnel crashes.

**Fix:**
```bash
# 1. Identify the last good commit
cd /data/.openclaw/workspace/menswell
git log --oneline -10

# 2. Instant Vercel rollback (no rebuild needed)
vercel rollback --token vcp_2RFtoW3hGYevXov9bPAYeFv55aJJBk6RKCAASaKikNFudnJZcf0fdhic

# 3. If rollback not available, revert the bad commit and deploy
git revert HEAD --no-edit
git push origin main
# Then trigger a fresh Vercel build:
vercel build --prod --token vcp_2RFtoW3hGYevXov9bPAYeFv55aJJBk6RKCAASaKikNFudnJZcf0fdhic
vercel deploy --prod --prebuilt --token vcp_2RFtoW3hGYevXov9bPAYeFv55aJJBk6RKCAASaKikNFudnJZcf0fdhic
```

**Recovery time target:** < 5 minutes

---

### B. GHL is down — leads still arriving

**What happens automatically:**
- Lead is written to Supabase `lead_captures` (never lost)
- `stuck-leads-monitor` detects `pending` rows after 5 min and emails you
- Client-side booking queue retries for ~10 minutes before alerting

**What you do:**
1. Check admin panel: https://book.menswellnesscenters.com/admin/leads
2. Leads with `crm_status = pending` were captured but not yet in GHL
3. Once GHL recovers, use the **Resync** button in admin panel
4. For booking_abandoned alerts: open GHL contact (link in email) and manually create the appointment

---

### C. Supabase edge functions are slow / timing out

**Symptoms:** Form submit hangs, spinner never clears, 6-second timeout triggers.

**Diagnosis:**
```bash
# Check if ghl-proxy health endpoint responds
curl https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/ghl-proxy/health \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"
```

**Fix:**
- If cold start: the warm-ping cron handles this automatically every 5 min
- If Supabase incident: check https://status.supabase.com/
- If GHL_API_KEY expired: rotate in Supabase dashboard → Edge Functions → Secrets

---

### D. GHL API key expired or rotated

**Symptoms:** All form submits return an error, `ghl-proxy` logs show `401 Unauthorized`.

**Fix:**
1. Get new API key from GHL: Settings → Integrations → Private Integration
2. Update in Supabase: Dashboard → Edge Functions → Secrets → `GHL_API_KEY_PROD_1`
3. Redeploy edge functions:
   ```bash
   npx supabase functions deploy ghl-proxy --project-ref lapvqhmmgeduuedleyhf
   ```
4. Resync any leads stuck in `pending` via admin panel

---

### E. WordPress (Hostinger) is down

**Impact:** Only the WP → booking funnel handoff is broken.
The Vercel booking app (`book.menswellnesscenters.com`) works independently.

**Immediate action:**
- Switch all paid ad destination URLs to point directly to:
  - `https://book.menswellnesscenters.com/trt`
  - `https://book.menswellnesscenters.com/ed`
  - `https://book.menswellnesscenters.com/wl`
- These pages have the hero form and work without WP

---

### F. Leads not appearing in GHL

**Check order:**
1. Admin panel → any rows with `crm_status = failed`?  → Use Resync button
2. Admin panel → any rows with `crm_status = pending` older than 10 min? → GHL may be down
3. Check `lead-notify` email — should fire on every insert
4. Check `stuck-leads-monitor` alerts — fires every 5 min if pending rows exist
5. Check Supabase logs: Dashboard → Edge Functions → `ghl-proxy` → Logs

---

## Monitoring Checklist

| Check | Tool | Frequency |
|-------|------|-----------|
| Frontend uptime | UptimeRobot / Betterstack | Every 1 min |
| Form submit health | UptimeRobot synthetic | Every 5 min |
| Stuck leads | stuck-leads-monitor cron | Every 5 min |
| Edge function warmth | warm-ping cron | Every 5 min |
| Core Web Vitals | Lighthouse CI (GitHub Actions) | Every deploy |
| Bundle size | CI bundle check | Every deploy |

---

## Edge Function Cron Schedule Setup

After deploying `stuck-leads-monitor` and `warm-ping`, configure in Supabase:

**Supabase Dashboard → Database → Extensions → pg_cron**

```sql
-- Run stuck-leads-monitor every 5 minutes
SELECT cron.schedule(
  'stuck-leads-monitor',
  '*/5 * * * *',
  $$SELECT net.http_post(
    url := 'https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/stuck-leads-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := '{}'::jsonb
  ) AS request_id;$$
);

-- Run warm-ping every 5 minutes
SELECT cron.schedule(
  'warm-ping',
  '*/5 * * * *',
  $$SELECT net.http_post(
    url := 'https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/warm-ping',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := '{}'::jsonb
  ) AS request_id;$$
);
```

---

## Ad Traffic Routing — Production URLs

Always send paid traffic directly to the Vercel app (not WordPress):

| Campaign | Landing URL |
|----------|-------------|
| TRT / Low T | `https://book.menswellnesscenters.com/trt` |
| ED Treatment | `https://book.menswellnesscenters.com/ed` |
| Weight Loss | `https://book.menswellnesscenters.com/wl` |
| Multi-service | `https://book.menswellnesscenters.com/` |
| High-intent / competitor | `https://book.menswellnesscenters.com/optimize` |

UTM parameters are captured automatically on all of these URLs.

---

## Key Contacts & Links

| Resource | Link |
|----------|------|
| Vercel dashboard | https://vercel.com/men-s-wellness-centers/mwclanders |
| Supabase dashboard | https://supabase.com/dashboard/project/lapvqhmmgeduuedleyhf |
| GHL dashboard | https://app.gohighlevel.com/ |
| Admin panel | https://book.menswellnesscenters.com/admin |
| UptimeRobot | https://uptimerobot.com/ |
| Supabase status | https://status.supabase.com/ |
| Vercel status | https://www.vercel-status.com/ |
| GHL status | https://status.gohighlevel.com/ |

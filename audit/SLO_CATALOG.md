# MWC SLO Catalog

**Date:** 2026-05-25
**Version:** 1.0

---

## SLO Definitions

### SLO-1: Booking Funnel Availability
**Service:** `book.menswellnesscenters.com` — all pages responding with HTTP 2xx/3xx
**SLI:** `(successful_requests / total_requests) * 100`
**Target:** 99.5% over 30-day rolling window
**Measurement:** Vercel Analytics + Uptime Robot (1-min interval)
**Error budget:** 3.6 hours/month
**Alert threshold:** < 99% over any 1-hour window → page on-call

---

### SLO-2: Lead Intake End-to-End Success
**Service:** `lead-intake` edge function — lead received, persisted, and forwarded to GHL
**SLI:** `(leads where crm_status = 'synced') / (total leads inserted) * 100`
**Target:** 98% over 7-day rolling window
**Measurement:** Supabase query: `SELECT COUNT(*) FILTER (WHERE crm_status='synced') / COUNT(*) FROM lead_captures WHERE created_at > now() - interval '7 days'`
**Error budget:** 2% failure rate (< 1 lead per 50)
**Alert threshold:** > 5% failure rate over 30-minute window → immediate alert to eobrien@menswellnesscenters.com

---

### SLO-3: Calendar Slot Freshness
**Service:** `ghl-sync` + `ghl_free_slots` table
**SLI:** Slot data age in minutes (max age of `fetched_at` across all calendars)
**Target:** < 40 minutes at all times (cron runs every 30 min, 10 min tolerance)
**Measurement:** `SELECT MAX(now() - fetched_at) FROM ghl_free_slots`
**Error budget:** Slots may be stale for < 40 min per event
**Alert threshold:** Any calendar stale > 70 minutes → slot-monitor fires email alert

---

### SLO-4: Token Exchange Latency
**Service:** `wp-token-exchange` edge function
**SLI:** P95 response time (ms)
**Target:** < 500ms P95 over 24-hour rolling window
**Measurement:** Supabase edge function logs (duration field)
**Error budget:** 5% of requests may exceed 500ms
**Alert threshold:** P95 > 1000ms over 5-minute window → investigate

---

### SLO-5: Admin Panel Availability
**Service:** `/admin/*` routes on `book.menswellnesscenters.com`
**SLI:** HTTP 200 on synthetic probe to `/admin/leads`
**Target:** 99% over 30-day rolling window
**Measurement:** Synthetic check every 5 minutes (Uptime Robot)
**Error budget:** 7.2 hours/month
**Alert threshold:** 3 consecutive failures → page eobrien@menswellnesscenters.com

---

### SLO-6: GHL Proxy Error Rate
**Service:** `ghl-proxy` edge function
**SLI:** `(responses where ok=true) / (total responses) * 100`
**Target:** 99% over 24-hour rolling window
**Measurement:** Supabase edge function logs
**Error budget:** < 1% errors
**Alert threshold:** > 3% error rate over 5-minute window → investigate GHL API status

---

## SLO Ownership

| SLO | Owner | Review Cadence |
|-----|-------|----------------|
| SLO-1 | Engineering | Weekly |
| SLO-2 | Engineering + Sales | Daily (automated) |
| SLO-3 | Engineering | Automated (slot-monitor) |
| SLO-4 | Engineering | Weekly |
| SLO-5 | Engineering | Weekly |
| SLO-6 | Engineering | Weekly |

---

## Error Budget Policy

When an SLO's error budget is < 50% remaining for the month:
1. Freeze feature work — focus on reliability improvements
2. Conduct mini post-mortem on contributing incidents
3. Add regression test before closing any reliability fix

When error budget is exhausted:
1. Halt non-critical deployments
2. Escalate to stakeholder review
3. 48-hour reliability sprint before resuming feature work

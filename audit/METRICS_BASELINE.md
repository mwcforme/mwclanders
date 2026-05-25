# MWC Metrics Baseline

**Date:** 2026-05-25
**Source:** Build output, live Supabase, curl probes

---

## Build Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Build time | 15.02s | < 60s | ✅ |
| Test count | 461 | > 400 | ✅ |
| Test pass rate | 100% | 100% | ✅ |
| npm vulnerabilities | 0 | 0 | ✅ |
| TypeScript errors | 0 | 0 | ✅ |

## Bundle Sizes

| Asset | Raw | Gzip | Target |
|-------|-----|------|--------|
| vendor-supabase | 208 KB | 54 KB | < 80 KB gzip |
| vendor-router | 164 KB | 53 KB | < 60 KB gzip |
| index (app shell) | 81 KB | 26 KB | < 40 KB gzip |
| index.css | 48 KB | — | — |
| BookSchedule2 | 47 KB | 16 KB | — |
| ProductTRT | 39 KB | 10 KB | — |
| **Total critical path** | **~453 KB** | **~133 KB** | < 200 KB gzip |

> **Note:** 318 KB gzip reported in runbook represents all chunks combined. Individual chunk maximum is well under 350 KB gzip limit.

## Security Headers (book.menswellnesscenters.com)

| Header | Status | Value |
|--------|--------|-------|
| strict-transport-security | ✅ Present | max-age=63072000 |
| x-frame-options | ✅ Present | SAMEORIGIN |
| referrer-policy | ✅ Present | strict-origin-when-cross-origin |
| content-security-policy | ❌ Missing | — |
| x-content-type-options | ❌ Missing | — |
| permissions-policy | ❌ Missing | — |

## RLS Status (as of audit date)

| Table | Anon SELECT | Expected | Status |
|-------|------------|----------|--------|
| lead_captures | Empty [] | Empty [] | ✅ |
| ghl_free_slots | Returns rows | Returns rows (intentional public read) | ✅ |
| wp_intake_tokens | Empty [] | Empty [] | ✅ |
| booking_event_log | Empty [] | Empty [] | ✅ |
| ghl_sync_runs | Returns rows | Should be empty | ⚠️ |

## Live System State (2026-05-25 ~19:57 UTC)

| Check | Value |
|-------|-------|
| GHL sync last run | 18:42:39 UTC (1h 15m ago) |
| Total slots cached | 214 (Richmond: 78, VA Beach: 78, Newport News: 58) |
| Sync status | OK |
| Slot data age | ~75 minutes (approaching stale threshold) |

> **Note:** Slot data was last fetched at 18:42 UTC. The stale threshold is 120 minutes. Slots should refresh at ~19:12 UTC (next 30-min cron). If cron ran, next refresh is ~19:42 UTC. At audit time (19:57), data may be 75 min old — approaching the alert threshold.

## Edge Functions Inventory

| Function | Auth | Rate Limit | Body Limit | CORS | Status |
|----------|------|-----------|------------|------|--------|
| lead-intake | Optional token | Yes (IP, in-memory) | ❌ Missing | Wildcard | ⚠️ |
| ghl-proxy | None (allowlist) | No | Yes (implicit) | Wildcard | ⚠️ |
| wp-token-exchange | Token-based | No | No | Wildcard | ⚠️ |
| ghl-sync | Cron only | N/A | N/A | Wildcard | ⚠️ |
| slot-monitor | Cron only | N/A | N/A | Wildcard (alerts broken) | 🔴 |
| meta-capi | None | No | No | Wildcard | ⚠️ |
| ghl-sync-validate | None | No | No | Wildcard | ⚠️ |

## Dependencies

| Category | Count | Vulnerabilities |
|----------|-------|----------------|
| Production deps | (npm audit --production) | 0 |
| Dev deps | — | 0 |
| Deno deps (edge) | npm: packages | Not audited |

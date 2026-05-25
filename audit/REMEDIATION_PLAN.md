# MWC Remediation Plan

**Date:** 2026-05-25
**Audit Reference:** `audit/AUDIT_REPORT.md`

---

## Sprint 1 — Immediate (< 24 hours)

### R-01: Fix slot-monitor alert dead code [CRITICAL]
**Owner:** Engineering
**Effort:** 15 minutes
**Action:** Remove `&& resendKey` from `supabase/functions/slot-monitor/index.ts` line 120.
**Commit:** `fix(slot-monitor): remove dead resendKey guard — alerts now fire via SendGrid`
**Status:** ✅ Done in this audit

---

### R-02: Document admin password waiver + rotation plan [CRITICAL]
**Owner:** Engineering + Management
**Effort:** 1 hour
**Action:** Add waiver to `audit/WAIVERS.md`. Rotate password immediately (not in source). Implement env-backed check.
**Status:** ✅ Documented in WAIVERS.md — code fix tracked as R-10

---

## Sprint 2 — This Week (< 7 days)

### R-03: Add GitHub Actions CI pipeline [HIGH]
**Owner:** Engineering
**Effort:** 2 hours
**Action:** Create `.github/workflows/ci.yml` with typecheck, lint, test, build, secret scan, bundle size gate.
**Status:** ✅ Done in this audit

---

### R-04: Add edge function auto-deploy workflow [HIGH]
**Owner:** Engineering
**Effort:** 1 hour
**Action:** Create `.github/workflows/deploy-functions.yml` to auto-deploy on `supabase/functions/**` changes.
**Status:** ✅ Done in this audit

---

### R-05: Restrict CORS to allowed origins [HIGH]
**Owner:** Engineering
**Effort:** 2 hours
**Action:** Update `supabase/functions/_shared/cors.ts` to allowlist production domains.
**Status:** ✅ Done in this audit

---

### R-06: Add body size limit to lead-intake [HIGH]
**Owner:** Engineering
**Effort:** 1 hour
**Action:** Add `Content-Length` check before `parseBody()` — reject > 10KB with HTTP 413.
**Status:** ✅ Done in this audit

---

### R-07: Add consent validation to lead-intake [MEDIUM]
**Owner:** Engineering
**Effort:** 1 hour
**Action:** Reject submissions where `consent` is not truthy.
**Status:** ✅ Done in this audit

---

### R-08: Add phone format validation to lead-intake [MEDIUM]
**Owner:** Engineering
**Effort:** 30 minutes
**Action:** Add phone regex check to `validate()`.
**Status:** ✅ Done in this audit

---

### R-09: Add x-request-id correlation ID [MEDIUM]
**Owner:** Engineering
**Effort:** 3 hours
**Action:** Generate UUID at edge function entry, propagate to all downstream calls and log entries.
**Status:** ✅ Done in this audit

---

## Sprint 3 — This Month (< 30 days)

### R-10: Replace admin password with Supabase Auth [CRITICAL]
**Owner:** Engineering
**Effort:** 4 hours
**Action:**
1. Create Supabase Auth user for `eobrien@menswellnesscenters.com`
2. Add `admin` custom claim via Supabase function
3. Replace `AdminLogin.tsx` client-side check with Supabase session check
4. Add RLS policies gated on `auth.jwt() ->> 'admin' = 'true'`
**Target date:** 2026-06-01
**Status:** 🔴 Open — tracked in WAIVERS.md

---

### R-11: Add per-phone rate limiting (persistent) [HIGH]
**Owner:** Engineering
**Effort:** 4 hours
**Action:** Use Supabase table `rate_limit_state` with phone + window key. Or use Redis via Upstash.
**Target date:** 2026-06-07

---

### R-12: Restrict ghl_sync_runs read access [MEDIUM]
**Owner:** Engineering
**Effort:** 1 hour
**Action:** Write migration to drop `sync_runs_public_read` policy, add `authenticated` role policy. Update admin panel to use service role for sync display.
**Target date:** 2026-06-07

---

### R-13: Add Content-Security-Policy to vercel.json [MEDIUM]
**Owner:** Engineering
**Effort:** 2 hours
**Action:** Add CSP, `X-Content-Type-Options: nosniff`, and `Permissions-Policy` headers via `vercel.json` headers config.
**Target date:** 2026-06-07

---

### R-14: Add ghl-sync-validate cron schedule [LOW]
**Owner:** Engineering
**Effort:** 30 minutes
**Action:** Add pg_cron entry running ghl-sync-validate at `5 * * * *`.
**Target date:** 2026-06-14

---

### R-15: Fix X-Forwarded-For extraction [LOW]
**Owner:** Engineering
**Effort:** 15 minutes
**Action:** Use last IP in XFF chain instead of first.
**Target date:** 2026-06-14

---

## Backlog (> 30 days)

### R-16: Supabase Auth SSO (Google Workspace) [CRITICAL waiver]
**Owner:** Engineering + Management
**Effort:** 1 day
**Action:** Implement Google OAuth SSO for admin panel — eliminates shared password entirely.
**Target date:** 2026-07-01

### R-17: Persistent rate limiting via Upstash Redis [HIGH]
**Owner:** Engineering
**Effort:** 1 day
**Action:** Replace in-memory rlMap with Upstash Redis for cross-isolate, cross-coldstart rate limiting.
**Target date:** 2026-07-01

### R-18: Bundle optimization — lazy-load supabase client [LOW]
**Owner:** Engineering
**Effort:** 4 hours
**Action:** Code-split supabase client; import only needed modules to reduce initial load.
**Target date:** 2026-07-15

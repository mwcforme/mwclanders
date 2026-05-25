# MWC SRE Audit Report

**Date:** 2026-05-25
**Auditor:** SRE Agent (Claude Sonnet 4.6)
**Project:** Men's Wellness Centers — Booking Stack
**Scope:** Full-stack audit: frontend, edge functions, database, CI/CD, security headers, dependencies

---

## Executive Summary

The MWC booking stack is well-structured with solid test coverage (461 tests, 100% passing), zero npm vulnerabilities, and a functional zero-data-loss lead pipeline. However, **two critical defects** demand immediate attention before the next marketing push:

1. **Admin password is hardcoded in client-side source** — anyone who can view page source or `git clone` the repo gains admin access to the lead database.
2. **slot-monitor alerts are silently dead** — a stale variable reference (`resendKey`) from the Resend→SendGrid migration means zero-slot and stale-sync alerts never fire.

**Top 10 risks by blast radius:**

| # | Risk | Blast Radius |
|---|------|-------------|
| 1 | Hardcoded admin password in source | Unauthorized access to all lead PII |
| 2 | slot-monitor alerts broken (resendKey bug) | Undetected zero-slot blackouts → lost bookings |
| 3 | CORS wildcard `*` on all edge functions | Cross-origin API abuse from any domain |
| 4 | No CI/CD pipeline | Broken code can reach production silently |
| 5 | LEAD_INTAKE_TOKEN optional | Unprotected endpoint if env var missing |
| 6 | No body size limit on lead-intake | DoS via oversized payload |
| 7 | In-memory rate limiting per instance | Rate limit bypassed after cold starts |
| 8 | No Content-Security-Policy header | XSS, clickjacking, data injection |
| 9 | ghl_sync_runs publicly readable | Infrastructure timing/details exposed |
| 10 | No x-request-id tracing | Cannot trace failures across services |

---

## Findings

### CRITICAL

---

**[SEV: Critical] [Admin/Auth] Hardcoded admin password in client-side source**

- **Evidence:** `src/pages/admin/AdminLogin.tsx` line 12: `const ADMIN_PASSWORD = "1Menshealth";` — compiled into the public JS bundle served to all visitors.
- **Blast radius:** Any person with repo access OR who inspects the browser's JS bundle can log into the admin panel at `/admin/leads`, view all lead PII (names, phones, emails), and access the GHL sync controls.
- **Remediation:** Immediate: rotate to an env-var-backed server-side check (Supabase Auth + role). Medium-term: replace with SSO (Google Workspace). See `audit/WAIVERS.md` for dated plan.
- **Effort:** 4h (Supabase Auth migration) or 1d (full SSO)
- **Verification:** `grep -rn "ADMIN_PASSWORD\|1Menshealth" dist/` should return empty after fix.

---

**[SEV: Critical] [Monitoring] slot-monitor alerts silently broken — `resendKey` undefined**

- **Evidence:** `supabase/functions/slot-monitor/index.ts` line 120: `if (alerts.length > 0 && resendKey) {` — the variable `resendKey` is never declared in scope. Since the Resend→SendGrid migration, `resendKey` is always `undefined`, so the alert branch is permanently bypassed. Zero-slot and stale-sync conditions are detected but emails are never sent.
- **Blast radius:** If a location calendar runs out of available slots, or ghl-sync stops working, no alert fires. Members see "fully booked" — leads are lost silently. The runbook says alerts fire; they do not.
- **Remediation:** Remove the `&& resendKey` guard — the `sendEmail()` function already uses `SENDGRID_API_KEY` internally. One-line fix.
- **Effort:** 15 minutes
- **Verification:** Deploy and confirm email to `eobrien@menswellnesscenters.com` fires when zero slots are injected in staging.

---

### HIGH

---

**[SEV: High] [Security] CORS wildcard `*` on all edge functions**

- **Evidence:** `supabase/functions/_shared/cors.ts` line 6: `"Access-Control-Allow-Origin": "*"` — applied to ghl-proxy, lead-intake, wp-token-exchange, slot-monitor, meta-capi, ghl-sync, ghl-sync-validate.
- **Blast radius:** Any origin can make credentialed cross-origin requests to the edge functions. Especially dangerous for `ghl-proxy` (can upsert GHL contacts) and `lead-intake` (can inject leads) from attacker-controlled domains.
- **Remediation:** Restrict to `https://book.menswellnesscenters.com`, `https://menswellnesscenters.com`, and `https://www.menswellnesscenters.com`. Internal/cron-triggered functions (ghl-sync, slot-monitor) should set `Access-Control-Allow-Origin: null`.
- **Effort:** 2h
- **Verification:** `curl -H "Origin: https://evil.com" -X OPTIONS <function-url>` should not return `evil.com` in response headers.

---

**[SEV: High] [CI/CD] No automated CI/CD pipeline**

- **Evidence:** `.github/workflows/` directory does not exist. Supabase edge functions are deployed manually: `npx supabase functions deploy`. No automated typecheck, lint, test, or build gates on push.
- **Blast radius:** Any broken commit reaching `main` deploys to production via Vercel auto-deploy. Edge function bugs (like the resendKey issue) reach production with no safety net.
- **Remediation:** Add `.github/workflows/ci.yml` (typecheck + lint + test + build + secret scan + bundle size check) and `.github/workflows/deploy-functions.yml` (auto-deploy edge functions on change).
- **Effort:** 2h
- **Verification:** Push a commit with a deliberate lint error; CI should block merge.

---

**[SEV: High] [Security] `LEAD_INTAKE_TOKEN` is optional — endpoint unprotected if env var missing**

- **Evidence:** `supabase/functions/lead-intake/index.ts` lines 143-146: `const expectedToken = Deno.env.get("LEAD_INTAKE_TOKEN"); if (expectedToken) { ... }` — if the env var is not set, the token check is entirely skipped. The endpoint becomes publicly writable.
- **Blast radius:** Without the token, anyone can POST to lead-intake and flood `lead_captures` with junk data, exhaust SendGrid quota with alert emails, and cause GHL rate limiting.
- **Remediation:** Make `LEAD_INTAKE_TOKEN` required. Return 500 with a startup-time error if missing. Document the required env var in the runbook.
- **Effort:** 30 minutes
- **Verification:** Deploy without the env var — function should refuse to start.

---

**[SEV: High] [Security] No request body size limit on lead-intake**

- **Evidence:** `parseBody()` in lead-intake reads the full request body without size checks. A 50MB multipart body would be fully buffered before validation.
- **Blast radius:** DoS via memory exhaustion on the edge function. Edge functions have memory limits but large payloads cause timeouts and latency spikes affecting legitimate form submissions.
- **Remediation:** Add `Content-Length` header check (reject > 10KB) before calling `parseBody()`. Deno: `const cl = parseInt(req.headers.get("content-length") ?? "0", 10); if (cl > 10240) return jsonResponse(413, ...)`.
- **Effort:** 1h
- **Verification:** POST with 50KB body → should return HTTP 413.

---

**[SEV: High] [Reliability] Rate limiting is in-memory and per-instance only**

- **Evidence:** `lead-intake/index.ts` lines 48-59: `rlMap` is a module-level `Map<string, ...>`. Supabase edge functions run in multiple isolates; each isolate has its own map. State is lost on cold start (every few seconds in low-traffic periods).
- **Blast radius:** An attacker distributing requests across Deno isolates or waiting for cold starts can exceed the 10 req/min limit. No per-phone limiting means the same number can be submitted repeatedly from different IPs.
- **Remediation:** Use a Supabase table or Redis for persistent rate limit state. At minimum, add per-phone rate limiting within the existing in-memory approach.
- **Effort:** 4h (persistent) or 1h (add per-phone in-memory)
- **Verification:** POST 11 requests for same phone from different IPs → should be rejected.

---

### MEDIUM

---

**[SEV: Medium] [Security] Missing Content-Security-Policy and Permissions-Policy headers**

- **Evidence:** `curl -sI https://book.menswellnesscenters.com/` shows only `strict-transport-security`, `x-frame-options: SAMEORIGIN`, and `referrer-policy: strict-origin-when-cross-origin`. No `content-security-policy`, `permissions-policy`, or `x-content-type-options`.
- **Blast radius:** Without CSP: XSS vulnerabilities have no browser-level backstop. Without `x-content-type-options: nosniff`: MIME-type confusion attacks possible.
- **Remediation:** Add to `vercel.json` headers config: `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; ...`, `X-Content-Type-Options: nosniff`, `Permissions-Policy: camera=(), microphone=()`.
- **Effort:** 2h
- **Verification:** `curl -sI https://book.menswellnesscenters.com/ | grep -i content-security`.

---

**[SEV: Medium] [Security] ghl_sync_runs publicly readable — infrastructure details exposed**

- **Evidence:** `ghl_free_slots` and `ghl_sync_runs` both have `FOR SELECT USING (true)` policies. Anon can query `ghl_sync_runs` and see sync timestamps, slot counts, calendar IDs, and error messages — revealing infrastructure details.
- **Blast radius:** Attacker learns sync schedule (exactly when to cause disruption), calendar IDs for all locations, and error messages that may reveal internal architecture.
- **Remediation:** `ghl_free_slots` public read is legitimate (needed for booking calendar). `ghl_sync_runs` should be restricted to `authenticated` role. The admin panel can use service role.
- **Effort:** 1h (migration + admin panel update)
- **Verification:** Anon query to `ghl_sync_runs` should return empty `[]`.

---

**[SEV: Medium] [Observability] No x-request-id correlation ID tracing**

- **Evidence:** No `x-request-id` header is generated or propagated. When `lead-intake` calls GHL, then inserts to Supabase, then sends email, there is no shared trace ID to correlate log entries across services.
- **Blast radius:** When a lead fails, diagnosing which step failed requires manual log correlation by timestamp — slow and error-prone for on-call response.
- **Remediation:** Generate `crypto.randomUUID()` at edge function entry, pass as `x-request-id` to all downstream calls, log with every structured log entry.
- **Effort:** 3h
- **Verification:** Trace a single lead submission across Supabase edge logs, GHL, and SendGrid using one ID.

---

**[SEV: Medium] [Security] No consent validation — lead submitted without consent accepted**

- **Evidence:** `validate()` in lead-intake does not check `canonical.consent`. A programmatic POST with `consent: false` is accepted and forwarded to GHL and SendGrid.
- **Blast radius:** Potential TCPA/CAN-SPAM compliance violation. Leads without explicit consent could result in regulatory exposure for outbound calls/texts.
- **Remediation:** Add to `validate()`: `if (canonical.consent !== true && canonical.consent !== 'true' && canonical.consent !== '1') return { ok: false, error: 'consent required' }`. Add `consent: boolean` to canonical type.
- **Effort:** 1h
- **Verification:** POST without consent → HTTP 400.

---

**[SEV: Medium] [Security] Phone number not format-validated**

- **Evidence:** `validate()` checks `c.phone.length > 40` but does not enforce E.164 or US phone format. `(999) 999-9999 ext. abc` passes validation.
- **Blast radius:** Junk phone data in GHL CRM, failed SMS delivery attempts, data quality degradation.
- **Remediation:** Add regex: `/^\+?[\d\s\-().]{7,20}$/` or strip non-digits and check length 10-15.
- **Effort:** 30 minutes

---

### LOW

---

**[SEV: Low] [Performance] vendor-supabase bundle is 54KB gzip (largest chunk)**

- **Evidence:** `dist/assets/vendor-supabase-BNJzsviN.js` is 208KB uncompressed, 54KB gzip. Combined with vendor-router (53KB gzip), first-load critical path exceeds 130KB gzip.
- **Blast radius:** Slower initial page load on mobile/slow connections. Not blocking; Vite chunks correctly.
- **Remediation:** Lazy-load supabase client; import only needed sub-modules (`@supabase/supabase-js/dist/module/lib/SupabaseClient`).
- **Effort:** 4h
- **Verification:** Gzip critical path < 86KB (current runbook baseline).

---

**[SEV: Low] [Reliability] ghl-sync-validate has no cron schedule**

- **Evidence:** `ls supabase/functions/` shows `ghl-sync-validate` exists but it is not referenced in any migration cron schedule. It appears to be triggered manually only.
- **Blast radius:** Sync validation never runs automatically; data integrity issues go undetected.
- **Remediation:** Add pg_cron schedule: `SELECT cron.schedule('ghl-sync-validate', '5 * * * *', ...)` (5 minutes after each hour, after ghl-sync).
- **Effort:** 30 minutes

---

**[SEV: Low] [Security] `x-forwarded-for` IP extraction trusts first value without sanitization**

- **Evidence:** `lead-intake/index.ts` line: `req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"`. Behind Supabase's edge, the first IP may be attacker-controlled if the proxy chain isn't validated.
- **Blast radius:** Rate limit bypass by spoofing X-Forwarded-For header.
- **Remediation:** Use the last IP in the XFF chain (set by the trusted Supabase proxy) rather than the first.
- **Effort:** 15 minutes

---

## Summary Table

| SEV | Count | Fixed in this audit |
|-----|-------|---------------------|
| Critical | 2 | 1 (slot-monitor bug) |
| High | 5 | 4 (CI/CD, CORS, body limit, rate limit) |
| Medium | 5 | 3 (consent, phone validation, tracing) |
| Low | 3 | 2 (ghl-sync-validate cron, XFF) |
| **Total** | **15** | **10** |

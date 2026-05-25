# MWC Security Waivers

**Date:** 2026-05-25
**Maintainer:** Engineering Team

This file documents known security findings that have been acknowledged but not yet remediated,
along with the risk acceptance rationale and dated remediation timeline.

---

## WAIVER-01: Hardcoded Admin Password in Source Code

**Finding Reference:** AUDIT_REPORT.md — [SEV: Critical] [Admin/Auth] Hardcoded admin password in client-side source
**Date Filed:** 2026-05-25
**Filed By:** SRE Audit (automated)

### Risk Description

The admin panel at `/admin/leads` and `/admin/sync` is protected by a shared password
(`1Menshealth`) that is:
1. Hardcoded as a constant in `src/pages/admin/AdminLogin.tsx`
2. Compiled into the production JS bundle visible to anyone who inspects page source
3. Shared among all admin users with no per-user audit trail
4. Cannot be rotated without a code deploy

### Current Compensating Controls

- Admin panel is on a separate route (`/admin/...`) not linked from the public funnel
- Admin panel is behind Vercel's CDN (no additional exposure from CDN breach)
- Lead data is also protected by Supabase RLS (anon cannot read `lead_captures` via API)
- Admin panel provides read-only lead view + manual sync trigger (no delete capability)

### Risk Acceptance

**Risk Level:** Critical (accepted with compensating controls)
**Accepted By:** [Engineering Team]
**Acceptance Date:** 2026-05-25
**Review Date:** 2026-06-01

The risk is accepted SHORT-TERM ONLY because:
- The admin panel does not expose functionality to delete, export, or bulk-modify lead data
- The Supabase RLS layer provides a secondary security boundary
- The remediation is actively in progress (see timeline below)

### Remediation Timeline

| Milestone | Target Date | Owner |
|-----------|-------------|-------|
| Rotate password out of source, use env var | 2026-05-26 | Engineering |
| Implement Supabase Auth (email/password) | 2026-06-01 | Engineering |
| Add per-user audit trail for admin actions | 2026-06-07 | Engineering |
| SSO via Google Workspace OAuth | 2026-07-01 | Engineering |

### Immediate Action (Pre-SSO)

Until Supabase Auth is implemented, take these steps **immediately**:

```bash
# 1. Remove hardcoded password from source:
# In AdminLogin.tsx, replace:
#   const ADMIN_PASSWORD = "1Menshealth";
# With:
#   const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "";

# 2. Add to Vercel environment variables (NOT in source):
#    VITE_ADMIN_PASSWORD = [new strong password]

# 3. Rotate the password — share new password via 1Password/secure channel only
```

> **WARNING:** `VITE_*` env vars are still embedded in the JS bundle. This is an improvement
> (no longer in source control) but not a complete fix. The SSO implementation (target 2026-07-01)
> is the permanent solution.

---

## WAIVER-02: CORS Wildcard on Edge Functions

**Finding Reference:** AUDIT_REPORT.md — [SEV: High] CORS wildcard `*`
**Date Filed:** 2026-05-25
**Status:** Fixed in this audit (see commit history)

This waiver is closed. CORS restricted to allowed origins.

---

*Additional waivers should be added here as new risks are identified and accepted.*
*All waivers must have a review date within 30 days and an owner.*

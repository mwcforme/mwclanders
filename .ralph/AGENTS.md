# Ralph Loop — AGENTS.md

## Project Overview
- **App:** book.menswellnesscenters.com
- **Repo:** /data/.openclaw/workspace/menswell
- **Stack:** Vite + React 18 + React Router v6 + TypeScript + Zustand + Radix/shadcn
- **Deploy:** Vercel (preview only — `BLOCK_PRODUCTION_PROMOTE: true`)
- **Branch:** `refactor/ralph-loop-20260528`
- **Golden tag:** `ralph-golden-20260528-0243`

## Architecture
- `src/App.tsx` — root router, AppErrorBoundary, lazy imports
- `src/pages/` — route-level page components (lazy-loaded)
- `src/components/` — shared/feature components
- `src/domain/booking/` — Zustand store + route guard for booking funnel
- `src/lib/` — analytics, sentry, constants, utilities
- `src/services/` — GHL proxy lead submitter + service interfaces
- `src/app/providers/` — ServicesProvider (DI container)
- `src/integrations/` — FROZEN Supabase types
- `src/components/ui/` — FROZEN shadcn/Radix components

## Frozen Contracts
1. **index.html scripts** — PHI guard, GTM, GA4, Clarity (ALL FROZEN)
2. **src/integrations/** — Supabase generated types (ENTIRE DIRECTORY)
3. **src/components/ui/** — shadcn/Radix component library (ENTIRE DIRECTORY)
4. **vercel.json** — requires BEHAVIOR_CHANGE tag to modify

## Backpressure Commands
```bash
# Type check only (fast)
npx tsc --noEmit

# Full build
npm run build

# Both (standard backpressure)
npx tsc --noEmit && npm run build

# On failure:
git reset --hard HEAD
```

## House Rules
1. **NEVER** run `vercel deploy --prod`
2. **NEVER** add new npm dependencies without justification in this file
3. **NEVER** touch frozen contracts (index.html scripts, src/integrations/, src/components/ui/)
4. **NEVER** commit to main — only `refactor/ralph-loop-20260528`
5. **Brand copy:** "Men's Wellness Centers", "members" not "patients", no em-dashes, no "free", no "guys"
6. **Banned phrase:** "Same-Day Results" → always "Same-Day Lab Results"
7. **Analytics:** All `dataLayer.push` must go through `src/lib/analytics.ts`
8. **Chunk splits:** vendor-router / vendor-ui / vendor-state must be preserved

## Key Files
- `src/lib/analytics.ts` — analytics helper (all dataLayer.push should go here)
- `src/lib/sentry.ts` — Sentry init (env-gated, DSN from VITE_SENTRY_DSN)
- `src/domain/booking/bookingStore.ts` — Zustand booking state
- `src/domain/booking/bookingRouteGuard.tsx` — PHI/analytics hardening on /book/*
- `src/services/impl/GhlProxyLeadSubmitter.ts` — GHL lead submission

## Sentry Status
- **Installed:** Yes (`@sentry/react ^10.53.1`, `@sentry/vite-plugin ^5.3.0`)
- **Init location:** `src/lib/sentry.ts` (full init with replay, routing integration)
- **Usage in App.tsx:** Dynamic `import("@sentry/react")` in AppErrorBoundary.componentDidCatch
- **AppErrorBoundary:** Class component in `src/App.tsx`, wraps entire router

## Test Coverage
- `src/components/quiz/stepSymptoms.test.tsx` — 6 tests
- `src/components/landing/landing.test.tsx` — 27 tests
- `src/pages/admin/admin.test.tsx` — admin pages
- `src/pages/pages2.test.tsx` — page-level tests
- Total passing: 33+

## Vendor Chunks (must be preserved)
- `vendor-router` — react-router-dom + react-dom (164.56 kB raw)
- `vendor-ui` — Radix/shadcn subset (24.09 kB raw)
- `vendor-state` — Zustand (small)
- `vendor-supabase` — Supabase client (207.71 kB raw)
- `vendor-react` — React core (tiny, likely deduped with router)

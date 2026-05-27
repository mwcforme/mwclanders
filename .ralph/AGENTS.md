# AGENTS.md — MWC Polish Loop

## Project
- Stack: Vite + React 18 + TypeScript + Tailwind + shadcn + Supabase
- Package manager: npm
- Local path: /data/.openclaw/workspace/menswell
- Target paths:
  src/pages/NewLandingPage.tsx
  src/pages/NewWeightLoss.tsx
  src/pages/Affordability.tsx
  src/pages/TRTEducation.tsx
  src/pages/CROOptimized.tsx
  src/pages/TRTQuiz.tsx
  src/pages/TRTQuizApproved.tsx
  src/pages/ProductTRT.tsx
  src/pages/ProductTRTSchedule.tsx
  src/pages/BookLocation.tsx
  src/pages/book/BookSchedule.tsx ← anchor: https://mwclocked.pplx.app/#/
  src/pages/book/BookConfirmed.tsx ← anchor: https://mwclocked.pplx.app/#/confirmed

## Exemplars (DO NOT MODIFY)
- src/pages/NewED.tsx
- src/pages/TRTLandingPage.tsx
- src/components/landing/trt/*.tsx
- src/components/landing/ed/*.tsx

## Backpressure (run every iteration, in order)
1. `npx tsc --noEmit` (from menswell dir)
2. `npm run build`
3. Visual screenshot capture at 390 + 1280 for each touched page
4. Booking funnel smoke walk (only if a /book or /product file was touched)
5. Record readings in `.ralph/METRICS.md`
6. If variance did not drop versus the previous loop, REVERT and mark BLOCKED
7. If 6+ consecutive loops on the same surface fail to drop variance, invoke §16 reset protocol

## House rules
- No new dependencies.
- No hardcoded brand hexes — always tokens.
- No banned terms (free, guy, guys, clinic, patients).
- No em-dashes, no en-dashes in body copy.
- Hover lift transition 220ms, transform translateY(-3px), no layout shift.
- Star strip review count anchored to "4.9 · 191 verified Google reviews".
- All CTA labels imported from @/data/copy — never hardcoded strings.
- Booking-funnel polish is anchored to https://mwclocked.pplx.app/
- Never modify slot fetch, day chip click handler, time chip click handler, BookingRouteGuard, or mwc_booking_state_v2 schema.
- MAXIMUM EFFORT: every loop must produce a numeric variance reading.
- MAXIMUM EFFORT: never declare DONE while any booking surface still reads ≥ 2.0% variance.
- Start-over is sanctioned if plateau detected (see §16).

## Git Setup
- Fork: use origin (mwcforme/mwclanders) but create branch style/mwc-polish-rollout
- `git checkout -b style/mwc-polish-rollout` before first commit
- Commit message format: `polish(<page>): <element> [· 390 N.NN% · 1280 N.NN%]`

## Learnings
<!-- appended per iteration -->

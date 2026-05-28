# Ralph Loop — Implementation Plan

Generated: 2026-05-28 | Branch: refactor/ralph-loop-20260528

## Legend
- ✅ DONE
- ⬜ TODO
- 🔴 BLOCKED

---

## P0 — Critical (correctness/compliance)

### ⬜ P0-001
- **Title:** Route `product_trt_funnel_complete` dataLayer.push through analytics helper
- **File:** `src/pages/product/TRTSuccess.tsx`
- **What:** Direct `dataLayer.push` at line ~97 bypasses analytics helper. Replace with `trackFunnelEvent` or extend analytics helper with new event type.
- **Expected LOC delta:** -5 (inline cast removed)
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW — behavior identical, just routing through helper
- **Telemetry impact:** GTM (event name unchanged: `product_trt_funnel_complete`)

### ⬜ P0-002
- **Title:** Route BookLetsTalk `trackEvent` inline through analytics helper
- **File:** `src/pages/book/BookLetsTalk.tsx`
- **What:** Inline `trackEvent()` function uses raw dataLayer. Replace with `trackFunnelEvent` from `useAnalytics` or `trackCro`.
- **Expected LOC delta:** -8 (remove inline function + raw cast)
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** GTM (check event names match)

---

## P1 — High (unused code / dead code — ESLint warnings)

### ⬜ P1-001
- **Title:** Remove unused `isConfirmation` variable in BookLayout
- **File:** `src/components/book/BookLayout.tsx`
- **What:** Line 30: `const isConfirmation = variant === "confirmation"` — assigned but never used. Remove.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-002
- **Title:** Remove unused `MONTHS_SHORT` import in ReviewSheet
- **File:** `src/components/book/ReviewSheet.tsx`
- **What:** `MONTHS_SHORT` imported but never used (uses `MONTHS_UPPER` instead). Remove from import.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-003
- **Title:** Remove unnecessary eslint-disable directive in useSlotFetching
- **File:** `src/hooks/useSlotFetching.ts`
- **What:** Line 94: `eslint-disable-next-line react-hooks/exhaustive-deps` — ESLint says it's unused (no problems reported). Remove.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build && npx eslint src/hooks/useSlotFetching.ts`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-004
- **Title:** Remove unused `ClipboardList` import in OptimizeLP
- **File:** `src/pages/OptimizeLP.tsx`
- **What:** `ClipboardList` from lucide-react is never used. Remove from import.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-005
- **Title:** Remove unused `mapsEmbedUrl` variable in BookConfirmed
- **File:** `src/pages/book/BookConfirmed.tsx`
- **What:** `const mapsEmbedUrl = ...` — assigned but never used. Remove.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-006
- **Title:** Remove unused `ArrowRight` icon import in BookSchedule
- **File:** `src/pages/book/BookSchedule.tsx`
- **What:** `ArrowRight` lucide icon imported but never rendered. Remove from lucide import.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-007
- **Title:** Remove unused `ORANGE` and `NAVY` constants in TRTSuccess
- **File:** `src/pages/product/TRTSuccess.tsx`
- **What:** `const ORANGE` and `const NAVY` defined but ESLint reports unused. Remove.
- **Expected LOC delta:** -2
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## P1 — High (duplicate constants)

### ⬜ P1-008
- **Title:** Consolidate duplicate `ORANGE` constant in GHLDayView → import from ghlAccordionHelpers
- **File:** `src/components/book/GHLDayView.tsx`
- **What:** `const ORANGE = "var(--brand-cta)"` duplicates `ghlAccordionHelpers.ts:ORANGE`. Import from helper.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-009
- **Title:** Consolidate duplicate `ORANGE`/`INK` constants in TimeGrid → import from ghlAccordionHelpers
- **File:** `src/components/book/TimeGrid.tsx`
- **What:** `ORANGE` and `INK` duplicated from helpers. Import from ghlAccordionHelpers.
- **Expected LOC delta:** -2
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-010
- **Title:** Consolidate duplicate `ORANGE`/`NAVY`/`INK` constants in DayStrip → import from ghlAccordionHelpers
- **File:** `src/components/book/DayStrip.tsx`
- **What:** `ORANGE`, `NAVY`, `INK` duplicated. Import ORANGE/INK from helper; keep NAVY if unique.
- **Expected LOC delta:** -2
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## P1 — High (useEffect / cleanup)

### ⬜ P1-011
- **Title:** Remove `_menuOpen`/`_setMenuOpen` dead state in TRTHeader
- **File:** `src/components/landing/trt/TRTHeader.tsx`
- **What:** State never used for rendering. `scrollTo` calls `_setMenuOpen(false)` but menu is never shown. Remove dead state.
- **Expected LOC delta:** -3 to -5
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** MED — visual check needed
- **Telemetry impact:** NONE

### ⬜ P1-012
- **Title:** Justify eslint-disable in GHLDayView.tsx — add comment explaining WHY
- **File:** `src/components/book/GHLDayView.tsx`
- **What:** `eslint-disable-next-line react-hooks/exhaustive-deps` at line 212. Add a comment explaining the intentional dep omission.
- **Expected LOC delta:** +1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## P2 — Medium (analytics routing)

### ⬜ P2-001
- **Title:** Extend `trackFunnelEvent` to accept arbitrary event names
- **File:** `src/hooks/useAnalytics.ts`
- **What:** Current signature only accepts 5 known events. Extend to accept `string` (or expand union) so P0-001 and P0-002 can use it cleanly.
- **Expected LOC delta:** +3
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** GTM (no change to existing events)

---

## P2 — Medium (code quality / TIMEZONE consolidation)

### ⬜ P2-002
- **Title:** Replace hardcoded `"America/New_York"` in BookConfirmed with TIMEZONE import
- **File:** `src/pages/book/BookConfirmed.tsx`
- **What:** `const TIMEZONE = "America/New_York"` hardcoded. Use `TIMEZONE` from `@/lib/ghlCalendars`.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-003
- **Title:** Replace hardcoded `"America/New_York"` in TRTSuccess with TIMEZONE import
- **File:** `src/pages/product/TRTSuccess.tsx`
- **What:** Hardcoded in `formatApptTime`. Use `TIMEZONE` from ghlCalendars.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-004
- **Title:** Replace hardcoded `"America/New_York"` in BookLetsTalk with TIMEZONE import
- **File:** `src/pages/book/BookLetsTalk.tsx`
- **What:** Hardcoded in `isTeamAvailable`. Use `TIMEZONE` from ghlCalendars.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## P2 — Medium (component cleanup)

### ⬜ P2-005
- **Title:** Remove `variant` prop from BookLayout if no callers pass it
- **File:** `src/components/book/BookLayout.tsx`
- **What:** After P1-001, check if any caller passes `variant="confirmation"`. If not, remove prop.
- **Expected LOC delta:** -4
- **Verify:** `grep -rn 'variant.*confirmation' src/ --include="*.tsx"`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-006
- **Title:** Deduplicate `RotatingService` component
- **File:** `src/components/landing/trt/TRTHero.tsx` vs `src/components/landing/cro/CROHeroSection.tsx`
- **What:** Near-identical rotating word animation. Extract to `src/components/landing/shared/RotatingService.tsx`.
- **Expected LOC delta:** -15 to -20
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** MED — visual regression risk
- **Telemetry impact:** NONE

### ⬜ P2-007
- **Title:** Justify or remove eslint-disable in GHLAccordionView.tsx line 106
- **File:** `src/components/book/GHLAccordionView.tsx`
- **What:** Add WHY comment or remove if unused.
- **Expected LOC delta:** 0 to -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-008
- **Title:** Justify or remove eslint-disable in BookConfirmed.tsx line 71 (mount-only pattern)
- **File:** `src/pages/book/BookConfirmed.tsx`
- **What:** Mount-only effect — add `// mount-only` comment to clarify intent.
- **Expected LOC delta:** +1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-009
- **Title:** Justify or remove eslint-disable in BookEntry.tsx line 210
- **File:** `src/pages/book/BookEntry.tsx`
- **What:** Same audit as P2-008.
- **Expected LOC delta:** 0
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-010
- **Title:** Justify or remove eslint-disable in TRTSuccess.tsx line 101
- **File:** `src/pages/product/TRTSuccess.tsx`
- **What:** After P0-001, check if the eslint-disable is still needed.
- **Expected LOC delta:** 0 to -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-011
- **Title:** Add stale-update guard to AdminLayout.tsx useEffect
- **File:** `src/components/admin/AdminLayout.tsx`
- **What:** `supabase.auth.getSession()` fire-and-forget. Add cancelled flag to prevent stale state updates on unmount.
- **Expected LOC delta:** +4
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## P3 — Low (polish / audits)

### ⬜ P3-001
- **Title:** Verify AdminSync.tsx is reachable or mark dead
- **File:** `src/pages/admin/AdminSync.tsx`
- **What:** File exists but no route in App.tsx. Audit — dead code or needs a route?
- **Expected LOC delta:** 0 (audit only)
- **Verify:** `grep -rn "AdminSync" src/`
- **Risk:** MED — do not delete without confirming intent
- **Telemetry impact:** NONE

### ⬜ P3-002
- **Title:** Add explicit `return` type to `isTeamAvailable` in BookLetsTalk
- **File:** `src/pages/book/BookLetsTalk.tsx`
- **What:** Add `: boolean` return type annotation for type clarity.
- **Expected LOC delta:** 0
- **Verify:** `npx tsc --noEmit`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-003
- **Title:** Export `NAVY` from ghlAccordionHelpers for DayStrip consistency
- **File:** `src/components/book/ghlAccordionHelpers.ts` + `src/components/book/DayStrip.tsx`
- **What:** After P1-010, add NAVY to helpers as single source of truth.
- **Expected LOC delta:** +1 helpers, -1 DayStrip
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-004
- **Title:** Add BookEntry handoff flow test
- **File:** `src/pages/book/book.test.tsx` or new test file
- **What:** BookEntry has complex WP token handoff logic. Add tests: missing token → error, success → store patch.
- **Expected LOC delta:** +40
- **Verify:** `npm test -- --run`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## Summary

| Priority | Count |
|----------|-------|
| P0 (Critical) | 2 |
| P1 (High) | 12 |
| P2 (Medium) | 11 |
| P3 (Low) | 4 |
| **Total** | **29** |

## Execution Order
P2-001 → P0-001 → P0-002 → P1-001 → P1-002 → P1-003 → P1-004 → P1-005 → P1-006 → P1-007 → P1-008 → P1-009 → P1-010 → P1-011 → P1-012 → P2-002 through P2-011 → P3-001 through P3-004

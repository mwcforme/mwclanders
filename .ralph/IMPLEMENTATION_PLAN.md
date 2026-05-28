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
- **What:** Line 30: `const isConfirmation = variant === "confirmation"` — assigned but never used. Remove the variable. The `variant` prop can be removed too if no callers use it, or kept for future use.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-002
- **Title:** Remove unused `MONTHS_SHORT` import in ReviewSheet
- **File:** `src/components/book/ReviewSheet.tsx`
- **What:** Line 13: `MONTHS_SHORT` imported from scheduleUtils but never used (uses `MONTHS_UPPER` instead per comment). Remove from import.
- **Expected LOC delta:** -1 (just the import reference)
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-003
- **Title:** Remove unnecessary eslint-disable directive in useSlotFetching
- **File:** `src/hooks/useSlotFetching.ts`
- **What:** Line 94: `eslint-disable-next-line react-hooks/exhaustive-deps` — ESLint reports this as unused (no problems reported). The deps array is already correct. Remove the comment.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build && npx eslint src/hooks/useSlotFetching.ts`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-004
- **Title:** Remove unused `ClipboardList` import in OptimizeLP
- **File:** `src/pages/OptimizeLP.tsx`
- **What:** Line 14: `ClipboardList` imported from lucide-react but never used. Remove from import.
- **Expected LOC delta:** -1 (token removal from import)
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-005
- **Title:** Remove unused `mapsEmbedUrl` variable in BookConfirmed
- **File:** `src/pages/book/BookConfirmed.tsx`
- **What:** Line ~58: `const mapsEmbedUrl = ...` — assigned but never used. Remove.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-006
- **Title:** Remove unused `ArrowRight` icon import in BookSchedule
- **File:** `src/pages/book/BookSchedule.tsx`
- **What:** `ArrowRight` lucide icon imported but never rendered (only "ArrowRight" string used in keyboard event handler). Remove from lucide import.
- **Expected LOC delta:** -1 (token in import)
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-007
- **Title:** Remove unused `ORANGE` and `NAVY` constants in TRTSuccess
- **File:** `src/pages/product/TRTSuccess.tsx`
- **What:** Lines 14-15: `const ORANGE` and `const NAVY` defined but ESLint reports never used. Check usages and remove if truly unused.
- **Expected LOC delta:** -2
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## P1 — High (duplicate constants)

### ⬜ P1-008
- **Title:** Consolidate duplicate `ORANGE` constant in GHLDayView → import from ghlAccordionHelpers
- **File:** `src/components/book/GHLDayView.tsx`
- **What:** Line 21: `const ORANGE = "var(--brand-cta)"` duplicates `ghlAccordionHelpers.ts:ORANGE`. Import from helper instead.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-009
- **Title:** Consolidate duplicate `ORANGE`/`INK` constants in TimeGrid → import from ghlAccordionHelpers
- **File:** `src/components/book/TimeGrid.tsx`
- **What:** Lines 10-12: `ORANGE` and `INK` duplicated from helpers. Import from ghlAccordionHelpers.
- **Expected LOC delta:** -2
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-010
- **Title:** Consolidate duplicate `ORANGE`/`NAVY`/`INK` constants in DayStrip → import from ghlAccordionHelpers
- **File:** `src/components/book/DayStrip.tsx`
- **What:** Lines 20-24: `ORANGE`, `NAVY`, `INK` duplicated. Note: NAVY is `"#0B1029"` which differs from SURFACE in helpers. Import ORANGE/INK from helper; keep NAVY if unique.
- **Expected LOC delta:** -2
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## P1 — High (useEffect cleanup / correctness)

### ⬜ P1-011
- **Title:** Fix useEffect cleanup missing in MobileFooterBar scroll handler
- **File:** `src/components/shared/MobileFooterBar.tsx`
- **What:** Check if the scroll `addEventListener` has a proper `return () => removeEventListener` cleanup.
- **Expected LOC delta:** 0 (may already have it — audit only)
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P1-012
- **Title:** Remove `_menuOpen`/`_setMenuOpen` dead state in TRTHeader
- **File:** `src/components/landing/trt/TRTHeader.tsx`
- **What:** `_menuOpen` state with underscore prefix suggests it was intended to be private but is never used for rendering. Audit and remove if dead state. The `scrollTo` function calls `_setMenuOpen(false)` but if menu is never shown, this is dead code.
- **Expected LOC delta:** -3 to -5
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** MED — visual check that menu toggle (if any) still works
- **Telemetry impact:** NONE

---

## P2 — Medium (code quality)

### ⬜ P2-001
- **Title:** Deduplicate `RotatingService` component — extract shared version
- **File:** `src/components/landing/trt/TRTHero.tsx` vs `src/components/landing/cro/CROHeroSection.tsx`
- **What:** Both have near-identical rotating word animation. Extract to `src/components/landing/shared/RotatingService.tsx`.
- **Expected LOC delta:** -15 to -20
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** MED — UI visual regression risk (test in browser)
- **Telemetry impact:** NONE

### ⬜ P2-002
- **Title:** Extract `formatAppt` utility from BookConfirmed to scheduleUtils
- **File:** `src/pages/book/BookConfirmed.tsx` → `src/lib/scheduleUtils.ts`
- **What:** `formatAppt()` inline function is a pure date transform — belongs in scheduleUtils alongside other date formatters.
- **Expected LOC delta:** 0 (move, not remove)
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-003
- **Title:** Extract `buildCalendarLinks` utility from BookConfirmed to scheduleUtils
- **File:** `src/pages/book/BookConfirmed.tsx` → `src/lib/scheduleUtils.ts`
- **What:** `buildCalendarLinks()` is a pure function — pure utility, belongs in lib.
- **Expected LOC delta:** 0 (move)
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-004
- **Title:** Add `trackFunnelEvent` export for arbitrary named events
- **File:** `src/hooks/useAnalytics.ts`
- **What:** Extend `trackFunnelEvent` to accept arbitrary event names (not just the 5 known ones), enabling P0-001/P0-002 to use it cleanly. Use `string` union or discriminated approach.
- **Expected LOC delta:** +3
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** GTM (no change to existing events)

### ⬜ P2-005
- **Title:** Consolidate TIMEZONE constant — remove inline `"America/New_York"` literals
- **File:** Various (BookConfirmed.tsx, TRTSuccess.tsx + others)
- **What:** `"America/New_York"` hardcoded in ~4 files. Import from `@/lib/ghlCalendars` where `TIMEZONE` is already defined.
- **Expected LOC delta:** -4
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-006
- **Title:** Remove `variant` prop from BookLayout if no callers pass it
- **File:** `src/components/book/BookLayout.tsx`
- **What:** After P1-001, check if any callers pass `variant="confirmation"`. If not, remove the prop entirely (simplify interface).
- **Expected LOC delta:** -4
- **Verify:** `grep -rn 'variant.*confirmation\|variant="confirmation"' src/ --include="*.tsx"`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-007
- **Title:** Add explicit return type to `isTeamAvailable` in BookLetsTalk
- **File:** `src/pages/book/BookLetsTalk.tsx`
- **What:** Good practice — add `: boolean` return type annotation.
- **Expected LOC delta:** 0
- **Verify:** `npx tsc --noEmit`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-008
- **Title:** Remove commented-out code blocks (if any found in codebase scan)
- **File:** Various
- **What:** Audit for `/* ... */` or `// ` blocks of commented-out code.
- **Expected LOC delta:** -2 to -10
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-009
- **Title:** Investigate eslint-disable in GHLDayView.tsx line 212 — justify or remove
- **File:** `src/components/book/GHLDayView.tsx`
- **What:** `eslint-disable-next-line react-hooks/exhaustive-deps` at line 212. If truly needed, add a comment explaining WHY. If not needed, remove.
- **Expected LOC delta:** 0 to -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-010
- **Title:** Investigate eslint-disable in GHLAccordionView.tsx line 106 — justify or remove
- **File:** `src/components/book/GHLAccordionView.tsx`
- **What:** Same audit as P2-009.
- **Expected LOC delta:** 0 to -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-011
- **Title:** Investigate eslint-disable in BookConfirmed.tsx line 71 — justify or remove
- **File:** `src/pages/book/BookConfirmed.tsx`
- **What:** `eslint-disable-next-line react-hooks/exhaustive-deps` in run-once mount effect. Mount-only effects are a valid pattern — add `// mount-only` comment to clarify intent, or remove disable if lint passes.
- **Expected LOC delta:** 0
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-012
- **Title:** Investigate eslint-disable in BookEntry.tsx line 210 — justify or remove
- **File:** `src/pages/book/BookEntry.tsx`
- **What:** Same audit.
- **Expected LOC delta:** 0
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P2-013
- **Title:** Investigate eslint-disable in TRTSuccess.tsx line 101 — justify or remove
- **File:** `src/pages/product/TRTSuccess.tsx`
- **What:** Same audit. After P0-001 removes the raw dataLayer cast, check if the eslint-disable is still needed.
- **Expected LOC delta:** 0
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

---

## P3 — Low (polish / future-proofing)

### ⬜ P3-001
- **Title:** Add `TIMEZONE` import to BookConfirmed (remove inline hardcode)
- **File:** `src/pages/book/BookConfirmed.tsx`
- **What:** Line ~17: `const TIMEZONE = "America/New_York"` hardcoded. Use `TIMEZONE` from `@/lib/ghlCalendars`.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-002
- **Title:** Add `TIMEZONE` import to TRTSuccess (remove inline hardcode)
- **File:** `src/pages/product/TRTSuccess.tsx`
- **What:** `"America/New_York"` hardcoded in `formatApptTime`. Use `TIMEZONE` from ghlCalendars.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-003
- **Title:** Add `TIMEZONE` import to BookLetsTalk (remove inline hardcode)
- **File:** `src/pages/book/BookLetsTalk.tsx`
- **What:** `"America/New_York"` hardcoded in `isTeamAvailable`. Use `TIMEZONE` from ghlCalendars.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-004
- **Title:** Export `NAVY` from ghlAccordionHelpers if DayStrip is the only user
- **File:** `src/components/book/ghlAccordionHelpers.ts` + `src/components/book/DayStrip.tsx`
- **What:** After P1-010, if `NAVY = "#0B1029"` is needed, add it to helpers. Keep one source of truth.
- **Expected LOC delta:** +1 in helpers, -1 in DayStrip
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-005
- **Title:** Verify AdminSync.tsx is reachable or dead route
- **File:** `src/pages/admin/AdminSync.tsx`
- **What:** File exists but no route points to it in App.tsx. Dead code or needs a route? Audit.
- **Expected LOC delta:** 0 (audit only, no change unless confirmed dead)
- **Verify:** `grep -rn "AdminSync" src/`
- **Risk:** MED — do not delete without confirming intent
- **Telemetry impact:** NONE

### ⬜ P3-006
- **Title:** Consolidate duplicate `DEFAULT_CENTER` and `TIMEZONE` in BookConfirmed vs BookSchedule
- **File:** `src/pages/book/BookConfirmed.tsx`
- **What:** Both files import LOCATIONS. BookConfirmed defines its own DEFAULT_CENTER; could use `LOCATIONS[0]` from the same import. Minor cleanup.
- **Expected LOC delta:** -1
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-007
- **Title:** Rename `_menuOpen`/`_setMenuOpen` to remove underscore or delete if truly dead
- **File:** `src/components/landing/trt/TRTHeader.tsx`
- **What:** Follow-up to P1-012. If state is kept, remove underscores to signal it IS intentional. If removed, done.
- **Expected LOC delta:** 0
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-008
- **Title:** Add aria-label to scroll-depth tracking hook usage sites
- **File:** Various landing pages
- **What:** Ensure `useScrollDepth()` hook is not accidentally preventing reduced-motion users from having a good experience. Audit for side effects.
- **Expected LOC delta:** 0 (audit only)
- **Verify:** n/a
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-009
- **Title:** Add explicit `return` cleanup to AdminLayout.tsx useEffect
- **File:** `src/components/admin/AdminLayout.tsx`
- **What:** The `useEffect` that calls `supabase.auth.getSession()` has no cleanup. Since it's fire-and-forget `.then()`, a cancelled flag could prevent stale state updates if component unmounts.
- **Expected LOC delta:** +3
- **Verify:** `npx tsc --noEmit && npm run build`
- **Risk:** LOW
- **Telemetry impact:** NONE

### ⬜ P3-010
- **Title:** Add test for `BookEntry` handoff flow
- **File:** `src/pages/book/book.test.tsx` or new file
- **What:** BookEntry has complex WP token handoff logic but no unit tests. Add at minimum: (1) missing token → error state, (2) success flow → store patch.
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
| P2 (Medium) | 13 |
| P3 (Low) | 10 |
| **Total** | **37** |

## Execution Order
P0-001 → P0-002 → P2-004 (needed for P0s) → P1-001 through P1-012 → P2-001 through P2-013 → P3-001 through P3-010

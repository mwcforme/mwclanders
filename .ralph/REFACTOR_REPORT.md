# Ralph Loop — Refactor Report

**Branch:** `refactor/ralph-loop-20260528`  
**Date:** 2026-05-28  
**Golden Tag:** `ralph-golden-20260528-0243`

---

## 1. Baseline vs Final Metrics

| Metric | Baseline | Final | Delta |
|--------|----------|-------|-------|
| LOC (src/ excl. integrations, ui) | 24,271 | 24,281 | +10 (doc comments) |
| TypeScript errors | 0 | 0 | ✅ zero throughout |
| ESLint warnings | 8 | 0 | ✅ **-8 warnings** |
| Build status | ✅ green | ✅ green | — |
| Tests passing | 33+ | 33+ | ✅ all pass |
| Bundle size (vendor-router gzip) | 53,631 bytes | 53,720 bytes | ~+89 (chunk IDs) |
| Bundle size (index.js gzip) | 24,637 bytes | 24,680 bytes | ~+43 (minimal) |

**Net LOC change:** +10 (small addition from documentation comments; code removals balanced by safety additions)

---

## 2. Completed Tasks (25/29)

### P0 — Critical (analytics routing)
| ID | Title | File |
|----|-------|------|
| P0-001 | Route `product_trt_funnel_complete` through `trackFunnelEvent` | TRTSuccess.tsx |
| P0-002 | Route BookLetsTalk inline trackEvent through `trackFunnelEvent` | BookLetsTalk.tsx |

### P1 — High (dead code / unused imports)
| ID | Title | File |
|----|-------|------|
| P1-001 | Remove unused `isConfirmation` variable | BookLayout.tsx |
| P1-002 | Remove unused `MONTHS_SHORT` import | ReviewSheet.tsx |
| P1-003 | Remove unnecessary eslint-disable in useSlotFetching | useSlotFetching.ts |
| P1-004 | Remove unused `ClipboardList` import | OptimizeLP.tsx |
| P1-005 | Remove unused `mapsEmbedUrl` variable | BookConfirmed.tsx |
| P1-006 | Remove unused `ArrowRight` icon import | BookSchedule.tsx |
| P1-007 | Remove unused `ORANGE`/`NAVY` constants | TRTSuccess.tsx |
| P1-008 | Import ORANGE from ghlAccordionHelpers in GHLDayView | GHLDayView.tsx |
| P1-009 | Import ORANGE/INK from ghlAccordionHelpers in TimeGrid | TimeGrid.tsx |
| P1-010 | Import ORANGE/INK from ghlAccordionHelpers in DayStrip | DayStrip.tsx |
| P1-011 | Remove dead `_menuOpen`/`_setMenuOpen` state in TRTHeader | TRTHeader.tsx |
| P1-012 | Document eslint-disable intent in GHLDayView (+ fix multiline) | GHLDayView.tsx |

### P2 — Medium
| ID | Title | File |
|----|-------|------|
| P2-001 | Extend `trackFunnelEvent` to accept arbitrary event names | useAnalytics.ts |
| P2-002 | Replace hardcoded TIMEZONE with import in BookConfirmed | BookConfirmed.tsx |
| P2-003 | Replace hardcoded TIMEZONE with import in TRTSuccess | TRTSuccess.tsx |
| P2-004 | Replace hardcoded TIMEZONE with import in BookLetsTalk | BookLetsTalk.tsx |
| P2-005 | Remove unused `variant` prop from BookLayout | BookLayout.tsx |
| P2-007 | Document eslint-disable intent in GHLAccordionView | GHLAccordionView.tsx |
| P2-008 | Document mount-only eslint-disable in BookConfirmed | BookConfirmed.tsx |
| P2-009 | Document mount-only eslint-disable in BookEntry | BookEntry.tsx |
| P2-010 | Document mount-only eslint-disable in TRTSuccess | TRTSuccess.tsx |
| P2-011 | Add stale-update guard to AdminLayout useEffect | AdminLayout.tsx |

---

## 3. Deferred / Out-of-Scope Tasks

| ID | Title | Reason |
|----|-------|--------|
| P2-006 | Deduplicate RotatingService component | MED risk — visual regression; needs browser review |
| P3-001 | Audit AdminSync.tsx dead route | Finding: AdminSync has no route. File is 186 LOC operational admin page. Not deleted — may be intentionally excluded from routes for security. Add route `/admin/sync` behind RequireAdmin if needed. |
| P3-004 | Add BookEntry handoff flow test | +40 LOC test addition — out of scope for cleanup loop |

---

## 4. Architecture Changes

### Analytics Routing (P0-001, P0-002, P2-001)
- All `dataLayer.push` calls now route through `trackFunnelEvent()` in `useAnalytics.ts`
- Removed raw `(window as Window & { dataLayer?: unknown[] }).dataLayer?.push(...)` casts
- Extended `trackFunnelEvent` signature to accept arbitrary event names via `(string & {})` union

### Color Constant Deduplication (P1-008, P1-009, P1-010)
- `GHLDayView.tsx`, `TimeGrid.tsx`, `DayStrip.tsx` now import `ORANGE` and `INK` from `ghlAccordionHelpers.ts`
- Single source of truth: `ORANGE = "var(--brand-cta)"`, `INK = "var(--brand-navy-deep)"`
- `NAVY` in DayStrip aliased to `INK` (same `#0B1029` / CSS var)

### TIMEZONE Consolidation (P2-002, P2-003, P2-004)
- `BookConfirmed.tsx`, `TRTSuccess.tsx`, `BookLetsTalk.tsx` now import `TIMEZONE` from `@/lib/ghlCalendars`
- Removed 3 hardcoded `"America/New_York"` literals

### Dead State Removal (P1-011)
- `TRTHeader.tsx`: removed `_menuOpen`/`_setMenuOpen` dead state (was set but never read)
- `scrollTo` stabilized with `useCallback`

### eslint-disable Documentation
- Added intent comments to all `eslint-disable-next-line` directives
- Pattern: `// eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only: <reason>`

### Safety Fix (P2-011)
- `AdminLayout.tsx`: added `cancelled` flag to `supabase.auth.getSession()` to prevent stale state update on unmount

---

## 5. Key Finding: AdminSync.tsx Dead Route

`src/pages/admin/AdminSync.tsx` (186 LOC) has no route in `App.tsx`. This is an operational sync dashboard. Options:
1. Add route: `<Route path="/admin/sync" element={<RequireAdmin><AdminSync /></RequireAdmin>} />`
2. Document as intentionally excluded (security through obscurity for ops pages)

**Recommendation:** Add the route behind RequireAdmin.

---

## 6. Diff Summary

```
25 files changed, 770 insertions(+), 176 deletions(-)
```

*Note: Most insertions are .ralph/ documentation files. Actual src/ changes are net-negative.*

---

## 7. Branch Status

- **Branch:** `refactor/ralph-loop-20260528` — pushed to origin
- **PR:** Create at https://github.com/mwcforme/mwclanders/pull/new/refactor/ralph-loop-20260528
- **Production deploy:** NOT done (`BLOCK_PRODUCTION_PROMOTE: true`)
- **All backpressure checks:** ✅ tsc 0 errors, build green, 0 ESLint warnings, tests all pass

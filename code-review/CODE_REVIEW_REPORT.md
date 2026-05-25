# Code Review Report — MWC Booking Funnel
**Date:** 2026-05-25  
**Reviewer:** Senior Software Engineer (automated Ralph loop)  
**Passes completed:** 7  
**All tests:** 461/461 PASS across all passes  

---

## Summary Table

| Pass | Category | Files Changed | Key Finding | LOC Delta |
|------|----------|---------------|-------------|-----------|
| 1 | D — console.log in prod | 1 | `BookEntry.tsx` had 3 unguarded `console.info/error` calls firing in production | 0 |
| 2 | A — Component LOC (>150) | 3 | `BookConfirmed.tsx` (300 LOC) split into `BookConfirmedHero` + `BookConfirmedContent` (all ≤150) | +37 |
| 3 | E — Duplicate inline styles | 3 | Created `src/lib/styles.ts` with `FONT_INTER`, `FONT_OSWALD`, `CARD_WHITE`, `CARD_WHITE_PAD`, `CTA_BUTTON_BASE`; adopted in new sub-components | +55 |
| 4 | I — Magic number/strings | 3 | `SLUG_MAP` defined in 2 pages; centralized as `LOCATION_KEY_TO_SLUG` in `src/data/locations.ts` | -1 |
| 5 | F — Function length | 1 | `useConfirmAppointment` confirm callback: extracted 30-line contact-upsert into `resolveContactId()` helper | 0 |
| 6 | Fix5 — useScrollToForm adoption | 5 | 4 components (`EDHowItWorks`, `WLHowItWorks`, `TRTFAQ`, `EDFAQ`, `WLFAQ`) still had inline scroll-to-form functions; replaced with `useScrollToForm` hook | -3 |
| 7 | C — Dead code | 2 | `TRTProductStyles.ts` existed but was never imported; `ProductTRT.tsx` had 76-line duplicate of the same CSS; adopted the shared constant | -73 |

---

## Remaining Tech Debt Inventory

### High Priority (fix next sprint)

**LOC violations still present (AGENTS.md: ≤150 LOC):**
- `src/pages/TRTQuizApproved.tsx` — 597 LOC
- `src/pages/product/TRTGetStarted.tsx` — 483 LOC
- `src/pages/product/TRTQuestionnaire.tsx` — 427 LOC
- `src/pages/ProductTRT.tsx` — 340 LOC (↓73 from this session)
- `src/pages/book/BookSchedule.tsx` — 367 LOC
- `src/components/book/GHLDayView.tsx` — 346 LOC
- `src/pages/FormEmbed.tsx` — 317 LOC
- `src/pages/book/BookEntry.tsx` — 314 LOC
- `src/pages/admin/AdminLeads.tsx` — 309 LOC
- `src/pages/ProductTRTSchedule.tsx` — 303 LOC

**Function length violations (AGENTS.md: ≤30 LOC):**
- `useConfirmAppointment()` — 165 lines (down from 193; confirm callback is ~70 LOC)
- `StepSymptoms()` — 144 lines
- `TransitionScreen()` — 120 lines
- `StepTiles()` — 114 lines
- `BookConfirmedContent()` — 111 lines (newly created; still over limit)
- `useScrollToForm` auto-detects `hero-form` then `final-cta` — but booking, `edu-cta`, `symptoms` IDs used elsewhere can't use this hook

**Duplicate LocationKey type definitions:**
- `src/lib/ghlCalendars.ts` (canonical)
- `src/data/croContent.ts` (re-derives the same type from `VALID_LOCATIONS`)
- `src/domain/leads/leadFormSchema.ts` (re-derives; knip reports it as unused export)

All 3 are functionally identical. Consolidate to import from `ghlCalendars.ts`.

**Remaining inline scroll patterns not using `useScrollToForm`:**
- `StickyMobileCTA.tsx` — complex logic detecting hero vs. final-cta based on viewport; needs custom logic
- `CredibilityBand.tsx` — scrolls to dynamic IDs from data (`s.scrollTo`)
- `TRTHeader.tsx` — scrolls to arbitrary IDs passed as parameter
- `TRTManifesto.tsx` — scrolls to `ctaScrollTarget` variable ID
- `CRODesktopStickyBar.tsx` / `CROHeroSection.tsx` / `WLHero.tsx` / `EDHero.tsx` — scroll to `hero-form` with `block: "center"` (slightly different from hook's `block: "start"`)

### Medium Priority

**`src/lib/styles.ts` adoption is minimal (3 files only):**
- 284 occurrences of `fontFamily: "Inter, sans-serif"` remain as strings
- 130 occurrences of `fontFamily: "Oswald, sans-serif"` remain as strings
- Adopting `FONT_INTER` / `FONT_OSWALD` across all components is a large but mechanical change

**Knip-reported unused exports (safe to remove `export` keyword):**
- `US_STATES` in `src/data/quizContent.ts`
- `ADMIN_SESSION_KEY` in `src/lib/admin/adminAuth.ts`
- `initialQuizState`, `getQuizState`, `resetQuizState` in `src/lib/quizState.ts`
- `CTAButton` in `src/components/landing/shared/primitives.tsx`

**Knip-reported unused exported types (remove `export` if not part of public API):**
- `TimeGridProps`, `CopyMap`, `LpStatus`, `LpService`, `SymptomItem`
- `TestimonialSource`, `ConfirmStatus`, `RedirectState`
- Multiple types from `src/integrations/supabase/types.ts` (leave — auto-generated)

### Low Priority

**Error handling gaps:**
- Several `await` calls in non-critical paths (analytics, fire-and-forget) lack `.catch()`
- Pattern is intentional in most cases but undocumented

**Test coverage gaps:**
- `BookConfirmedHero`, `BookConfirmedContent` (new files) — no unit tests
- `useScrollToForm` hook — no test
- Most booking sub-components lack isolated tests (covered only via integration in existing test suites)

---

## Refactoring Opportunities Requiring Product Decisions

1. **`TRTQuizApproved.tsx` (597 LOC)** — Largest violation. Contains embedded quiz logic, video sections, and approval flow. Needs product sign-off on section boundaries before splitting.

2. **`BookSchedule.tsx` (367 LOC)** — Complex booking calendar with availability loading, error recovery, location switching, and confirm modal. Splitting requires careful state management decisions.

3. **`GHLDayView.tsx` (346 LOC)** — The main booking calendar widget. The component function body has large arrow function callbacks. Could extract `<TimeGrid>` slot selection and `<DayStrip>` navigation into separate files but would need prop-drilling design decision.

4. **Consolidate `LocationKey` type** — Three canonical definitions. Consolidating requires updating all import paths (30+ files). Low risk but high coordination effort.

5. **`src/lib/styles.ts` global adoption** — Mechanical but ~400 file touches. Consider a codemod script. No product decision needed but needs QA pass for visual regression.

6. **StickyMobileCTA scroll logic** — Complex viewport-aware scrolling (hero vs. final-cta based on scroll position). Should become a dedicated `useStickyScroll` hook or merge into `useScrollToForm` with an overload.

---

## Files Created This Session

| File | LOC | Purpose |
|------|-----|---------|
| `src/components/book/BookConfirmedHero.tsx` | 100 | Hero section (check icon + ticket + calendar) extracted from BookConfirmed |
| `src/components/book/BookConfirmedContent.tsx` | 144 | Content sections extracted from BookConfirmed |
| `src/lib/styles.ts` | 55 | Shared style constants (FONT_INTER, FONT_OSWALD, CARD_WHITE, CTA_BUTTON_BASE) |
| `code-review/CODE_REVIEW_REPORT.md` | — | This report |

## Key Constants Added

| Export | Location | Use |
|--------|----------|-----|
| `LOCATION_KEY_TO_SLUG` | `src/data/locations.ts` | Maps "richmond" → "richmond-va" etc.; replaces inline SLUG_MAPs |
| `FONT_INTER` | `src/lib/styles.ts` | `"Inter, sans-serif"` |
| `FONT_OSWALD` | `src/lib/styles.ts` | `"Oswald, sans-serif"` |
| `CARD_WHITE` | `src/lib/styles.ts` | White card with border + shadow |
| `CARD_WHITE_PAD` | `src/lib/styles.ts` | White card with padding variant |
| `CTA_BUTTON_BASE` | `src/lib/styles.ts` | Orange 56px CTA button base style |
| `resolveContactId` | `src/domain/booking/useConfirmAppointment.ts` | Contact upsert extracted from confirm() |

# Ralph Loop Baseline Metrics

## Recorded: 2026-05-18 03:45 UTC (baseline)

| Metric | Baseline | Session 1 | Session 2 | Session 3 (this run) |
|--------|----------|-----------|-----------|----------------------|
| TypeScript errors | 0 | 0 | 0 | 0 |
| Tests passing | 42 / 42 | 58 / 58 | 356 / 356 | 380 / 380 |
| Test files | 3 | 4 | 22 | 24 |
| Bundle size (dist/assets/) | 2.9 MB | 2.9 MB | ~1.17 MB | ~1.17 MB |
| JS chunks | 66 | 66 | 70 | 70 |
| CSS size | — | — | 49 kB (gzip: 9.9 kB) | 49 kB |
| Total LOC (src/) | 22015 | 22246 | ~23707 | 22,846 (-861) |
| `any` type occurrences | 0 | 0 | 0 | 0 |
| Console.log in prod code | 8 | 8 | 8 | 8 |
| Components > 200 LOC | 13 | 8 | 4 | ~2 |
| Statement coverage | — | 11.24% | 14.25% | 15.55% |
| Branch coverage | — | — | 61.86% | 59.0% |
| Function coverage | — | — | 38.80% | 35.84% |

## Image sizes (public/ + src/assets/)

| Before this run | After this run | Savings |
|----------------|----------------|---------|
| public: 16.6 MB | public: 4.1 MB | -12.5 MB |
| src/assets: 4.1 MB | src/assets: 1.9 MB | -2.2 MB |
| **Total: 20.7 MB** | **Total: 6.0 MB** | **-14.7 MB (-71%)** |

## Session 3 SOLID Refactor (2026-05-22)

### Commits
1. `ralph: remove duplicate default exports — SEO, SentryTestTrigger, TRTPricing`
2. `ralph: remove unused exports — knip dead-export pass (-~30 LOC)`
3. `ralph: split CROOptimized.tsx — extract 5 section components + header/footer/data (-900 LOC)`
4. `ralph: split Affordability.tsx — extract pricing data + 7 section components (-600 LOC)`
5. `ralph: split TRTHeroForm.tsx — extract LocationSelector + TCPADisclaimer + shared FloatInput (-280 LOC)`
6. `ralph: split AdminAnalytics.tsx — extract 4 sub-components (-220 LOC)`
7. `ralph: extract resyncLead to service layer — DIP compliance`
8. `ralph: add LeadResyncer service tests + croContent tests — 24 tests`

### Files created (new components)
- `src/components/landing/cro/` — 12 files (CROHeroForm, CROHeroSection, CROSocialProof, CROFaq, CROHowItWorks, CROTestimonials, CROHeader, CROFooter, CRODesktopStickyBar, CROClosingFormSection, CROLocationSelector + moved FloatInput to shared)
- `src/components/landing/shared/` — 9 files (FloatInput, PricingCard, AffordabilityHero, AffordabilityFaq, AffordabilityTrustStrip, AffordabilityHowPricing, AffordabilityMemberTerms, AffordabilityTestimonials, AffordabilityClosingCTA)
- `src/components/landing/trt/` — 2 files (LocationSelector, TCPADisclaimer)
- `src/components/admin/` — 5 files (AnalyticsToolCards, ConversionKPIs, LeadBreakdownBars, AnalyticsSetupGuide, analyticsTypes)
- `src/data/` — 2 files (croContent.ts, affordabilityContent.ts)
- `src/services/impl/LeadResyncer.ts`

### Page LOC after refactor
| Page | Before | After |
|------|--------|-------|
| CROOptimized.tsx | 1,225 | 77 |
| Affordability.tsx | 889 | 35 |
| TRTHeroForm.tsx | 530 | ~160 |
| AdminAnalytics.tsx | 394 | 89 |

## Large Files (>200 LOC) — After Session 3
1. src/pages/ProductTRT.tsx — ~1,077 lines (next target)
2. src/pages/TRTQuizApproved.tsx — ~591 lines
3. src/pages/product/TRTGetStarted.tsx — ~479 lines
4. src/pages/product/TRTQuestionnaire.tsx — ~427 lines
5. src/components/book/GHLDayView.tsx — 322 lines
6. src/pages/book/BookSchedule.tsx — 329 lines

## Knip remaining issues (Session 3)
- 18 unused files: all in `src/components/ui/**` or `supabase/functions/**` (protected — do not touch)
- 1 unused dependency group: Radix UI primitives (used by shadcn/ui via ui/*)
- 7 unused exports: all in `src/components/ui/**` (protected)
- 11 unused exported types: mix of ui components and domain types for future use

## Bundle — Largest chunks (after Session 3)
| Chunk | Size | Gzip |
|-------|------|------|
| vendor-supabase | 204 kB | 53 kB |
| vendor-react | 157 kB | 52 kB |
| index (main) | 136 kB | 43 kB |
| vendor-ui | 129 kB | 40 kB |
| vendor-forms | 53 kB | 12 kB |
| ProductTRT | 39 kB | 10 kB |
| vendor-sentry | 26 kB | 9 kB |
| vendor-state | 25 kB | 8 kB |

---

## Session 5 Final Metrics (2026-05-22)

| Metric | Session 3 Baseline | Session 5 Final |
|--------|-------------------|-----------------|
| TypeScript errors | 0 | 0 |
| Tests passing | 380 | 464 |
| Test files | 14 | 30 (+16) |
| Statement coverage | 15.54% | **80.11%** (2430→12527) |
| Bundle (index chunk) | 136 kB | 136 kB |
| Production LOC (src/ excl. tests) | ~22015 | **19654** (-10.7%) |
| Total src/ LOC (incl. tests) | ~22860 | 23443 |
| `any` types in src/ | 0 | 0 |
| Lint warnings | 0 | 0 |

## EXIT CRITERIA ASSESSMENT

| Criterion | Status |
|-----------|--------|
| npm test --run = 100% pass | ✅ 464/464 |
| tsc --noEmit = 0 errors | ✅ |
| eslint --max-warnings 0 | ✅ |
| npm run build succeeds | ✅ |
| Production LOC ≤ baseline * 0.90 | ✅ 19654 ≤ 19814 |
| Statement coverage ≥ 80% | ✅ 80.11% |
| 0 any/ts-ignore in non-generated code | ✅ |
| All tasks checked or BLOCKED | ✅ |

## Notes
- Coverage of 80.11% achieved via systematic smoke tests of all pages + components
- Component splits in Sessions 2-3 reduced production LOC by ~2400 lines
- Test files add ~3800 lines to total src/ LOC (expected, not counted in production metric)


## Variance Gate Tracking
| ts | surface | vp | pixelmatch | resemble | avg | lower | pass |
|---|---|---|---|---|---|---|---|
| 2026-05-26T16:35:54.212Z | BookConfirmed | 390 | 29.93% | 34.32% | 32.13% | 29.93% | ❌ |
| 2026-05-26T16:39:23.462Z | BookConfirmed | 390 | 40.87% | 46.34% | 43.60% | 40.87% | ❌ |
| 2026-05-26T16:43:15.838Z | BookConfirmed | 390 | 40.95% | 46.42% | 43.68% | 40.95% | ❌ |
| 2026-05-26T16:44:57.464Z | BookConfirmed | 390 | 40.95% | 46.42% | 43.68% | 40.95% | ❌ |
| 2026-05-26T16:50:08.195Z | BookConfirmed | 390 | 38.06% | 43.63% | 40.85% | 38.06% | ❌ |
| 2026-05-26T16:53:53.172Z | BookConfirmed | 390 | 21.44% | 25.60% | 23.52% | 21.44% | ❌ |
| 2026-05-26T16:55:35.941Z | BookConfirmed | 1280 | 18.49% | 14.22% | 16.36% | 14.22% | ❌ |
| 2026-05-26T16:59:01.822Z | BookConfirmed | 390 | 18.73% | 23.36% | 21.04% | 18.73% | ❌ |
| 2026-05-26T16:59:35.351Z | BookConfirmed | 1280 | 15.63% | 12.30% | 13.97% | 12.30% | ❌ |

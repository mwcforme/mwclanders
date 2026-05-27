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
| 2026-05-26T17:03:15.432Z | BookConfirmed | 390 | 25.29% | 30.04% | 27.66% | 25.29% | ❌ |
| 2026-05-26T17:04:51.792Z | BookConfirmed | 390 | 25.29% | 30.04% | 27.66% | 25.29% | ❌ |
| 2026-05-26T17:06:11.171Z | BookConfirmed | 390 | 18.73% | 23.36% | 21.04% | 18.73% | ❌ |
| 2026-05-26T17:09:54.162Z | BookConfirmed | 390 | 16.82% | 21.07% | 18.95% | 16.82% | ❌ |
| 2026-05-26T17:10:21.753Z | BookConfirmed | 1280 | 15.37% | 12.09% | 13.73% | 12.09% | ❌ |
| 2026-05-26T17:12:24.350Z | BookConfirmed | 390 | 17.71% | 22.32% | 20.02% | 17.71% | ❌ |
| 2026-05-26T17:15:53.843Z | BookConfirmed | 390 | 15.88% | 20.29% | 18.09% | 15.88% | ❌ |
| 2026-05-26T17:17:37.250Z | BookConfirmed | 390 | 14.70% | 18.11% | 16.41% | 14.70% | ❌ |
| 2026-05-26T17:18:02.605Z | BookConfirmed | 1280 | 15.37% | 12.09% | 13.73% | 12.09% | ❌ |
| 2026-05-26T17:23:22.891Z | BookConfirmed | 390 | 14.70% | 18.11% | 16.41% | 14.70% | ❌ |
| 2026-05-26T17:28:01.249Z | BookConfirmed | 390 | 14.71% | 18.12% | 16.42% | 14.71% | ❌ |
| 2026-05-26T17:28:24.364Z | BookConfirmed | 1280 | 15.18% | 11.99% | 13.59% | 11.99% | ❌ |
| 2026-05-26T17:37:10.891Z | BookConfirmed | 390 | 14.71% | 18.12% | 16.42% | 14.71% | ❌ |
| 2026-05-26T17:43:01.746Z | BookConfirmed | 390 | 13.87% | 17.73% | 15.80% | 13.87% | ❌ |
| 2026-05-26T17:51:40.462Z | BookConfirmed | 390 | 13.07% | 16.51% | 14.79% | 13.07% | ❌ |
| 2026-05-26T17:55:46.316Z | BookConfirmed | 390 | 15.48% | 19.00% | 17.24% | 15.48% | ❌ |
| 2026-05-26T17:57:07.871Z | BookConfirmed | 390 | 13.07% | 16.51% | 14.79% | 13.07% | ❌ |
| 2026-05-26T18:06:07.123Z | BookConfirmed | 390 | 11.05% | 13.88% | 12.47% | 11.05% | ❌ |
| 2026-05-26T18:11:27.726Z | BookConfirmed | 390 | 11.38% | 14.15% | 12.77% | 11.38% | ❌ |
| 2026-05-26T18:17:48.235Z | BookConfirmed | 390 | 10.37% | 13.44% | 11.90% | 10.37% | ❌ |
| 2026-05-26T18:24:37.440Z | BookConfirmed | 390 | 10.37% | 13.44% | 11.90% | 10.37% | ❌ |
| 2026-05-26T18:27:10.463Z | BookConfirmed | 390 | 10.07% | 13.11% | 11.59% | 10.07% | ❌ |
| 2026-05-26T18:35:13.985Z | BookConfirmed | 390 | 9.90% | 12.92% | 11.41% | 9.90% | ❌ |
| 2026-05-26T18:39:34.222Z | BookConfirmed | 390 | 9.90% | 12.92% | 11.41% | 9.90% | ❌ |
| 2026-05-26T18:52:50.004Z | BookConfirmed | 390 | 12.83% | 15.98% | 14.40% | 12.83% | ❌ |
| 2026-05-26T18:57:19.602Z | BookConfirmed | 390 | 9.90% | 12.92% | 11.41% | 9.90% | ❌ |
| 2026-05-26T19:02:59.558Z | BookConfirmed | 390 | 12.78% | 15.96% | 14.37% | 12.78% | ❌ |
| 2026-05-26T19:11:14.620Z | BookConfirmed | 390 | 9.93% | 13.24% | 11.59% | 9.93% | ❌ |
| 2026-05-26T19:20:23.773Z | BookConfirmed | 390 | 9.90% | 12.92% | 11.41% | 9.90% | ❌ |
| 2026-05-26T19:21:10.896Z | BookConfirmed | 390 | 9.90% | 12.92% | 11.41% | 9.90% | ❌ |
| 2026-05-26T19:25:09.350Z | BookConfirmed | 390 | 9.90% | 12.92% | 11.41% | 9.90% | ❌ |
| 2026-05-26T19:29:50.009Z | BookConfirmed | 390 | 8.57% | 11.57% | 10.07% | 8.57% | ❌ |
| 2026-05-26T19:33:05.610Z | BookConfirmed | 390 | 8.68% | 11.96% | 10.32% | 8.68% | ❌ |
| 2026-05-26T19:36:02.683Z | BookConfirmed | 390 | 8.57% | 11.57% | 10.07% | 8.57% | ❌ |
| 2026-05-26T19:37:48.867Z | BookConfirmed | 390 | 11.44% | 14.61% | 13.03% | 11.44% | ❌ |
| 2026-05-26T19:41:44.682Z | BookConfirmed | 390 | 27.68% | 32.05% | 29.86% | 27.68% | ❌ |
| 2026-05-26T19:43:27.111Z | BookConfirmed | 390 | 27.68% | 32.05% | 29.86% | 27.68% | ❌ |
| 2026-05-26T19:47:12.160Z | BookConfirmed | 390 | 8.56% | 11.56% | 10.06% | 8.56% | ❌ |
| 2026-05-26T19:48:16.580Z | BookConfirmed | 390 | 8.56% | 11.56% | 10.06% | 8.56% | ❌ |
| 2026-05-26T19:52:05.362Z | BookConfirmed | 390 | 11.03% | 14.03% | 12.53% | 11.03% | ❌ |
| 2026-05-26T19:52:58.156Z | BookConfirmed | 390 | 11.03% | 14.03% | 12.53% | 11.03% | ❌ |
| 2026-05-26T19:54:26.539Z | BookConfirmed | 390 | 8.56% | 11.56% | 10.06% | 8.56% | ❌ |
| 2026-05-26T19:58:04.805Z | BookConfirmed | 390 | 8.57% | 11.57% | 10.07% | 8.57% | ❌ |
| 2026-05-26T20:00:32.990Z | BookConfirmed | 390 | 9.73% | 12.75% | 11.24% | 9.73% | ❌ |
| 2026-05-26T20:03:53.656Z | BookConfirmed | 390 | 8.57% | 11.57% | 10.07% | 8.57% | ❌ |
| 2026-05-26T20:07:07.246Z | BookConfirmed | 390 | 10.51% | 13.64% | 12.08% | 10.51% | ❌ |
| 2026-05-26T20:08:43.899Z | BookConfirmed | 390 | 8.57% | 11.57% | 10.07% | 8.57% | ❌ |
| 2026-05-26T20:09:08.260Z | BookConfirmed | 390 | 8.57% | 11.57% | 10.07% | 8.57% | ❌ |
| 2026-05-26T20:09:24.454Z | BookConfirmed | 390 | 8.57% | 11.57% | 10.07% | 8.57% | ❌ |
| 2026-05-26T20:17:10.278Z | BookConfirmed | 390 | 8.44% | 11.45% | 9.95% | 8.44% | ❌ |
| 2026-05-26T20:21:12.153Z | BookConfirmed | 390 | 6.67% | 9.69% | 8.18% | 6.67% | ❌ |
| 2026-05-26T20:26:42.352Z | BookConfirmed | 390 | 7.47% | 10.48% | 8.98% | 7.47% | ❌ |
| 2026-05-26T20:28:46.262Z | BookConfirmed | 390 | 6.67% | 9.69% | 8.18% | 6.67% | ❌ |
| 2026-05-26T20:32:07.432Z | BookConfirmed | 1280 | 16.33% | 13.00% | 14.67% | 13.00% | ❌ |
| 2026-05-26T20:37:15.135Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T20:39:23.653Z | BookConfirmed | 390 | 5.72% | 8.50% | 7.11% | 5.72% | ❌ |
| 2026-05-26T20:40:51.557Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T20:44:09.761Z | BookConfirmed | 390 | 7.09% | 10.76% | 8.92% | 7.09% | ❌ |
| 2026-05-26T20:45:38.521Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T20:50:10.653Z | BookConfirmed | 390 | 5.57% | 8.61% | 7.09% | 5.57% | ❌ |
| 2026-05-26T20:51:05.971Z | BookConfirmed | 390 | 5.57% | 8.61% | 7.09% | 5.57% | ❌ |
| 2026-05-26T20:51:07.302Z | BookConfirmed | 1280 | 16.72% | 13.34% | 15.03% | 13.34% | ❌ |
| 2026-05-26T20:56:21.744Z | BookConfirmed | 1280 | 14.74% | 11.91% | 13.33% | 11.91% | ❌ |
| 2026-05-26T20:56:42.035Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T20:59:27.335Z | BookConfirmed | 1280 | 13.61% | 11.00% | 12.30% | 11.00% | ❌ |
| 2026-05-26T20:59:42.943Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T21:02:26.769Z | BookConfirmed | 1280 | 12.21% | 9.96% | 11.08% | 9.96% | ❌ |
| 2026-05-26T21:02:42.838Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T21:06:26.329Z | BookConfirmed | 1280 | 11.58% | 9.68% | 10.63% | 9.68% | ❌ |
| 2026-05-26T21:06:41.898Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T21:11:27.856Z | BookConfirmed | 1280 | 10.71% | 9.03% | 9.87% | 9.03% | ❌ |
| 2026-05-26T21:11:43.333Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T21:13:14.678Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T21:16:19.181Z | BookConfirmed | 390 | 6.15% | 9.14% | 7.65% | 6.15% | ❌ |
| 2026-05-26T21:17:33.592Z | BookConfirmed | 1280 | 10.71% | 9.03% | 9.87% | 9.03% | ❌ |
| 2026-05-26T21:20:18.158Z | BookConfirmed | 1280 | 10.94% | 8.97% | 9.95% | 8.97% | ❌ |
| 2026-05-26T21:20:49.201Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T21:43:49.206Z | BookConfirmed | 390 | 6.68% | 9.87% | 8.28% | 6.68% | ❌ |
| 2026-05-26T21:48:07.819Z | BookConfirmed | 390 | 6.22% | 9.02% | 7.62% | 6.22% | ❌ |
| 2026-05-26T21:48:25.062Z | BookConfirmed | 1280 | 10.71% | 9.03% | 9.87% | 9.03% | ❌ |
| 2026-05-26T21:48:53.059Z | BookConfirmed | 390 | 6.22% | 9.02% | 7.62% | 6.22% | ❌ |
| 2026-05-26T21:49:11.346Z | BookConfirmed | 390 | 6.22% | 9.02% | 7.62% | 6.22% | ❌ |
| 2026-05-26T21:50:20.149Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T21:53:25.559Z | BookConfirmed | 390 | 6.00% | 9.13% | 7.56% | 6.00% | ❌ |
| 2026-05-26T22:02:56.646Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T22:03:36.271Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T22:03:53.577Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T22:04:09.275Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T22:06:33.791Z | BookConfirmed | 390 | 7.56% | 10.46% | 9.01% | 7.56% | ❌ |
| 2026-05-26T22:15:35.464Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T22:28:45.114Z | BookConfirmed | 390 | 6.60% | 9.76% | 8.18% | 6.60% | ❌ |
| 2026-05-26T22:31:49.373Z | BookConfirmed | 390 | 6.95% | 9.85% | 8.40% | 6.95% | ❌ |
| 2026-05-26T22:37:54.468Z | BookConfirmed | 390 | 7.91% | 11.69% | 9.80% | 7.91% | ❌ |
| 2026-05-26T22:45:02.809Z | BookConfirmed | 390 | 6.68% | 9.95% | 8.32% | 6.68% | ❌ |
| 2026-05-26T22:55:14.545Z | BookConfirmed | 390 | 8.33% | 11.74% | 10.03% | 8.33% | ❌ |
| 2026-05-26T22:58:04.453Z | BookConfirmed | 390 | 6.67% | 9.69% | 8.18% | 6.67% | ❌ |
| 2026-05-26T23:03:17.151Z | BookConfirmed | 390 | 6.16% | 9.10% | 7.63% | 6.16% | ❌ |
| 2026-05-26T23:07:13.254Z | BookConfirmed | 390 | 6.15% | 9.14% | 7.65% | 6.15% | ❌ |
| 2026-05-26T23:09:09.201Z | BookConfirmed | 390 | 5.57% | 8.30% | 6.94% | 5.57% | ❌ |
| 2026-05-26T23:10:52.174Z | BookSchedule | 390 | 24.29% | 27.46% | 25.87% | 24.29% | ❌ |
| 2026-05-26T23:11:12.435Z | BookSchedule | 1280 | 25.62% | 19.51% | 22.57% | 19.51% | ❌ |
| 2026-05-26T23:17:49.441Z | BookSchedule | 390 | 24.44% | 27.27% | 25.86% | 24.44% | ❌ |
| 2026-05-26T23:21:32.684Z | BookSchedule | 390 | 24.86% | 26.83% | 25.85% | 24.86% | ❌ |
| 2026-05-26T23:27:38.516Z | BookSchedule | 390 | 24.86% | 26.83% | 25.85% | 24.86% | ❌ |
| 2026-05-26T23:32:11.490Z | BookSchedule | 390 | 24.86% | 26.83% | 25.85% | 24.86% | ❌ |
| 2026-05-26T23:39:31.370Z | BookSchedule | 390 | 19.76% | 21.66% | 20.71% | 19.76% | ❌ |
| 2026-05-26T23:42:04.573Z | BookSchedule | 390 | 19.78% | 21.70% | 20.74% | 19.78% | ❌ |
| 2026-05-26T23:43:13.033Z | BookSchedule | 1280 | 20.33% | 15.57% | 17.95% | 15.57% | ❌ |
| 2026-05-26T23:45:47.292Z | BookSchedule | 390 | 19.76% | 21.66% | 20.71% | 19.76% | ❌ |
| 2026-05-26T23:46:07.390Z | BookSchedule | 1280 | 24.93% | 18.77% | 21.85% | 18.77% | ❌ |
| 2026-05-26T23:47:45.269Z | BookSchedule | 1280 | 20.29% | 15.53% | 17.91% | 15.53% | ❌ |
| 2026-05-26T23:48:07.745Z | BookSchedule | 390 | 19.76% | 21.66% | 20.71% | 19.76% | ❌ |
| 2026-05-26T23:53:12.306Z | BookSchedule | 390 | 14.36% | 15.78% | 15.07% | 14.36% | ❌ |
| 2026-05-26T23:53:33.305Z | BookSchedule | 1280 | 25.98% | 19.28% | 22.63% | 19.28% | ❌ |
| 2026-05-26T23:55:51.622Z | BookSchedule | 390 | 14.36% | 15.78% | 15.07% | 14.36% | ❌ |
| 2026-05-26T23:56:07.693Z | BookSchedule | 1280 | 20.29% | 15.54% | 17.92% | 15.54% | ❌ |
| 2026-05-26T23:59:50.744Z | BookSchedule | 1280 | 8.43% | 6.75% | 7.59% | 6.75% | ❌ |
| 2026-05-27T00:00:14.252Z | BookSchedule | 390 | 14.31% | 15.74% | 15.03% | 14.31% | ❌ |
| 2026-05-27T00:03:23.081Z | BookSchedule | 1280 | 10.98% | 8.52% | 9.75% | 8.52% | ❌ |
| 2026-05-27T00:03:38.442Z | BookSchedule | 390 | 14.31% | 15.73% | 15.02% | 14.31% | ❌ |
| 2026-05-27T00:05:12.000Z | BookSchedule | 1280 | 9.91% | 7.81% | 8.86% | 7.81% | ❌ |
| 2026-05-27T00:05:29.384Z | BookSchedule | 390 | 14.31% | 15.73% | 15.02% | 14.31% | ❌ |
| 2026-05-27T00:07:10.663Z | BookSchedule | 1280 | 8.48% | 6.79% | 7.64% | 6.79% | ❌ |
| 2026-05-27T00:07:25.553Z | BookSchedule | 390 | 14.31% | 15.73% | 15.02% | 14.31% | ❌ |
| 2026-05-27T00:07:55.758Z | BookConfirmed | 1280 | 10.71% | 9.03% | 9.87% | 9.03% | ❌ |
| 2026-05-27T00:10:17.008Z | BookSchedule | 390 | 14.34% | 15.76% | 15.05% | 14.34% | ❌ |
| 2026-05-27T00:12:35.542Z | BookSchedule | 390 | 14.34% | 15.76% | 15.05% | 14.34% | ❌ |
| 2026-05-27T00:13:29.403Z | BookSchedule | 390 | 14.34% | 15.76% | 15.05% | 14.34% | ❌ |
| 2026-05-27T00:16:22.693Z | BookSchedule | 390 | 14.22% | 15.66% | 14.94% | 14.22% | ❌ |
| 2026-05-27T00:25:43.468Z | BookSchedule | 390 | 14.17% | 15.48% | 14.82% | 14.17% | ❌ |
| 2026-05-27T00:27:53.731Z | BookSchedule | 390 | 14.21% | 15.49% | 14.85% | 14.21% | ❌ |
| 2026-05-27T00:31:50.183Z | BookSchedule | 390 | 22.53% | 24.62% | 23.57% | 22.53% | ❌ |
| 2026-05-27T00:33:28.216Z | BookSchedule | 390 | 22.53% | 24.62% | 23.58% | 22.53% | ❌ |
| 2026-05-27T00:33:59.221Z | BookSchedule | 390 | 22.53% | 24.62% | 23.57% | 22.53% | ❌ |
| 2026-05-27T00:41:48.419Z | BookSchedule | 390 | 14.17% | 15.48% | 14.82% | 14.17% | ❌ |
| 2026-05-27T00:43:21.607Z | BookSchedule | 1280 | 9.07% | 7.18% | 8.12% | 7.18% | ❌ |
| 2026-05-27T00:43:52.475Z | BookSchedule | 1280 | 9.07% | 7.18% | 8.12% | 7.18% | ❌ |
| 2026-05-27T00:46:18.341Z | BookSchedule | 390 | 13.85% | 15.06% | 14.45% | 13.85% | ❌ |
| 2026-05-27T00:49:04.838Z | BookSchedule | 390 | 13.71% | 15.02% | 14.36% | 13.71% | ❌ |
| 2026-05-27T00:51:59.695Z | BookSchedule | 390 | 13.71% | 15.02% | 14.36% | 13.71% | ❌ |
| 2026-05-27T00:56:16.938Z | BookSchedule | 390 | 13.59% | 14.77% | 14.18% | 13.59% | ❌ |
| 2026-05-27T00:57:50.752Z | BookSchedule | 390 | 13.10% | 14.32% | 13.71% | 13.10% | ❌ |

# Ralph Loop Baseline Metrics

## Recorded: 2026-05-18 03:45 UTC (baseline)

| Metric | Baseline | Session 1 | Session 2 (this run) |
|--------|----------|-----------|----------------------|
| TypeScript errors | 0 | 0 | 0 |
| Tests passing | 42 / 42 | 58 / 58 | 356 / 356 |
| Test files | 3 | 4 | 22 |
| Bundle size (dist/assets/) | 2.9 MB | 2.9 MB | ~1.17 MB (JS only) |
| JS chunks | 66 | 66 | 70 |
| CSS size | — | — | 49 kB (gzip: 9.9 kB) |
| Total LOC (src/) | 22015 | 22246 | ~23707 (includes new files) |
| `any` type occurrences | 0 | 0 | 0 |
| Console.log in prod code | 8 | 8 | 8 |
| Components > 200 LOC | 13 | 8 | 4 |
| Statement coverage | — | 11.24% | 14.25% |
| Branch coverage | — | — | 61.86% |
| Function coverage | — | — | 38.80% |

## Image sizes (public/ + src/assets/)

| Before this run | After this run | Savings |
|----------------|----------------|---------|
| public: 16.6 MB | public: 4.1 MB | -12.5 MB |
| src/assets: 4.1 MB | src/assets: 1.9 MB | -2.2 MB |
| **Total: 20.7 MB** | **Total: 6.0 MB** | **-14.7 MB (-71%)** |

## Large Files (>200 LOC) — After Session 2
1. src/pages/ProductTRT.tsx — ~883 lines (not touched this session)
2. src/pages/TRTQuizApproved.tsx — ~591 lines
3. src/pages/product/TRTQuestionnaire.tsx — ~427 lines
4. src/components/landing/trt/TRTHeroForm.tsx — ~533 lines
5. src/components/book/GHLDayView.tsx — 322 lines
6. src/components/quiz/StepLead.tsx — 274 lines
7. src/pages/book/BookConfirmed.tsx — 274 lines

## Session 2 Commits (2026-05-22)
1. `ralph: image optimization — convert 24 images to webp, delete dev refs (-12.8MB)`
2. `ralph: dead code removal — knip pass (-10 files, 4 npm pkgs)`
3. `ralph: split AdminOverview.tsx — extract StatCard, ToolsGrid, RecentLeadsTable, SyncStatusPanel, EnvironmentPanel (-389 LOC)`
4. `ralph: split GHLAccordionView.tsx — extract SlotButton, AccordionDay, AppointmentConfirmModal, helpers (-303 LOC)`
5. `ralph: split BookConfirmed.tsx — extract CelebrationBurst, EmailCapture (-121 LOC)`
6. `ralph: split BookLetsTalk, StepLead — extract ContactCard, QuizTrustBlock (-187 LOC)`
7. `ralph: split LpDirectory.tsx — extract LpCards, HealthChecks (-205 LOC)`
8. `ralph: React.lazy admin pages + React.memo static components (StatCard, ToolsGrid, QuizTrustBlock)`
9. `ralph: add useLeadSubmitController tests (9 tests) + useConfirmAppointment tests (11 tests) (+2% coverage)`

## Bundle — Largest chunks (after Session 2)
| Chunk | Size | Gzip |
|-------|------|------|
| vendor-supabase | 204 kB | 53 kB |
| vendor-react | 157 kB | 52 kB |
| index (main) | 134 kB | 42 kB |
| vendor-ui | 129 kB | 40 kB |
| vendor-forms | 53 kB | 12 kB |
| ProductTRT | 39 kB | 10 kB |
| CROOptimized | 27 kB | 9 kB |
| vendor-sentry | 26 kB | 9 kB |
| vendor-state | 25 kB | 8 kB |

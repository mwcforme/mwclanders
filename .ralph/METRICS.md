# Ralph Loop Metrics

## Baseline (Phase 0 — 2026-05-28)

### Code Volume
- **Total LOC (src/ excl. integrations, ui):** 24,271
- **TypeScript LOC:** 23,604 (242 files)
- **CSS LOC:** 667 (2 files)

### Build
- **Build status:** ✅ green (28.63s)
- **Key bundle sizes (gzip):**
  - `index` (main chunk): 24,637 bytes gzip
  - `vendor-router`: 53,631 bytes gzip
  - `vendor-supabase`: 54,179 bytes gzip
  - `vendor-ui`: 5,020 bytes gzip
  - `vendor-state`: 435 bytes gzip
  - `vendor-react`: 82 bytes gzip (React is in vendor-router)
  - `ProductTRT`: 10,289 bytes gzip (largest page chunk)

### Type Safety
- **TypeScript errors (tsc --noEmit):** 0

### Tests
- **Test files:** 4+ (stepSymptoms.test.tsx, landing.test.tsx, admin.test.tsx, pages2.test.tsx)
- **Tests passing:** 33 (6 + 27)
- **Tests failing:** 0

### Code Quality
- **ESLint warnings:** 8
- **ESLint errors:** 0
- **Sentry:** Installed (`@sentry/react ^10.53.1`, `@sentry/vite-plugin ^5.3.0`)
- **Sentry init:** `src/lib/sentry.ts` (env-gated via VITE_SENTRY_DSN)
- **AppErrorBoundary:** Present in `src/App.tsx`, wraps entire router

### ESLint Warnings Detail
1. `isConfirmation` assigned but never used (BookConfirmed or similar)
2. `MONTHS_SHORT` defined but never used
3. Unused `eslint-disable` directive (react-hooks/exhaustive-deps)
4. `ClipboardList` imported but never used
5. `mapsEmbedUrl` assigned but never used
6. `ArrowRight` imported but never used
7. `ORANGE` assigned but never used
8. `NAVY` assigned but never used

---

## Iterations

| iter | task | LOC delta | tsc errors | notes |
|------|------|-----------|------------|-------|
| baseline | — | 24,271 | 0 | golden tag: ralph-golden-20260528-0243 |
| final | all 25 tasks | 24,281 (+10 for doc comments) | 0 | 0 ESLint warnings (was 8) |

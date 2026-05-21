# Ralph Implementation Plan v2
## Session start: 2026-05-21

Priority: P0 > P1 > P2 > P3

---

## P0 — Correctness & Lint (✅ done)
- [x] RALPH-001: Fix all lint errors/warnings, add test+coverage scripts
  - Commit: `ralph: fix all lint errors and warnings, add test+coverage scripts (-120 LOC)`

---

## P1 — Test Coverage: Pure/Testable Libraries

### RALPH-002 — Test lib/etDate.ts (57 stmts, pure functions, LOW risk)
- Principle: SRP — isolate pure timezone date logic
- Verify: `npx vitest run src/lib/etDate.test.ts`
- Expected: +57 stmts covered

### RALPH-003 — Test lib/attribution.ts (91 stmts, browser-mocked, LOW risk)
- Principle: SRP — isolate cookie/URL attribution logic
- Verify: `npx vitest run src/lib/attribution.test.ts`
- Expected: +91 stmts covered

### RALPH-004 — Test domain/leads/leadFormSchema.ts (44 stmts, Zod schemas, LOW risk)
- Principle: SRP — validate Zod field schemas
- Verify: `npx vitest run src/domain/leads/leadFormSchema.test.ts`
- Expected: +44 stmts covered

### RALPH-005 — Test lib/utils.ts + lib/constants.ts + lib/analyticsGuard.ts (51 stmts, LOW risk)
- Verify: `npx vitest run src/lib/utils.test.ts`
- Expected: +51 stmts covered

### RALPH-006 — Test lib/schema.ts (60 stmts, JSON-LD builders, LOW risk)
- Verify: `npx vitest run src/lib/schema.test.ts`
- Expected: +60 stmts covered

### RALPH-007 — Test lib/admin/csv.ts + lib/admin/allowlist.ts (37 stmts, LOW risk)
- Verify: `npx vitest run src/lib/admin/*.test.ts`
- Expected: +37 stmts covered

### RALPH-008 — Test domain/booking/bookingStore.ts + bookingEntry.ts (76 stmts, LOW risk)
- Verify: `npx vitest run src/domain/booking/bookingStore.test.ts`
- Expected: +76 stmts covered

### RALPH-009 — Test lib/bookingQueue.ts (136 stmts, localStorage mock, MED risk)
- Verify: `npx vitest run src/lib/bookingQueue.test.ts`
- Expected: +136 stmts covered

### RALPH-010 — Test lib/wpHandoff.ts (119 stmts, SubtleCrypto mock, MED risk)
- Verify: `npx vitest run src/lib/wpHandoff.test.ts`
- Expected: +119 stmts covered

### RALPH-011 — Test data/locations.ts + data/faqs.ts + data/copy.ts + data/testimonials.ts (240 stmts, LOW risk)
- Verify: `npx vitest run src/data/*.test.ts`
- Expected: +240 stmts covered

### RALPH-012 — Test lib/env.ts + lib/envOverride.ts (76 stmts, window mock, MED risk)
- Verify: `npx vitest run src/lib/env.test.ts`
- Expected: +76 stmts covered

### RALPH-013 — Test lib/partialCapture.ts + lib/capi.ts (92 stmts, Supabase mock, MED risk)
- Verify: `npx vitest run src/lib/partialCapture.test.ts`
- Expected: +92 stmts covered

### RALPH-014 — Test hooks/useAnalytics.ts + hooks/useScrollReveal.ts (81 stmts, React mock, MED risk)
- Verify: `npx vitest run src/hooks/*.test.ts`
- Expected: +81 stmts covered

---

## P2 — Test Coverage: Component Tests (HIGH value, HIGH effort)

### RALPH-015 — Test small pure components: NotFound, SEO, Footer (100 stmts, LOW risk)
- `npx vitest run src/pages/NotFound.test.tsx`

### RALPH-016 — Test domain/leads/useLeadSubmitController (142 stmts, MED risk)
- Mock services + Supabase

### RALPH-017 — Test domain/booking/useConfirmAppointment (183 stmts, HIGH risk)
- Mock GHL proxy + Supabase

### RALPH-018 — Test components/quiz/* (610 stmts, MED risk)
- Mock quizState store

### RALPH-019 — Dead code removal with knip (LOC reduction, LOW risk)

### RALPH-020 — Test pages/legal/* (96 stmts, pure render, LOW risk)

---

## P3 — Architecture / Performance

### RALPH-021 — Extract data constants from components to src/data/
### RALPH-022 — React.lazy for admin pages (code splitting)
### RALPH-023 — React.memo for static-data components

---

## Status Legend
- [ ] = not started
- [x] = complete
- [~] = in progress
- [BLOCKED: reason] = cannot complete

## Current LOC baseline: 22787 (target: ≤ 20508)
## Current coverage: 1.68% (target: ≥ 80% — aspirational, ~8-10% realistic in 30 iters)

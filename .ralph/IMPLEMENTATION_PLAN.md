# Ralph Implementation Plan

Priority: P0 > P1 > P2 > P3

## P0 — Correctness & Type Safety
- [x] Verify no TypeScript `any` types exist (baseline: 0 — already clean)
- [x] Console.log audit — all 8 occurrences are appropriate error/warn logging, not debug

## P1 — SOLID / Duplication (Iterations 1–3)

### Iteration 1: Split ProductTRT.tsx — FAQ + Final CTA
- [x] Extract `TRTProductFAQ` sub-component from ProductTRT.tsx (lines 1571–1671)
- [x] Extract `TRTFinalCTASection` sub-component from ProductTRT.tsx (lines 1672–1752)
- [x] Commit: `ralph: extract TRTProductFAQ and TRTFinalCTASection from ProductTRT`

### Iteration 2: Split ProductTRT.tsx — Signs + Benefits
- [x] Extract `TRTSignsSection` sub-component from ProductTRT.tsx (lines 1430–1571)
- [x] Extract `TRTBenefitsSection` sub-component from ProductTRT.tsx (lines 1280–1432)
- [x] Commit: `ralph: extract TRTSignsSection and TRTBenefitsSection from ProductTRT`

### Iteration 3: Split ProductTRT.tsx — Process + Treatment Options
- [x] Extract `TRTProcessSection` sub-component from ProductTRT.tsx (lines 1017–1143)
- [x] Extract `TRTTreatmentOptionsSection` sub-component from ProductTRT.tsx (lines 1144–1281)
- [x] Commit: `ralph: extract TRTProcessSection and TRTTreatmentOptionsSection from ProductTRT`

### Iteration 4: Extract TRTQuestionnaire sub-components
- [x] Extract form step components from TRTQuestionnaire.tsx
- [x] Commit: `ralph: split TRTQuestionnaire into focused step components`

## P2 — Clean Code (Iteration 4–5)
- [ ] Extract magic color/style constants in ProductTRT.tsx to named constants
- [ ] Add JSDoc to key exported functions/types
- [ ] Verify no dead code or unused imports after splits

## P3 — Performance (Iteration 5)
- [ ] Add React.lazy() for heavy admin pages
- [ ] Add useMemo for static data arrays in large components
- [ ] Verify images have proper loading="lazy"

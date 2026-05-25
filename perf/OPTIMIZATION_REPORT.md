# Bundle Optimization Report

Generated: 2026-05-25 | Duration: ~85 minutes | Passes: 20

## Baseline vs Final Metrics

| Metric | Baseline | Final | Delta |
|--------|----------|-------|-------|
| Total raw | 1,185.0 KB | 1,011.6 KB | -173.4 KB (-14.6%) |
| Total gzip | 370.3 KB | 318.4 KB | **-51.9 KB (-14.0%)** |
| index.js (gzip) | 41.96 KB | 26.71 KB | -15.2 KB (-36.3%) |
| vendor-ui (gzip) | 78.53 KB | 5.43 KB | -73.1 KB (-93.1%) |
| vendor-forms (gzip) | 12.11 KB | 0 KB | -12.1 KB (-100%) |
| vendor-state (gzip) | 7.66 KB | ~0.4 KB | -7.3 KB (-95%) |

## Critical Path (Preloaded chunks)

| Chunk | Before | After | Change |
|-------|--------|-------|--------|
| vendor-router | 8.57 KB | 53.74 KB | +45.2 KB (absorbed React) |
| vendor-ui | 78.53 KB | 5.43 KB | -73.1 KB |
| vendor-state | 7.66 KB | 0.4 KB | -7.3 KB |
| index.js | 41.96 KB | 26.71 KB | -15.2 KB |
| **Total critical** | **~170 KB** | **~86 KB** | **-84 KB (-49%)** |

## Top 10 Changes by Impact

| Pass | Category | Change | Gzip Saved |
|------|----------|--------|-----------|
| P9 | B | Replace zod with miniSchema (50-line validator) | 12.1 KB (-3.66%) |
| P5 | K | Remove unused TooltipProvider + react-tooltip tree | 12.4 KB (-3.42%) |
| P1 | K | Remove dead Sonner toast component | 8.9 KB (-2.40%) |
| P7 | K | Remove @tanstack/react-query (zero useQuery calls) | 7.0 KB (-2.03%) |
| P6 | K | Remove @radix-ui/react-toast, replace with inline CSS | 6.1 KB (-1.74%) |
| P8 | B | Replace react-helmet-async with 50-line useSEO hook | 5.4 KB (-1.61%) |
| P17 | B | Replace @vercel/analytics React wrappers with native | 2.6 KB (-0.81%) |
| P2 | B | Move react-dialog to lazy booking routes | 7.4 KB vendor-ui (UX) |
| P11 | C | Add fetchpriority=high to LCP logo | LCP improvement |
| P13 | E | Add drop:debugger to esbuild options | Safety |

## Reverted Experiments

| Pass | Hypothesis | Reason |
|------|-----------|--------|
| P3 | Lazy-load Toaster + remove react-toast from vendor-ui | Small isolated chunks compress less efficiently; +1.6KB |
| P4 | treeshake propertyReadSideEffects:false | Index chunk grew 5KB; -0.22% below threshold |
| P12 | Lazy-load TRTEverythingIncluded | Isolated chunk regression; +0.9KB |
| P14 | Lazy-load @vercel/analytics components | Isolated chunks; +1.7KB regression |

**Pattern**: Splitting eager code into small isolated lazy chunks consistently causes compression regression due to loss of context for the compressor. Code compression is more efficient when similar patterns are grouped together.

## Architectural Summary

### What We Removed (Dead Code)

1. **@radix-ui/react-tooltip** — TooltipProvider wrapped the entire app but zero Tooltip components existed anywhere
2. **@radix-ui/react-toast** — Toaster rendered in App.tsx but toast() never called; replaced with 5-line inline CSS toast for LpDirectory
3. **@tanstack/react-query** — QueryClientProvider wrapped the entire app but zero useQuery/useMutation calls existed
4. **react-helmet-async** — Full SPA; replaced with 50-line useSEO hook using direct document.head manipulation
5. **zod** — Form validation library replaced with 150-line inline miniSchema with identical API
6. **sonner** — Toast library; toast() was never called in production code
7. **@sentry/react** — Never imported in production code (sentry.ts file existed but was never imported)
8. **@vercel/analytics/react** — React wrapper replaced with native script injection + queue initialization
9. **@vercel/speed-insights/react** — Same as above

### What We Restructured

- Moved `@radix-ui/react-dialog` from eager vendor-ui to lazy booking route chunks (dialog only used in booking flow)
- Removed empty `vendor-forms` manualChunk after zod removal
- Updated `vendor-state` to remove react-query entry

## Remaining Bottlenecks

1. **vendor-supabase (52 KB gzip, lazy)**: supabase-js v2 is monolithic; could be replaced with REST API calls (~90% savings) but requires significant refactoring. Not on critical path — only loads when booking.
2. **vendor-router (52 KB gzip, critical)**: Includes React 18 (~100KB raw) + react-router-dom. Unavoidable without upgrading to React 19 (which is lighter).
3. **index.js (27 KB gzip, critical)**: Landing page + app shell. Already lean after removing dead dependencies.
4. **CSS (9 KB gzip, critical)**: Tailwind purged. Further reduction needs custom CSS approach.

## Performance Budget

See `perf-budget.json` for detailed budgets.

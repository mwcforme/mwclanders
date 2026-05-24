# Baseline Grep — Remove "free" from Member-Facing Copy

**Date:** 2026-05-24
**Pattern:** `\bfree\b` (case-insensitive, word boundaries)
**Scope:** src/, public/, index.html, supabase/

---

## Full Match Table

| # | File | Line | 6-word context | Channel | Action |
|---|------|------|----------------|---------|--------|
| 1 | `src/components/landing/trt/TRTHeroForm.tsx` | 112 | `Reserve Your **Free** 60-Minute Visit.` | Page copy / form header | **EDIT** |
| 2 | `src/pages/product/TRTLabRequisition.tsx` | 76 | `Testosterone Total & **Free**, LH, FSH` | Page copy / lab panel label | **EXEMPT — clinical term** (see below) |
| 3 | `src/components/landing/edu/TRTEduHowTRTWorks.tsx` | 5 | `total testosterone, **free** testosterone, SHBG` | Education page body | **EXEMPT — clinical term** |
| 4 | `src/components/landing/edu/TRTEduWhatIsLowT.tsx` | 45 | `Total testosterone, **free** testosterone, SHBG` | Education page body | **EXEMPT — clinical term** |
| 5 | `src/pages/TRTQuizApproved.tsx` | 412 | `total and **free** testosterone.` | Quiz result page | **EXEMPT — clinical term** |
| 6 | `src/data/copy.ts` | 8 | `The word "**free**" (any case) is BANNED` | Code comment / compliance rule | **EXEMPT — rule declaration** |
| 7 | `src/lib/ghlCalendars.ts` | 40 | `Fetch **free** appointment slots` | Code comment | **EXEMPT — API terminology** |
| 8 | `src/lib/ghlCalendars.ts` | 44 | `/calendars/{id}/**free**-slots` | API path string | **EXEMPT — GHL API path** |
| 9 | `src/data/data.test.ts` | 131/135 | `contains banned word '**free**'` | Test fixture | **EXEMPT — compliance test** |
| 10 | `supabase/functions/ghl-proxy/index.ts` | 9 | `/free-slots` route pattern | Edge function / API path | **EXEMPT — GHL API path** |
| 11 | `supabase/functions/ghl-sync/index.ts` | 1, 49 | `free slots`, `/free-slots?` | Edge function comment + API path | **EXEMPT — GHL API path** |

---

## Member-Facing Edits Required: 1

### Match #1 — TRTHeroForm.tsx:112
**Current:** `Reserve Your Free 60-Minute Visit.`
**Channel:** Form card header — visible to all LP visitors
**Variants for selection:**
- **A:** `Reserve Your 60-Minute Visit.` (drop word, preserve structure)
- **B:** `Book Your 60-Minute Visit.` (stronger verb)

**Selected:** Variant A — preserves "Reserve" which signals scarcity/commitment, drops the price frame entirely.

---

## Compliance / Legal Exceptions (do NOT auto-edit)

None found. All remaining "free" instances are either:
- Clinical medical terminology ("free testosterone" = unbound testosterone fraction — a standard lab biomarker, not a price descriptor)
- GHL API path strings that must match the external API spec exactly
- Internal code comments and compliance rule declarations
- Test fixtures that enforce the compliance rule

---

## Analytics Event Flags for Data Team

No event names, A/B test identifiers, or experiment flags containing "free" were found in the codebase. No dashboard impact.

---

## After State

Zero member-facing instances of `\bfree\b` as a price descriptor after edit #1 is applied.

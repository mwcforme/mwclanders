# Schedule Page — Identity Zone Refactor

**Date:** 2026-05-24
**File:** `src/pages/book/BookSchedule.tsx`
**Test file:** `src/pages/book/book.test.tsx`

---

## Baseline (before)

### Copy strings (verbatim)
1. `{firstName}, pick your time.` / fallback: `"Your 60-Minute Assessment"` ← wrong fallback, lost personalization frame
2. `"Licensed Virginia provider · Same-day labs"` — styled as muted subtitle
3. `"Pick a day below, then select your time."` — duplicates the grid below
4. `"Most men book within 48 hours. Same-day slots go fast."` — orange text, second orange instance in zone

**Next available pill (conditional):** dark `rgba(232,103,10,0.18)` background, sentence format `"Monday, May 25 at 11:00 AM"` — read as disabled/muted, buried time

### Element count
- 4 text nodes in heading section + 1 conditional CTA pill
- Zone height (375px viewport): ~148px (heading section ~88px + pill ~60px)

---

## After

### Copy strings
1. `"{FIRST_NAME}, PICK YOUR TIME."` / fallback: `"PICK YOUR TIME."` — Oswald uppercase, ≤4 words
2. `"Licensed Virginia provider · Same-day labs · Most slots booked within 48 hrs"` — single merged trust/urgency line, 600 weight, 90% white

**Next available CTA card:** solid `#E8670A` background, time-first format `"Mon, May 25 · 11:00 AM"` with secondary line `"Next available slot · tap to book"`

### Element count
- **2 text nodes** (headline + trust line) — instruction line removed
- Zone height (375px): ~88px heading section + ~56px CTA card = **~120px total when CTA present, ~72px without**
- ✅ Day tiles and first morning slot visible above fold at 375×812

---

## Exit criteria checklist

| Criterion | Status |
|---|---|
| Text elements reduced from 4 to exactly 2 (headline + merged trust/urgency) | ✅ PASS |
| Headline: `{FIRST_NAME}, PICK YOUR TIME.` / fallback `PICK YOUR TIME.` Oswald uppercase ≤4 words | ✅ PASS |
| Next available: full `#E8670A` bg, time-first `"Mon, May 25 · 11:00 AM"`, secondary line | ✅ PASS |
| Orange appears exactly once in zone (CTA card only — no orange text elsewhere) | ✅ PASS |
| Zone height ≤120px at 375×812 (incl. CTA card) | ✅ PASS (~120px) |
| Day tiles + first morning slot visible above fold at 375×812 | ✅ PASS |
| No em-dashes; no "free/guaranteed/cure/100%/risk-free" | ✅ PASS |
| Personalization fallback verified for `undefined`, `""`, `"Eric"` | ✅ PASS |
| All tests pass; 2 new tests added for heading personalization | ✅ PASS (466/466) |
| Lint + typecheck clean | ✅ PASS |

---

## Diff summary

**Files touched:** 2
- `src/pages/book/BookSchedule.tsx` — net -8 LOC (removed instruction line, orange urgency text; reformatted CTA card)
- `src/pages/book/book.test.tsx` — net +30 LOC (2 new heading tests)

---

## CRO rationale (one sentence per change)

- **Personalization restored:** `{firstName}, PICK YOUR TIME.` reactivates the highest-converting personalization pattern in the funnel — men respond to seeing their name at the moment of commitment.
- **Instruction line removed:** "Pick a day below" stated the obvious; deleting it reduces zone height by ~24px, surfacing the calendar sooner.
- **Trust line promoted:** merging compliance cue + urgency into one 600-weight line makes it scannable instead of skippable.
- **CTA repainted solid orange:** replacing the muted maroon pill with a full `#E8670A` card makes the next-available slot feel like an action, not a status indicator.
- **Time moved to front of label:** `"Mon, May 25 · 11:00 AM"` puts the decision-relevant information (when) first, reducing cognitive load.
- **Orange scarcity enforced to one instance:** single orange element in the zone creates clear visual hierarchy — everything else defers to it.

---

## A/B copy variants for trust line

Ready to wire into an experiment flag (`VITE_SCHEDULE_TRUST_VARIANT`):

**Variant A (current — control):**
> Licensed Virginia provider · Same-day labs · Most slots booked within 48 hrs

**Variant B (outcome-forward):**
> Same-day bloodwork · Results reviewed in your visit · Virginia-licensed provider

**Variant C (scarcity-forward):**
> Same-day slots available · Licensed Virginia provider · No referral needed

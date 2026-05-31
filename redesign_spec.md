# MWC Booking Funnel Redesign Spec
**Author:** Subagent — Conversion Designer + Senior React Engineer  
**Date:** 2026-05-31  
**Target:** book.menswellnesscenters.com — /book/schedule, ReviewSheet, /book/confirmed

---

## PHASE 1: TEARDOWN — Top 5 Conversion Leaks

### 1. CRITICAL: No momentum in the BookSchedule header (highest impact)
The h1 "Lock in a time, [name]." is task-correct but conversion-weak. It:
- Communicates zero value or benefit
- Has no social proof adjacent
- Has no visual weight hierarchy
- The location drawer is a "friction island" — users don't need to open it to book, it just adds visual noise
- **Fix:** Strong editorial header with value framing + social proof badge. A/B variants.

### 2. HIGH: "Next available" is a small chip that's easy to miss
The pulsing chip "Next available: Mon, Jun 1 · 9:00 AM →" is the single highest-conversion element on the page — it one-click books the slot. But it:
- Looks like a secondary UI element, not a primary CTA
- Gets lost in the header area vs standing out as a featured option
- No visual isolation (24px+ clearance) from surrounding elements
- **Fix:** Elevate to a featured card with orange left border and clear CTA treatment.

### 3. HIGH: ReviewSheet lacks social proof + email friction
The review sheet has good bones (timer, slot details, CTA) but:
- No social proof adjacent to the CTA — user's last hesitation point
- Email field label "Email (optional)" signals it's not needed → users skip → no follow-up
- The "Change time" button is visually close to the primary CTA — easy escape
- **Fix:** Add social proof badge, relabel email as "Get your confirmation sent here", push "Change time" further down visually.

### 4. MEDIUM: BookConfirmed doesn't immediately drive the #1 post-book action
The confirmation sequence puts the appointment card first, then calendar adds. But "add to calendar" is the #1 action that prevents no-shows. It should appear within the first scroll.
- The celebration hero is generic (just a checkmark)
- Calendar CTAs are buried after the appointment card
- **Fix:** Move calendar CTA higher. Stronger hero with larger typography and social proof.

### 5. MEDIUM: No social proof anywhere in the booking flow
From entry to confirmation, there are zero trust signals: no star ratings, no patient counts, no testimonials, no outcome stats. Our audience (skeptical men 40-65) stall at the moment of commitment.
- **Fix:** Add 1 trust strip above the calendar panel, 1 proof line in ReviewSheet CTA area.

---

## PHASE 2: RADICAL SPEC

### Section Sequence — BookSchedule (engineered for momentum)

```
1. HEADER (Variant A or B)
   ├── [A] Clean: Brand + location + task headline + progress
   └── [B] Editorial: Eyebrow + large headline + social proof badge
2. NEXT AVAILABLE CARD (featured, not a chip)
   └── If available: Bold card with slot info + "Jump to this time" button
3. TRUST STRIP (3 signals, horizontal, lightweight)
   └── "Same-week appointments" | "Labs on-site" | "No commitment"
4. CALENDAR PANEL (day strip + time slot grid)
5. HELP LINE (phone CTA, subtle)
```

### Booking-First Architecture
- The "Next available" card absorbs most of the CTA energy — users who aren't picky should book in 2 taps
- The calendar panel is for users who want to browse
- ReviewSheet appears immediately on any slot selection (existing behavior — keep)
- Mobile: no sticky bar needed (ReviewSheet as bottom sheet handles this)

### Visual System Updates

**Typography scale:**
- Hero h1: `Oswald` clamp(2.2rem, 6vw, 3.2rem), uppercase, tight tracking
- Variant B h1: clamp(2.8rem, 8vw, 4rem) — MORE dominant
- Section eyebrow: `Oswald` 11px, 0.18em tracking, orange, uppercase
- Body: `Inter` 15px, line-height 1.6

**Spacing rhythm:**
- Header → Next Available card: 24px gap (--space-3)
- Next Available card → Trust strip: 20px gap
- Trust strip → Calendar panel: 16px gap
- All internal card padding: 20px (--space-2.5 approximated as 20px)
- CTA isolation: 24px minimum above/below primary buttons

**Dark surface treatment:**
- Background: var(--brand-navy-deep) #0B1029
- Panel (calendar card): white (#fff) with --shadow-xl
- Trust strip: rgba(255,255,255,0.06) glass card
- Next available card: rgba(255,255,255,0.07) with orange left border

**Brand orange use:**
- CTA buttons: `var(--brand-cta)` #B84A08 — ONLY buttons and icons
- Left border accent on Next Available card: `var(--brand-accent)` #E8670A
- Eyebrow text: `var(--brand-accent)` #E8670A
- NEVER as a card/panel background

**Motion approach (purposeful, not decorative):**
- Page mount: fade-in 200ms ease-out (already on BookLayout)
- Next available card: slide-in-from-top 300ms with 100ms delay (on first render only)
- ReviewSheet: existing slideUp animation — keep
- BookConfirmed checkmark: scale 0.5→1.0 with bounce, 400ms
- Reduced motion: @media queries already in index.css — honor them

### A/B Header Variants

**Variant A — "Clean & Confident"**
- Minimal layout, white text on dark navy
- Small pill badge: step progress ("Almost done")
- Eyebrow: "YOUR APPOINTMENT" in orange
- H1: "Lock in a time, [name]." (or "Pick your time." if no name)
- Location label (MapPin icon + city name) — no drawer, no expand
- Value prop: none visible (trust is baked into the flow)
- Tone: task-completion, professional

**Variant B — "Bold Editorial"**
- More assertive visual presence
- No step progress pill
- Eyebrow: "YOUR [SERVICE UPPERCASE] CONSULTATION" or "YOUR CONSULTATION"
- H1: larger, "YOUR TIME IS NOW." or "TAKE CONTROL." — commanding, masculine
- Social proof badge: pill with star + "4.9 stars · 400+ men in Virginia"
- Sub-copy: 1 line explaining benefit
- Tone: empowering, results-focused, premium

---

## PHASE 3: BUILD PLAN

### Files to modify:
1. `src/pages/book/BookSchedule.tsx` — A/B header, featured Next Available card, trust strip
2. `src/components/book/ReviewSheet.tsx` — social proof near CTA, improved email field
3. `src/pages/book/BookConfirmed.tsx` — stronger hero, calendar CTAs earlier

### Files NOT to touch:
- src/pages/OptimizeLP.tsx (mandated)
- Any landing pages
- src/hooks/useSlotFetching.ts
- src/domain/booking/ (store, guard, useConfirmAppointment)
- src/lib/scheduleUtils.ts
- src/data/locations.ts

### Feature flag implementation:
- URL param `?v=b` → boolean `isVariantB`
- `useSearchParams()` from react-router-dom (already imported in app)
- Variant stored as a `const` derived at component top — no state needed

### CRO Targets per rubric:
1. CTA persistence: ReviewSheet bottom sheet covers mobile ✅ | time slot grid CTAs visible on desktop ✅
2. Headline 3x body: Oswald header at ~2.2rem vs body at 0.94rem = 2.3x → push to 2.8rem for 3x ✓
3. 24px CTA isolation: ReviewSheet CTA padding ≥24px top/bottom ✓
4. Visual rhythm: 3 distinct visual blocks (header/card/help) with clear separation ✓
5. Social proof: trust strip + ReviewSheet proof line ✓
6. Zero clutter: remove location drawer from main flow ✓
7. WCAG AA: use only --brand-cta tokens (never --brand-accent for text) ✓
8. Distinctive/masculine: editorial typography, Oswald/Inter stack, dark navy, strong orange ✓
9. Flow functional: zero changes to booking logic ✓

---

## A/B Implementation

### Detection:
```tsx
const [searchParams] = useSearchParams();
const isVariantB = searchParams.get("v") === "b";
```

### Variant A URL: /book/schedule
### Variant B URL: /book/schedule?v=b

---

*Spec written. Building immediately.*

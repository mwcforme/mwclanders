
## Fix 11 — `/book/confirmed` Name Bug + "You're Booked" Celebration Card

### Part A — Name bug

Current code in `src/pages/book/BookConfirmed.tsx`:
```ts
const fullName = [identity?.firstName, identity?.lastName].filter(Boolean).join(" ");
```
There's no slice — so the truncation ("er") is almost certainly stale/garbage data persisted in the Zustand booking store from an earlier test session (the store partializes `identity` to localStorage). The form's hand-off (`TRTHeroForm` → `enterBookingFunnel`) passes the raw input, but a previously-poisoned localStorage entry will survive across reloads.

Fix:
1. Defensive normalization in `BookConfirmed.tsx`:
   ```ts
   const rawFirst = (identity?.firstName ?? "").trim();
   const rawLast  = (identity?.lastName  ?? "").trim();
   const firstName = rawFirst.split(/\s+/)[0] || "";
   const fullName  = [rawFirst, rawLast].filter(Boolean).join(" ").trim();
   ```
2. Render `firstName` in the new personalized line ("You're all set, {FirstName}.") and `fullName` only if needed elsewhere.
3. One-time clear of any stale persisted identity that has no `phone` AND no `email` (treat as corrupt) — guards against any short fragment like "er" surviving.
4. Add a unit-style guard: if `firstName.length < 2`, fall back to "You're all set." (no name) instead of rendering a fragment.

### Part B — "You're Booked" celebration card

Add a new top card **above** the existing 2-column grid. Remove the existing standalone status header (lines ~98–148 of `BookConfirmed.tsx`) since the new card replaces it.

**Card content (top to bottom):**
1. Animated green check (existing `CheckCircle2`) inside the existing green ring — add SVG stroke-draw (~600ms) + single radial glow pulse decaying over 1.5s.
2. `<h1>` "APPOINTMENT CONFIRMED" — Oswald 600, uppercase, white, clamp(28px, 4.4vw, 40px).
3. Personalized line: `You're all set, {firstName}.` — Inter 500, 18px, white 90%.
4. Appointment line: formatted via existing `formatAppointment(effectiveAppt)` but rebuilt as `{Weekday}, {Month} {Day} · {Time} ET` — Oswald 600, clamp(20px, 2.6vw, 28px), white.
5. Location line: `{center.city} clinic, in person` — Inter 500, 16px, white 75%.
6. Two trust pills (horizontal, centered, wrap on mobile):
   - `✓ Confirmation sent to your phone`
   - `✓ No-cost, no obligation`
   Pills: rounded-full, `rgba(255,255,255,0.06)` bg, `rgba(255,255,255,0.16)` border, white 85% text, 12px Inter 600 uppercase letter-spacing 0.08em, Lucide `Check` icon `#22C55E` 14px.

**Card style:** elevated dark surface to feel like the "win" state — `background: linear-gradient(180deg, #0B1330 0%, #060B22 100%)`, `border: 1px solid rgba(255,255,255,0.08)`, `borderRadius: 16`, `padding: 40px 28px (mobile) → 56px 48px (md)`, `boxShadow: 0 24px 60px rgba(0,0,0,0.45)`. Centered content. No stock imagery, no emojis in headers (✓ in pills only — Lucide icon, not unicode).

**WCAG:** all text on the dark gradient ≥ 4.5:1 (white 75% on #060B22 ≈ 13:1 ✓). Pill border + text ≥ 3:1.

**Animations (one-time per session):**
- Confetti: `canvas-confetti` (~10kb, no peer deps) — single burst from top center, ~100 particles, colors `["#E8670A", "#F97316", "#FFFFFF", "#FCD9B4"]`, gravity 1.1, decay 0.92, duration ~1.8s. Auto-cleans canvas after.
- Card: fade + translateY(12px → 0) over 400ms ease-out on mount.
- Check: SVG `stroke-dasharray` draw 600ms, then box-shadow glow pulse once (1500ms ease-out).
- **Gating:** `sessionStorage.getItem('mwc_booking_celebrated')` — if present, skip confetti + check-draw + glow (card still fade-slides in). Set the flag immediately after firing.
- **Reduced motion:** `window.matchMedia('(prefers-reduced-motion: reduce)').matches` → render final state, no confetti, no draw, no glow, no slide. Card appears instantly.

**New file:** `src/components/book/BookedCelebrationCard.tsx` — encapsulates the card, animations, confetti, sessionStorage gating, reduced-motion guard. Receives `firstName`, `apptTime` (already-formatted string or raw ISO), `locationCity` as props.

**Dependency:** add `canvas-confetti` + `@types/canvas-confetti` via `bun add`. (Lovable supports adding deps; CSS-only fallback not needed.)

**Files touched:**
- `src/pages/book/BookConfirmed.tsx` — remove old status header (lines 98–148), normalize name, render `<BookedCelebrationCard>` at top of inner container, keep location card / map / video / footer untouched below.
- `src/components/book/BookedCelebrationCard.tsx` — new.
- `package.json` — add `canvas-confetti`.

### Out of scope
- No changes to location card, map embed, "What to Expect" video, or reschedule footer line.
- No backend/store schema changes; the corrupt-identity guard is a one-time client cleanup only.

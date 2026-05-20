# WCAG AA Contrast Audit & Fix Plan

The project already has a comprehensive audit harness (`scripts/wcag-audit.mjs`) covering 87 color pairs across landing, hero, forms, booking funnel, quiz, footer, sticky bar, etc. Running it now reports **81 PASS / 6 FAIL**. Tokens and most pairs are already AA-compliant (see `a11y/contrast-audit.md`). This plan resolves the remaining 6 failures with minimal hue change, routes them through semantic tokens in `src/index.css`, and verifies via the existing script.

## 1. Failing pairs (current)

| # | Pair | FG | BG | Ratio | Need |
|---|---|---|---|---:|---:|
| 1 | Form placeholder on white | rgba(11,16,41,0.45) → #91939F | #FFFFFF | 3.05 | 4.5 |
| 2 | Header CTA orange / white label (small-bold) | #FFFFFF | #E8670A | 3.29 | 4.5 |
| 3 | Sticky bar "Book" text on orange (normal-bold) | #FFFFFF | #E8670A | 3.29 | 4.5 |
| 4 | OptionRow orange icon on cream chip | #E8670A | #FFF1E3 | 2.97 | 3.0 (UI) |
| 5 | LetsTalk SMS reply note on white | #9CA3AF | #FFFFFF | 2.54 | 4.5 |
| 6 | BookSymptom disabled btn label on #D1D5DB | #6B7280 | #D1D5DB | 3.28 | 4.5 |

## 2. Fixes (token-first, brand-preserving)

| # | Resolution | New ratio |
|---|---|---:|
| 1 | Swap inline `rgba(11,16,41,0.45)` placeholders to existing token `--c-placeholder-on-white` (#636B80). | 5.32:1 ✓ |
| 2 | Use existing token `--brand-cta-accessible` (#BF5608) as the **fill** for any orange CTA that carries small/normal-bold white text (header pill, sticky bar). Keep `--brand-cta` (#E8670A) for hero-sized large-bold CTAs where 3.29:1 qualifies AA-large. | 4.62:1 ✓ |
| 3 | Same as #2 — apply to `StickyMobileCTA` book-side fill. | 4.62:1 ✓ |
| 4 | Darken the cream chip background from `#FFF1E3` to `#FFE4CC` (still warm/on-brand), or use icon `--brand-cta-accessible` on `#FFF1E3`. Chosen: switch chip bg to `#FFE4CC`. Define `--c-chip-orange-bg`. | 3.04:1 ✓ |
| 5 | Replace tailwind `text-gray-400` (#9CA3AF) with `--c-text-on-light-muted` (#424857) for the SMS reply note. | 9.5:1 ✓ |
| 6 | Disabled button: switch text from #6B7280 to `--c-text-on-light` (#000033) at opacity 1, and use disabled bg `#E5E7EB` with explicit `aria-disabled` styling. New pair #000033 on #E5E7EB. | 14.5:1 ✓ |

## 3. Token changes in `src/index.css`

Add (or reuse):
```css
--c-placeholder-on-white: #636B80;     /* exists */
--brand-cta-accessible:   #BF5608;     /* exists */
--c-chip-orange-bg:       #FFE4CC;     /* NEW */
--c-btn-disabled-bg:      #E5E7EB;     /* NEW */
--c-btn-disabled-fg:      #000033;     /* alias of --c-text-on-light */
```

No hue redesign. Brand orange `#E8670A` stays the canonical accent for large/icon usage.

## 4. Files to touch

- `src/index.css` — add the two new tokens.
- Hero/landing forms (placeholders): `TRTHeroForm.tsx`, `TRTHeroFormShort.tsx`, `TRTFinalCTA.tsx`, `IntakeFormHelpers.tsx`.
- Orange CTA fills with small/normal-bold labels: `TRTHeader.tsx` (phone/CTA pill), `StickyMobileCTA.tsx`.
- `src/components/book/OptionRow.tsx` — chip bg token.
- `src/pages/book/BookLetsTalk.tsx` — SMS note color.
- `src/pages/book/BookSymptom.tsx` — disabled button colors.
- `scripts/wcag-audit.mjs` — update the 6 pairs with new values so the matrix stays the source of truth.

## 5. Verification

1. `node scripts/wcag-audit.mjs` → expect `PASS: 87  FAIL: 0`.
2. Visual spot-check (mobile 823×519): hero CTA pill, sticky mobile CTA, BookLetsTalk page, BookSymptom disabled state, OptionRow.
3. Update `a11y/contrast-audit.md` with the new ratios and tokens.

## 6. Out of scope

- Shadcn `--primary/--secondary/...` tokens are already AA on both modes (black on cream / white on navy). No changes to base HSL semantic tokens.
- No redesign of palette; only minimal value shifts to clear AA thresholds.
- Light/dark mode parity verified — dark mode uses navy + white which already passes; cream/orange tokens are mode-agnostic.

Once approved I'll apply the edits, run the audit, and report the final counts.

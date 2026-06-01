# Men's Wellness Centers — Brand System for OpenClaw (v1.2.1)

A portable, brand-locked design system for Men's Wellness Centers, packaged for use with OpenClaw across React, WordPress, and plain CSS. The single source of truth is `tokens.json`; every other file is generated from or maps to it.

---

## Quick start with OpenClaw

1. **Paste `openclaw.md` at the top of any build/edit prompt** (or load it as a system/brand-law file in the workspace). It is the master brand law: color, type, components, CRO, compliance, accessibility, plus a 12-point Ralph-loop audit checklist. Everything OpenClaw produces for Men's Wellness Centers must pass it.
2. **Point OpenClaw at the right layer:**
   - React/Next/Vite app -> `react/` (`theme.ts`, `tailwind.config.ts`, `components/`, `README-react.md`)
   - WordPress site -> `wordpress/` (`theme.json`, `mwc-brand.php`, `patterns/`, `README-wordpress.md`)
   - Anything else (static HTML, email, builder Custom CSS) -> `css/` (`tokens.css`, `README-css.md`)
3. **Tokens live in `tokens.json`.** To change a value, edit `tokens.json` first, then regenerate `css/tokens.css`, `react/theme.ts`, and `wordpress/theme.json` so all three stay in sync. Never hand-edit a hex in just one place.

---

## Folder map

```
mwc-brand-openclaw/
  README.md                 # this file — how to wire the package into OpenClaw
  openclaw.md               # MASTER brand law + 12-point Ralph-loop audit (paste into build prompts)
  tokens.json               # SINGLE SOURCE OF TRUTH (v1.2.1)
  css/
    tokens.css              # canonical CSS custom properties (--p-* primitives, --c-* semantic)
    README-css.md           # verbose CSS usage guide
  react/
    theme.ts                # typed token object + inline-style helpers + MwcTokens type
    tailwind.config.ts      # tokens -> Tailwind utilities (bg-action, text-on-action, shadow-cta, ...)
    components/             # Button, Input, Selectable, Checkbox, Card, index
    examples/ConsultForm.tsx
    README-react.md         # verbose React integration guide
  wordpress/
    theme.json              # WP palette + typography + button/link/heading element styles
    mwc-brand.php           # enqueue fonts + tokens.css + brand-locked core-block CSS
    patterns/consult-hero.php
    README-wordpress.md     # verbose WordPress integration guide
```

---

## The color law in one screen (every layer enforces this)

- **Primary button = deep `#CA4A0E` (orange-800) + orange glow, with WHITE text** (4.67:1, passes AA). Hover deepens to `#D35F1A` (orange-600).
- **Accent = basic site orange `#E8732A`** (from menswellnesscenters.com): icons, links on navy, eyebrows, focus ring, glow. It is NOT a button fill (white on it is 3.04:1).
- **Selected chip / active option = the same deep `#CA4A0E` + WHITE text + white icon** (identical to the primary button).
- **Deep `#CA4A0E` (orange-800)** is also the **checkbox/radio checked fill** (white check = 4.67:1) — the same deep orange as the primary button.
- **White secondary CTA** = white fill + navy text, for dark/navy backgrounds.
- **Glow** = `rgba(232,115,42,0.40)` (accent orange at 40%) on the primary button.
- **NO GRAY.** All muted text, borders, placeholders, disabled states are navy or cream at opacity — never `#ccc`, `#e5e7eb`, `#9ca3af`, or `gray/slate/zinc/neutral` scales.
- **Fonts:** Oswald (display / UPPERCASE), Montserrat (marketing body), Inter (app/form UI). **No Bebas Neue.** Success `#5DD68A` (no teal). Navy `#0B1029`, deep navy `#122256`, near-black `#0D0807`, cream `#F5F0EB`.
- **Sizing:** 4px spacing scale, radius 8px (controls) / 16px (cards), buttons min 52px, inputs 56px.

---

## Brand + CRO + compliance copy rules (all layers)

Always: **Men's Wellness Centers** (full name), **members** (not patients), **no-cost visit** (never "free"), **60-minute in-person** consult framing, CTA verbs **Book / Schedule / Claim / Reserve**, tagline **Finding Your Edge Over Age.**, LegitScript badge + disclosures in funnel/service footers.

Never: "clinic", "guy/guys", **em-dashes (—)** in patient-facing copy, white-on-orange, gray, teal, Bebas Neue, blue multi-color gradients, before/after imagery, outcome guarantees, competitor names in copy, brand Rx names in ad copy.

---

## Ralph-loop usage (openclaw-ralph-optimizer)

When OpenClaw runs an autonomous optimize/refactor pass on Men's Wellness Centers code, load `openclaw.md` and treat its 12-point audit as hard invariants. A reduction in lines / bundle size is accepted **only** when (a) all unit tests pass, (b) every audit invariant still holds, and (c) the rendered output is visually unchanged. Each layer's README has a layer-specific invariant list (React §5, WordPress §5, CSS guide) you can wire directly into the test harness as assertions — e.g. grep for `bg-action` paired with `text-white` and fail the loop if found.

---

Version 1.2.1. Source of truth: `tokens.json`. Regenerate downstream files after any token edit.

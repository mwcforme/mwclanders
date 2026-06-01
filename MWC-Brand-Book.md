# MEN'S WELLNESS CENTERS — Brand Book
**Version 1.2.1 · 2026-05-31**
*"Finding Your Edge Over Age."*

The single source of truth for every digital surface. Built so that every human and AI builder produces an identical, on-brand, accessible result.

---

## How This Works

A brand spec that humans and AI both follow without drift must be deterministic, not descriptive. "Use navy and orange, keep it clean" produces three different forms. This system resolves every visual decision to a named token with one value, and gives every component one definition with all states. If a builder ever has to guess, that is a defect in the spec.

**The one rule that matters most:** Reference token names. Never hard-code a raw hex, px, or font value in code.

### The Layer Stack
1. **Primitive tokens** — Raw, context-free values: navy-900, space-4, radius-md
2. **Semantic tokens** — Intent: surface-input, action-primary-bg. The decision layer
3. **Component contracts** — Full anatomy + every state, built only from semantic tokens
4. **Patterns** — Compositions: forms, scheduler, confirmation
5. **Accessibility** — Verified contrast, focus, tap targets. Cross-cutting
6. **Governance** — Naming, change process, the AI-builder preamble

---

## Color

### The Palette

One navy. A bright orange that earns its glow. No teal. No neutral grays anywhere.

| Token | Value | Role |
|---|---|---|
| Midnight Navy | `#0B1029` | Dark bg |
| Warm Cream | `#F5F0EB` | Light bg / text on dark |
| Primary Orange | `#FF6B2C` | Primary button + glow / **NAVY TEXT** |
| Deep Orange | `#CA4A0E` | White-text button / checkbox checked fill |
| Deep Navy | `#122256` | Alt dark / logo bg |
| Near Black | `#0D0807` | Premium dark / logo bg |
| Orange Hover | `#F2630C` | Primary button hover (deepens) |
| Success | `#5DD68A` | Replaces teal everywhere |

### No Gray Rule

Every muted text, border, placeholder, and disabled value is navy or cream at opacity — never neutral gray.

| Usage | Value |
|---|---|
| Muted text on dark | cream @ 70% |
| Subtle text on dark | cream @ 55% |
| Hairline border on dark | cream @ 14% |
| Muted text on light | navy @ 70% |
| Placeholder on white | navy @ 55% |
| Input border / hairline on light | navy @ 25% |

### Critical Orange Rules

- **Primary buttons AND selected chips** = bright `#FF6B2C` with **NAVY text** (6.6:1 AA any size)
- **White text on `#FF6B2C` is BANNED** (only 2.84:1)
- **Button hover** deepens to `#F2630C` (still navy text)
- **Deep `#CA4A0E`** = rare white-text button + checkbox checked-fill (white text 4.67:1)
- **No teal anywhere.** Success = `#5DD68A`

---

## Logo

### The Mark

Wordmark plus the notched M bug. One approved fill at a time. Never gray, never stretched.

### Approved Pairings (all WCAG verified)
- White on Midnight Navy (18.7:1 AAA) — primary dark lockup
- White on Deep Navy (15.1:1 AAA)
- White on Near Black (19.9:1 AAA)
- Midnight Navy on White (18.7:1 AAA) — primary light lockup
- Deep Navy on White (15.1:1 AAA)
- Near Black on White (19.9:1 AAA)
- Orange bug on Near Black (7.0:1 AA) — bug accent only, not full wordmark

### Logo Rules

- One approved fill: white, midnight navy, deep navy, near black, or orange (bug only)
- Accent orange is for the M bug only — never fill the full wordmark in orange
- No gray fill. No gradients, photos, shadows, bevels, glows, or outlines on the mark
- Clear space on all sides = the height of the M bug
- Minimum size: wordmark 160px / 1.25in wide; bug 24px / 0.25in
- Never stretch, skew, rotate, re-space, or rebuild from a screenshot

---

## Typography

Three typefaces. Three jobs. Load all three. Never substitute.

```html
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

| Family | Role | Casing |
|---|---|---|
| **Oswald** | Headlines, display, eyebrows, big numbers | UPPERCASE always |
| **Montserrat** | Body copy on landing/content pages | Sentence case |
| **Inter** | App, forms, buttons, labels, UI chrome | Sentence (labels uppercase) |

**Bebas Neue is BANNED from all font stacks.**

Fallback stacks (no Bebas Neue):
- Display: `"Oswald", "Arial Narrow", sans-serif`
- Marketing: `"Montserrat", system-ui, sans-serif`
- UI: `"Inter", system-ui, sans-serif`

### Type Scale

| Style | Family | Size | Weight | Case |
|---|---|---|---|---|
| display | Oswald | clamp(40, 8vw, 96)px | 700 | UPPER |
| h1 | Oswald | clamp(32, 5vw, 56)px | 700 | UPPER |
| h2 | Oswald | clamp(24, 3vw, 36)px | 700 | UPPER |
| h3 | Oswald | 20px | 700 | UPPER |
| eyebrow | Inter | 12px | 700 | UPPER |
| body-lg | Montserrat | 18px | 400 | sentence |
| body | Montserrat | 16px | 400 | sentence |
| body-ui | Inter | 16px | 400 | sentence |
| label | Inter | 11px | 700 | UPPER |
| button | Inter | 16px | 700 | sentence |
| caption | Inter | 13px | 400 | sentence |

---

## Spacing (4px base)

4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96px

Default rhythm: 8 inside controls, 16 between fields, 24 inside cards, 48-64 between sections.

---

## Radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 4px | Chips, badges, small controls |
| `radius-md` | 8px | **Buttons, inputs, selectables** |
| `radius-lg` | 16px | **Cards, panels, modals** |
| `radius-pill` | 999px | Pills/tags only, never default buttons |

---

## Components (key rules)

### Primary Button
- Fill: `#FF6B2C` (bright orange) with glow shadow
- Text: **NAVY `#0B1029`** (6.6:1) — white text is BANNED
- Hover: deepens to `#F2630C`, navy text stays
- Min height: 52px, padding 14px 24px, radius 8px
- Button label: sentence case, Inter 700 16px

### Secondary Button (on dark backgrounds)
- White fill + navy text (18.7:1)
- No border, no glow

### Selectable Controls (date chips, time slots, location chips)
- **Selected: solid `#FF6B2C` fill + NAVY text** (6.6:1) — identical to primary button
- Unselected: navy/bordered with orange icon
- Radius 8px, min tap target 44px

### Checkbox (TCPA consent)
- Checked fill: `#CA4A0E` (deep orange) with WHITE check mark (4.67:1)
- Not `#FF6B2C` — white check on bright orange is only 2.84:1

### Input Fields (one canonical style)
- White fill, 2px navy-25 border, 8px radius, 56px tall
- Focus: orange border + 3px orange focus ring
- Font: Inter 16px (prevents iOS zoom)
- Labels: uppercase Inter 700 11px

### Success / Confirmation
- Success color: `#5DD68A` on dark
- **No teal anywhere** — teal is a defect

---

## Accessibility (WCAG 2.2 AA)

| Pairing | Ratio | Result |
|---|---|---|
| White on navy | 18.7:1 | AAA |
| Navy text on `#FF6B2C` (primary button) | 6.6:1 | AA any size |
| White text on `#CA4A0E` (deep button) | 4.67:1 | AA any size |
| White text on `#FF6B2C` (BANNED) | 2.84:1 | FAIL |
| `#5DD68A` success on navy | 10.2:1 | AAA |
| Orange `#FF6B2C` link/icon on navy | 6.6:1 | AA |

Rules:
- Visible orange focus ring (3px, 2px offset) on every interactive element
- Minimum tap target: 44x44px (buttons 52px, inputs 56px)
- Body text 16px minimum
- Color never the only signal — errors get icon + text

---

## AI Builder Preamble

Paste this at the top of any build prompt:

```
You are building a screen for Men's Wellness Centers. Follow these rules exactly.

COLOR: Navy #0B1029 is the only dark bg. Primary buttons = #FF6B2C bright orange with NAVY text 
(6.6:1); hover deepens to #F2630C, navy text stays. Deep #CA4A0E = rare white-text button + 
checkbox checked-fill. White text on ANY orange fill is BANNED (2.84:1). Secondary CTA on dark 
= white fill + navy text. Selected chips = same bright #FF6B2C + navy text as primary button.
NO TEAL. Success = #5DD68A.
NO GRAY. Muted = navy or cream at opacity.
TYPE: Oswald (headlines UPPERCASE), Montserrat (marketing body), Inter (app/forms/UI). 
NO Bebas Neue. Labels = uppercase Inter 700 11px. Buttons = sentence case.
RADIUS: 8px buttons/inputs, 16px cards.
INPUTS: white fill, 2px navy-25 border, 8px radius, 56px tall. Focus = orange border + ring.
SELECTABLES: selected = solid #FF6B2C fill + NAVY text. Same as primary button.
A11Y: WCAG 2.2 AA. Orange focus ring on everything. 44px min targets. 16px min body.
BRAND: "Men's Wellness Centers" always. "members" not patients. "no-cost" not free. 
No em-dashes. 60-minute in-person framing. LegitScript badge in footer.
Mobile-first at 390px.
```

---

*Companion files: `tokens.json` (machine-readable source of truth), `MWC-Brand-Design-Spec.md` (full spec)*

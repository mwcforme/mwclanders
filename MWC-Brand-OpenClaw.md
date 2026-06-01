# Men's Wellness Centers — Brand System (OpenClaw Master Prompt)

**Version 1.2.1 · 2026-05-31 · Source of truth: `tokens.json`**

You are building or editing a digital surface for **Men's Wellness Centers**. This document is the brand law. Paste it at the top of any OpenClaw build/refactor/QA prompt. When any instruction conflicts with this file, this file wins unless the user explicitly overrides it. Apply every rule below before returning code.

This export covers three stacks. Read the one you are working in, but the rules in this file apply to all of them:
- `css/` — the canonical `tokens.css` (the literal source values) plus a usage guide.
- `react/` — React + TypeScript theme, Tailwind config, and copy-paste components.
- `wordpress/` — `theme.json`, enqueue PHP, and block-pattern mappings for the WP site.

---

## 0. THE ONE RULE THAT MATTERS MOST

**Reference token names. Never hard-code a raw hex, px, or font value in component code.**

If you type `#E8732A`, `#CA4A0E`, or `16px` directly into a component, you have created future drift and you have failed the brand audit. Always use the token:
- CSS / WordPress: `var(--c-action-primary-bg)`, `var(--p-space-4)`.
- React: `tokens.color.action.primaryBg`, or the Tailwind class `bg-action` / `p-4` mapped to the token.

To change a value, edit `tokens.json`, then regenerate `tokens.css`, the React theme, and `theme.json`. Never edit a generated file by hand.

**Layer order (a token may only reference a layer below it):** primitive (`--p-*`) → semantic (`--c-*`) → component (`.mwc-*`).

---

## 1. COLOR SYSTEM (the part most likely to be gotten wrong)

### The oranges are role-based. Never pick an orange by how it looks. Pick it by its role.

| Role token | Hex | What it is for | Text/glyph on it |
|---|---|---|---|
| `--c-action-primary-bg` (orange-800) | `#CA4A0E` | **PRIMARY button fill (with glow) AND selected chip/control fill AND checkbox checked-fill.** The brand's signature deep CTA. | **WHITE `#FFFFFF`** (4.67:1, AA any size) |
| `--c-action-primary-bg-hover` (orange-600) | `#D35F1A` | **Primary button HOVER only.** The button deepens on interaction; the glow stays. Never a resting fill. | White (3.87:1, transient/large OK) |
| `--c-accent` (orange-500) | `#E8732A` | **Basic site orange** (from menswellnesscenters.com). Icons, dots, links on navy, the orange glow, focus ring, completed-step markers, required-field asterisk, eyebrows. **Accent only, never a button fill.** | n/a (on navy 6.17:1) |

**HARD RULE — the primary button fill is the DEEP orange `#CA4A0E` with WHITE text** (4.67:1, passes AA). Do not use the lighter accent `#E8732A` (or any light orange) as a button fill: white on it is only 3.04:1 and navy on it is busy. The accent orange is for icons, links, eyebrows, focus, and the glow only.

**The glow is part of the brand.** Primary buttons ship with `box-shadow: 0 4px 16px rgba(232,115,42,.40)` (`--p-shadow-cta`). The glow stays on hover.

### Navy and neutrals

| Token | Hex | Use |
|---|---|---|
| `--p-navy-900` | `#0B1029` | Canonical Midnight Navy. The only default dark background. Also the navy text color. |
| `--p-deep-navy` | `#122256` | Alternate brighter dark surface / secondary hero. Logo-approved background. White text 15.1:1. |
| `--p-near-black` | `#0D0807` | Max-contrast premium dark frame. Logo-approved background. White text 19.9:1. |
| `--p-cream-50` | `#F5F0EB` | Warm off-white. Light backgrounds and primary text on dark. |
| `--p-white` | `#FFFFFF` | Input fills, light cards, the white secondary CTA, strong text on dark. |

Do not stack all three darks on one screen. Pick one dominant dark; use a second only to separate zones.

### NO GRAY — absolute rule

There are **no neutral grays anywhere** in this system. Every muted text color, border, placeholder, and disabled state is navy or cream **at an opacity**, never a gray hex.

| Token | Value | Use |
|---|---|---|
| `--p-cream-70` | cream @ 70% | Muted/secondary text on dark (8.4:1) |
| `--p-cream-55` | cream @ 55% | Subtle/caption text on dark |
| `--p-cream-14` | cream @ 14% | Hairline border on dark |
| `--p-cream-06` | cream @ 6% | Faint fill on dark |
| `--p-navy-70` | navy @ 70% | Muted/secondary text on light (6.7:1); also the disabled label color |
| `--p-navy-55` | navy @ 55% | **Placeholder hint only** (4.15:1, exempt). Never a sole label, never informational text. |
| `--p-navy-25` | navy @ 25% | Input border / hairline on light |

If a value looks gray, it is a bug. Replace it with navy-at-opacity or cream-at-opacity. Pure black is allowed only inside `rgba()` shadow values.

### Other semantic colors
- Success: `--p-success-300` `#5DD68A` on dark, `--p-success-700` `#0B7A4B` on light. **All teal is banned** — if you see teal in an existing asset, it is a bug to fix.
- Error: `--p-error-300` `#FF8A8A` on dark, `--p-error-700` `#A7211C` on light.
- No multi-color gradients, no blue gradients. A single white backlight or a navy-to-navy darken is allowed.

---

## 2. TYPOGRAPHY

Three fonts, each with one job. **Bebas Neue is removed from every fallback chain** even though older assets referenced it.

| Token | Stack | Use |
|---|---|---|
| `--p-font-display` | Oswald, "Arial Narrow", sans-serif | Headlines, heroes. **UPPERCASE by default.** |
| `--p-font-marketing` | Montserrat, system-ui, sans-serif | Marketing body copy, paragraphs. |
| `--p-font-ui` | Inter, system-ui, sans-serif | App/form UI: labels, inputs, buttons, captions. |

- Form labels: uppercase Inter 700, 11px, 0.08em tracking. One label style everywhere.
- Button text: Inter 700, 16px, 0.06em tracking, sentence case (not uppercase).
- Body floor: 16px. Never below 12px for any text.
- Headline scale uses `clamp()` (see `tokens.css` `.mwc-display`/`.mwc-h1`/`.mwc-h2`).

---

## 3. CANONICAL COMPONENTS

There is exactly **one** of each. Do not invent variants.

- **Primary button** (`.mwc-btn`): deep `#CA4A0E` fill, white text, glow, 52px min height, 8px radius, sentence-case Inter 700. Hover deepens to `#D35F1A`. Focus = 3px accent-orange ring, 2px offset. Disabled = navy-25 fill + navy-70 text (reads intentionally off, not broken).
- **White secondary CTA** (`.mwc-btn--secondary`): white fill + navy text (18.7:1), no border, no glow. For navy/dark backgrounds where a second action is needed ("Apple or Outlook", "Get directions"). Hover → cream-50.
- **Ghost tertiary** (`.mwc-btn--ghost`): transparent + 1px cream-14 border + cream text. Dark surfaces only, low emphasis.
- **Deep button** (`.mwc-btn--deep`): `#CA4A0E` + white text. Only when white text on the CTA is unavoidable.
- **Text input** (`.mwc-input`): white fill, 2px navy-25 border, 8px radius, 56px tall, optional inline leading icon. Focus = orange border + orange ring. Error = `aria-invalid="true"` → error-700 border + message + icon (never color alone).
- **Selectable control** (`.mwc-selectable`): ONE component drives location chips, date chips, and time slots. Unselected = white/cream fill, navy/cream text, accent-orange icon. **Selected = solid deep `#CA4A0E` fill + WHITE text + white icon** (identical to the primary button). Toggle via `aria-pressed="true"` or `.is-selected`.
- **Checkbox** (`.mwc-checkbox`): 20px, 4px radius, `accent-color` = deep `#CA4A0E` so the white check holds 4.67:1. **Never pre-checked** (TCPA).
- **Card** (`.mwc-card`): 16px radius, 24px padding. Dark = navy + hairline + shadow. Light = white + navy-25 border + shadow-lg.

---

## 4. CRO RULES (conversion is non-negotiable)

- **Mobile-first, 390px viewport.** Evaluate every funnel at 390px first. The primary CTA must be visible without scrolling. A hero photo must NEVER push the form/bullets/CTA below the fold on mobile — use a background image or omit the photo. Sticky bottom CTA is the default.
- **Consult framing:** always a **60-minute, in-person visit at the local Men's Wellness Centers**. Never "15-minute call", "video call", "phone consult", or "telehealth visit".
- **CTA verbs:** Book, Schedule, Claim, Reserve. Never "Submit", "Get started", "Learn more".
- **Funnel forms:** 4 fields max (first name, last name, phone, ZIP or email). Phone is the priority capture; tap-to-call always present on mobile.
- **Local-vs-local:** name the city in headlines where it helps. Lead with physician-led, in-person, locally owned, transparent pricing, LegitScript certified. Do not name competitors.

---

## 5. COMPLIANCE GUARDRAILS

- **Terminology:** always "Men's Wellness Centers" (never "clinic", "practice", "med spa"). Members, not patients/clients/customers. Never the word "free" — use "no-cost visit". Never "guy/guys". **No em-dashes** in patient-facing copy.
- **LegitScript:** badge in the footer of every landing/service page. Use "physician-led", "licensed providers", "transparent pricing", "in-person appointment".
- **HIPAA-safe:** no real member names/photos/conditions without written authorization. Never collect PHI in funnel forms.
- **Ad-policy-safe phrasing:** "low testosterone" / "men's hormone health" (not "TRT" in ad headlines); "men's sexual health" / "ED treatment options"; "medical weight loss" / "metabolic health" (no GLP-1 brand names in ad copy). Treatments can be named on the destination page in clinical context.
- **Medical claims:** no "treats/cures/prevents", no outcome guarantees, no specific result numbers. Use "supports", "addresses", "may help", "is designed to".
- **SMS/email:** express opt-in checkbox, never pre-checked; STOP option in first message; CAN-SPAM address + unsubscribe in email.
- **Tagline:** "Finding Your Edge Over Age." (title case, period included).

---

## 6. ACCESSIBILITY (WCAG 2.2 AA, verified — do not regress)

| Pairing | Ratio | Result |
|---|---|---|
| White text on navy | 18.7:1 | AAA |
| Cream-70 muted on navy | 8.4:1 | AAA |
| Accent #E8732A text/link on navy | 6.17:1 | AA |
| **White text on primary button #CA4A0E** | **4.67:1** | **AA (any size)** |
| White text on hover button #D35F1A | 3.87:1 | AA (large/transient) |
| White text on deep button #CA4A0E | 4.67:1 | AA (any size) |
| Navy text on white secondary CTA | 18.7:1 | AAA |
| **White text on accent #E8732A (BANNED as button)** | **3.04:1** | **fail — accent is not a button fill** |
| Navy-70 muted on cream | 6.7:1 | AA |
| White on deep-navy #122256 | 15.1:1 | AAA |
| White on near-black #0D0807 | 19.9:1 | AAA |

Non-negotiables: visible 3px orange focus ring (2px offset) on every interactive element; 44px minimum tap target (buttons 52px tall, inputs 56px); 16px minimum body text; **color is never the only signal** (errors get icon + text; selected chips get fill + weight, not just color).

---

## 7. RALPH-LOOP AUDIT CHECKLIST

When running an autonomous QA/optimization loop, fail the iteration and patch if ANY of these are true:

1. A raw hex, px, or font literal appears in component code instead of a token reference.
2. The accent orange `#E8732A` (or any light orange) is used as a button/chip fill instead of the deep `#CA4A0E`. Button/chip fills must be `#CA4A0E` (+ white text); the accent is icons/links/eyebrows only.
3. The primary button or a selected chip is not deep `#CA4A0E` + white text, or is missing the glow on the primary button.
4. Any gray hex (e.g. `#9CA3AF`, `#B0ADA8`, `#6B7280`) appears anywhere — replace with navy/cream at opacity.
5. Any teal, blue gradient, or multi-color gradient appears.
6. Bebas Neue appears in a font stack.
7. A funnel hero pushes the CTA below the fold at 390px, or the CTA is missing above the fold.
8. Copy uses "clinic", "patients", "free", "guy/guys", or an em-dash in patient-facing text.
9. The consult is framed as anything other than a 60-minute in-person visit.
10. An interactive element is missing the orange focus ring, is under 44px tap target, or conveys state by color alone.
11. The LegitScript badge or required compliance disclosures are missing from a funnel/service page footer.
12. A checkbox is pre-checked, or SMS consent lacks express opt-in / STOP language.

Report each violation with the file, line, the rule number above, and the exact token-based fix. Then patch and re-run.

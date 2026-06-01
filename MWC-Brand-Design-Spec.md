# Men's Wellness Centers — Brand Design Specification

**Version 1.2.1 · Last updated 2026-05-31 · Owner: Men's Wellness Centers Operations**

**Changelog — 1.2.1:** The **selected chip/control fill is brightened** from deep `#CA4A0E` to bright **`#FF6B2C`** so it matches the primary button. The deep fill read brown as a large solid block. Because white text fails on the bright fill (2.84:1), the chip text flips to **navy `#0B1029`** (6.6:1, AA at any size). The checkbox checked-fill stays deep `#CA4A0E` since the white check glyph needs 4.67:1. Net effect: selected chips and the primary button are now the exact same orange.

**Changelog — 1.2.0:** The primary button is now the **bright `#FF6B2C` (orange-500) with its glow** — the brand's signature CTA. The critical rule: text on the bright orange button is **navy `#0B1029`** (6.6:1, AA at any size). White text on `#FF6B2C` is only 2.84:1 and is **banned** on any orange fill. Hover **deepens** to `#F2630C` (navy text). A **white secondary CTA** (white fill + navy text, 18.7:1) is added for dark/navy backgrounds, replacing the old navy-fill secondary. The deep `#CA4A0E` (orange-800) is retained for the rare button or chip that must carry white text (4.67:1) and remains the selected-chip fill. **Migration:** primary button fill `#CA4A0E` → `#FF6B2C` with navy text; hover → `#F2630C`; secondary button → white fill + navy text.

**Changelog — 1.1.0:** Hardened resting button to `#CA4A0E` (white text 4.67:1, AA any size); `#F2630C` demoted to hover; disabled text navy-55 → navy-70; placeholders hint-only.

This is the single source of truth for how every Men's Wellness Centers digital surface looks and behaves. It exists so that any builder, human or AI, produces an identical, on-brand, accessible result without guessing. If a builder ever has to make a visual judgment call, that is a defect in this spec, not in the builder. Report it and we fix the spec.

Companion files (same folder):
- `tokens.json` — machine-readable source of truth. Import this.
- `tokens.css` — CSS custom properties + ready-to-use component classes. Import this.

---

## 0. How to use this document

**The one rule that matters most:** Reference token names. Never hard-code a raw hex, px, or font value in component code. If you type `#CA4A0E` or `16px` directly into a component, you have created future drift. Use `var(--c-action-primary-bg)` and `var(--p-space-4)` instead. **Reference oranges by role token, never by shade** (`action` / `action-hover` / `accent` / `action-deep`), so the primary/hover/accent/deep roles can never be confused. Critical: text on the bright orange button is navy, never white.

**Layer order (a token may only reference a layer below it):**

1. **Primitive tokens** — raw values (`--p-navy-900`, `--p-space-4`). Context-free.
2. **Semantic tokens** — intent (`--c-surface-input`, `--c-action-primary-bg`). This is the decision layer.
3. **Component contracts** — full anatomy + every state, built only from semantic tokens.
4. **Patterns** — compositions of components (forms, scheduler).
5. **Accessibility** — verified contrast, focus, targets (cross-cutting).
6. **Governance** — naming, change process, the AI-builder preamble.

**For AI builders:** copy Section 9 (the AI Builder Preamble) into the top of any build prompt before you ask for a screen.

---

## 1. Brand decisions (the Decision Log)

Every visual choice below is locked. These resolve the inconsistencies found across the live WordPress, v2, v3, and current Lovable surfaces.

| # | Decision | Resolution |
|---|---|---|
| 1 | Canonical navy | `#0B1029` only. `#000033` and `#0A0D29` retired. `#122256` (deep navy) and `#0D0807` (near black) added as alternate dark surfaces and logo backgrounds. |
| 2 | Orange system | Role-based: primary button **and selected chip** = bright `#FF6B2C` with **navy text** (6.6:1); button glow + hover deepen to `#F2630C`; deep `#CA4A0E` reserved for the rare white-text button and the checkbox checked-fill; accent/glow/icon `#FF6B2C`. White text on orange is banned. |
| 3 | Typefaces | Oswald (display), Montserrat (marketing body), Inter (app/form UI). |
| 4 | Bebas Neue | Removed from all font stacks. |
| 5 | Input fields | One style: white fill, 2px navy-tint border, 8px radius, inline leading icon. |
| 6 | Form labels | One style: uppercase, Inter 700, 11px, 0.08em tracking. |
| 7 | Selectable controls | One component. Selected = solid bright `#FF6B2C` fill + **navy text** (6.6:1, AA any size), identical to the primary button. |
| 8 | Corner radius | 8px buttons/inputs, 16px cards. |
| 9 | Success state | `#5DD68A` on dark. All teal removed. |
| 10 | No gray | No neutral grays. Muted text/borders/placeholders/disabled = navy or cream at opacity. Every opacity combo audited for contrast (§8). |
| 11 | Accessibility | WCAG 2.2 AA, verified. |

**Amendments to the MWC Brand/CRO/Compliance skill** (this spec supersedes the older skill on these points; update the skill to match):
- CTA color rule changes from "always `#E8670A`" to "primary buttons and selected chips render bright `#FF6B2C` with **navy text** (6.6:1); the button adds glow and deepens to `#F2630C` on hover; deep `#CA4A0E` is for the rare white-text button and the checkbox checked-fill; `#FF6B2C` is also the accent/glow. White text on orange is banned."
- Add Inter as the app/UI font alongside Montserrat (marketing) and Oswald (display).
- Define one success color `#5DD68A`; remove the teal checkmark and badge on the booking confirmation and schedule screens.
- Strip Bebas Neue from every fallback chain.

---

## 2. Color system

### 2.1 Primitive palette

| Token | Value | Role |
|---|---|---|
| `--p-navy-900` | `#0B1029` | Canonical Midnight Navy. Dark page background. |
| `--p-navy-800` | `#161B3A` | Elevated dark surface. Use sparingly; prefer border+shadow. |
| `--p-navy-700` | `#1E244A` | Divider/border accent on dark. |
| `--p-deep-navy` | `#122256` | **NEW.** Alternate brighter navy from the logo system. A richer/brighter dark surface or secondary dark hero where `#0B1029` reads too flat. Logo-approved background. |
| `--p-near-black` | `#0D0807` | **NEW.** Max-contrast premium dark surface. Warmer than pure black. Use sparingly for high-end editorial/dark framing and as a logo background. |
| `--p-cream-50` | `#F5F0EB` | Warm off-white. Light backgrounds and primary text on dark. |
| `--p-white` | `#FFFFFF` | Input fills, light cards, strong text on dark. |
| `--p-ink-900` | `#0B1029` | Text on light surfaces (equals navy for unity). |
| `--p-orange-500` | `#FF6B2C` | **Primary button fill (resting) + accent.** Navy text **6.6:1 — AA at any size** (white text on it is banned, 2.84:1). Also icons, dots, links-on-navy, glow. The brand's signature CTA. |
| `--p-orange-600` | `#F2630C` | **Hover / active only.** The button deepens on interaction. Navy text 4.0:1 acceptable for this transient/large state. Glow stays. Never the resting fill. |
| `--p-orange-800` | `#CA4A0E` | **Deep / white-glyph fill.** For the rare button that must carry white text (4.67:1, AA any size) and the checkbox checked background (white check, 4.67:1). No longer the selected-chip fill. |
| `--p-orange-300` | `#FFE4CC` | Soft tint for badges/selected-chip tint on light. |
| `--p-success-300` | `#5DD68A` | Success on dark. Replaces all teal. |
| `--p-success-700` | `#0B7A4B` | Success on light. |
| `--p-error-300` | `#FF8A8A` | Error text on dark. |
| `--p-error-700` | `#A7211C` | Error text on light. |
| `--p-warning-400` | `#E8A23A` | Warning/notice. |

### 2.2 Gray-free muted/border/placeholder ramp

No neutral gray hexes exist in this system. Everything "muted" is navy or cream at an opacity step.

| Token | Value | Role | Verified |
|---|---|---|---|
| `--p-cream-70` | cream @ 70% | Muted/secondary text on dark | 8.4:1 on navy — AAA |
| `--p-cream-55` | cream @ 55% | Subtle/caption text on dark | passes |
| `--p-cream-14` | cream @ 14% | Hairline border on dark | decorative |
| `--p-cream-06` | cream @ 6% | Faint fill (unselected chip) on dark | decorative |
| `--p-navy-70` | navy @ 70% | Muted/secondary text on light | 6.7:1 on cream — AA |
| `--p-navy-55` | navy @ 55% | Placeholder text on white | 4.2:1 (placeholders exempt) |
| `--p-navy-25` | navy @ 25% | Input border / hairline on light | decorative |

### 2.3 Semantic color tokens

| Token | Maps to | Use |
|---|---|---|
| `--c-surface-page-dark` | navy-900 | Dark page bg |
| `--c-surface-page-light` | cream-50 | Light page bg |
| `--c-surface-card-dark` | navy-900 | Dark card (elevate via border+shadow, not a 2nd fill) |
| `--c-surface-card-light` | white | Light card |
| `--c-surface-input` | white | **Input fill: always white** |
| `--c-surface-selected` | orange-500 | Selected chip/control (bright #FF6B2C, navy text 6.6:1) |
| `--c-text-on-dark` | cream-50 | Default text on dark |
| `--c-text-on-dark-strong` | white | High-emphasis text on dark |
| `--c-text-on-dark-muted` | cream-70 | Secondary text on dark |
| `--c-text-on-light` | ink-900 | Text on light |
| `--c-text-on-light-muted` | navy-70 | Secondary text on light |
| `--c-text-placeholder` | navy-55 | Placeholder |
| `--c-text-on-action` | ink-900 | Navy text on the bright orange primary button (6.6:1) |
| `--c-text-on-action-deep` | white | White text on the deep #CA4A0E button/chip (4.67:1) |
| `--c-text-link-on-dark` | orange-500 | Links on navy |
| `--c-action-primary-bg` | orange-500 | Primary button fill (#FF6B2C, navy text 6.6:1) |
| `--c-action-primary-bg-hover` | orange-600 | Hover deepen (#F2630C, navy text) |
| `--c-action-primary-deep-bg` | orange-800 | Deep white-text button fill (#CA4A0E) |
| `--c-action-primary-deep-fg` | white | White text on the deep button |
| `--c-action-secondary-bg` | white | White secondary CTA fill (navy text 18.7:1) |
| `--c-action-secondary-fg` | ink-900 | Navy text on the white secondary CTA |
| `--c-action-primary-glow` | shadow-cta | Button glow |
| `--c-border-input` | navy-25 | Input border (resting) |
| `--c-border-input-focus` | orange-500 | Input border (focus) |
| `--c-border-input-error` | error-700 | Input border (error) |
| `--c-border-on-dark` | cream-14 | Hairline on dark |
| `--c-accent` | orange-500 | Icons, dots, highlights |
| `--c-focus-ring-color` | orange-500 | Focus ring |

### 2.4 Color usage rules

- **Orange is earned.** Bright `#FF6B2C` with its glow for primary buttons, carrying **navy text** (6.6:1); the button **deepens to `#F2630C`** on hover. `#FF6B2C` is also the accent for icons, dots, the active state dot under a date, and links on navy. Deep `#CA4A0E` is reserved for the rare white-text button and the checkbox checked-fill. Selected chips use the same bright `#FF6B2C` + navy text as the primary button. Never fill a body section in orange except the one approved full-bleed orange CTA band (see Patterns 7.6). White text on any orange fill is banned.
- **One orange per element.** Never orange text on an orange button.
- **No teal, anywhere.** Success is `#5DD68A`. If you see teal in any existing asset, it is a bug to fix.
- **No gray.** If a value looks gray, it must be navy or cream at opacity. Black is allowed only inside shadow rgba.
- **No multi-color gradients, no blue gradients.** A single white backlight or a navy-to-navy darken is allowed.
- **Dark-surface hierarchy.** `#0B1029` is still the default dark page background. Reach for `--p-deep-navy` (#122256) when you want a brighter, richer dark panel or secondary hero, and `--p-near-black` (#0D0807) for a premium, max-contrast dark frame. Do not stack all three on one screen; pick one dominant dark and use a second only for clear contrast between zones. These two are also the approved logo backgrounds.

---

## 3. Typography

Three typefaces, three jobs. Load all three; never substitute.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

| Family | Token | Job | Casing |
|---|---|---|---|
| **Oswald** | `--p-font-display` | Headlines, display, eyebrows, big numbers | UPPERCASE |
| **Montserrat** | `--p-font-marketing` | Body copy on landing/content pages | Sentence |
| **Inter** | `--p-font-ui` | App, forms, buttons, labels, UI chrome | Sentence (labels uppercase) |

**Fallback stacks (no Bebas Neue):**
- Display: `"Oswald", "Arial Narrow", sans-serif`
- Marketing: `"Montserrat", system-ui, sans-serif`
- UI: `"Inter", system-ui, sans-serif`

### 3.1 Type scale

| Style | Family | Size | Weight | Line | Tracking | Case |
|---|---|---|---|---|---|---|
| `display` | Oswald | clamp(40, 8vw, 96)px | 700 | 0.95 | -0.01em | UPPER |
| `h1` | Oswald | clamp(32, 5vw, 56)px | 700 | 1.0 | 0 | UPPER |
| `h2` | Oswald | clamp(24, 3vw, 36)px | 700 | 1.05 | 0.01em | UPPER |
| `h3` | Oswald | 20px | 700 | 1.1 | 0.02em | UPPER |
| `eyebrow` | Inter | 12px | 700 | 1.2 | 0.12em | UPPER |
| `body-lg` | Montserrat | 18px | 400 | 1.6 | 0 | sentence |
| `body` | Montserrat | 16px | 400 | 1.6 | 0 | sentence |
| `body-ui` | Inter | 16px | 400 | 1.5 | 0 | sentence |
| `label` | Inter | 11px | 700 | 1.2 | 0.08em | UPPER |
| `button` | Inter | 16px | 700 | 1.0 | 0.06em | sentence |
| `caption` | Inter | 13px | 400 | 1.45 | 0 | sentence |

### 3.2 Type rules

- Headlines are Oswald, uppercase, always. Never sentence-case a headline.
- Body that sits in marketing pages is Montserrat. Body inside the app/forms is Inter. When unsure, app context = Inter.
- Form labels are always the `label` style (uppercase Inter 700, 11px). This is the rule that kills the "FIRST NAME vs Email" inconsistency seen in the legacy intake form.
- Button text is sentence case ("Book My No-Cost Consultation"), not uppercase, weight 700.
- Never letter-space body copy. Tracking is only for display, eyebrow, label, button.

---

## 4. Spacing, radius, elevation, motion

### 4.1 Spacing (4px base)

`--p-space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 20 · `-6` 24 · `-8` 32 · `-10` 40 · `-12` 48 · `-16` 64 · `-20` 80 · `-24` 96.

Use the scale. Do not invent 13px or 18px gaps. Default rhythm: 8 inside controls, 16 between fields, 24 inside cards, 48–64 between sections.

### 4.2 Radius

| Token | Value | Use |
|---|---|---|
| `--p-radius-sm` | 4px | Chips, badges, small controls |
| `--p-radius-md` | 8px | **Buttons, inputs, selectables (canonical control radius)** |
| `--p-radius-lg` | 16px | **Cards, panels, modals (canonical card radius)** |
| `--p-radius-pill` | 999px | Pills/tags only, never default buttons |

### 4.3 Elevation (shadow)

`--p-shadow-sm/md/lg/xl` for neutral elevation. `--p-shadow-cta` (`0 4px 16px rgba(255,107,44,.40)`) is the orange CTA glow, used only on primary buttons and the active scheduler date.

**Dark cards do not get a lighter fill.** They use `--c-surface-card-dark` (same navy) + a `--c-border-on-dark` hairline + a shadow to read as elevated. This is why we keep one navy.

### 4.4 Motion

`--p-motion-fast` 0.12s (presses), `--p-motion-base` 0.20s (hover/color), `--p-motion-slow` 0.35s (reveals). Respect `prefers-reduced-motion`: disable transforms and large transitions.

---

## 5. Component contracts

Every component lists every state with exact tokens. AI builders: do not infer a hover or error look from a screenshot; use these.

### 5.1 Primary button

Anatomy: inline-flex, centered, optional trailing icon. Class `.mwc-btn`.

| Property | Token |
|---|---|
| Background | `--c-action-primary-bg` (#FF6B2C, bright, resting) |
| Text | `--c-text-on-action` (navy #0B1029, 6.6:1), `button` type style |
| Radius | `--p-radius-md` (8px) |
| Min height | 52px (44px min tap target + padding) |
| Padding | 14px 24px |
| Shadow | `--c-action-primary-glow` |

States:
- **Hover:** background → `--c-action-primary-bg-hover` (#F2630C, **deeper** lift). Glow stays. Text stays navy.
- **Minimum label size (HARD RULE):** orange button labels never render below 16px/700. On the bright `#FF6B2C` fill, text is **navy** (6.6:1, AA any size); on the deep `#CA4A0E` button, text is **white** (4.67:1, AA any size). White text on `#FF6B2C` is banned (2.84:1).
- **Focus-visible:** 3px orange outline, 2px offset.
- **Active:** translateY(1px), reduce glow.
- **Disabled:** background `--c-action-disabled-bg` (navy-25), text navy-70 (reads as intentionally-off, not broken), no shadow, `cursor: not-allowed`.
- **Loading:** show spinner, keep width, set `aria-busy="true"`, disable.

Copy: verbs **Book, Schedule, Claim, Reserve**. Never "Submit/Get started/Learn more".

### 5.2 Secondary button

`.mwc-btn--secondary`. **White fill** (`--c-action-secondary-bg`), **navy text** (`--c-action-secondary-fg`, 18.7:1), no border, no glow. Hover → cream-50. Same size/radius as primary. This is the alt-background CTA: use it on navy/dark surfaces where a white button reads as the clear secondary action ("Apple or Outlook", "Get directions", non-primary actions). A **ghost tertiary** variant (`.mwc-btn--ghost`: transparent fill, cream text, 1px cream-14 border) is available for low-emphasis actions on dark surfaces only.

### 5.3 Text input (the one canonical input)

`.mwc-input`. This single definition replaces the three legacy looks.

| Property | Token / value |
|---|---|
| Background | `--c-surface-input` (white, always) |
| Text | `--c-text-on-input` (ink-900), `body-ui` 16px (16px prevents iOS zoom) |
| Placeholder | `--c-text-placeholder` (navy-55) |
| Border | 2px solid `--c-border-input` (navy-25) |
| Radius | `--p-radius-md` (8px) |
| Height | 56px |
| Padding | 0 16px; with leading icon `0 16px 0 44px` |
| Icon | `--c-text-placeholder`, 20px, left, vertically centered |

States:
- **Focus:** border → `--c-border-input-focus` (orange-500) + 3px orange ring.
- **Error:** border → `--c-border-input-error` (error-700); helper text below in `--c-error-on-light`, 13px Inter; set `aria-invalid="true"` and link `aria-describedby` to the message.
- **Disabled:** background navy-25 tint, text navy-55.
- **Filled valid:** no special treatment (avoid noisy green per-field).

Label: always `.mwc-form-label`. On dark cards use `--mwc-form-label--dark` (cream-70); on light use `--light` (navy-70). Required marker is an `--c-accent` asterisk after the label text.

### 5.4 Selectable control (location chips, date chips, time slots — unified)

`.mwc-selectable`. One component, two contexts (on-dark / on-light), one selected state.

| State | On dark | On light |
|---|---|---|
| Unselected bg | `--p-cream-06` | white |
| Unselected border | 1px `--c-border-on-dark` | 1px `--c-border-card-light` |
| Unselected text | cream-50 | ink-900 |
| Icon (pin/clock) | `--c-accent` (orange-500) | `--c-accent` |
| **Selected bg** | **`--c-surface-selected` (#FF6B2C, bright)** | **same** |
| **Selected text** | **navy (`--c-text-on-action`, 6.6:1)** | **same** |
| Selected icon | navy | navy |
| Radius | 8px | 8px |
| Min tap target | 44px height | 44px |

States: hover = subtle bg lift + border → cream-14/navy-25 darken; focus-visible = orange ring; selected uses `aria-pressed="true"` or `aria-selected`. The "available" dot under a date is `--c-accent`; "FULL"/"CLOSED" days are disabled (navy-70 text, no border emphasis).

### 5.5 Checkbox (SMS/TCPA consent)

20px box, 4px radius, 2px `--c-border-on-dark` border, checked fill `--c-action-primary-deep-bg` (deep #CA4A0E) with a white check (4.67:1). The deep orange is used here rather than the bright primary fill because a white check on `#FF6B2C` is only 2.84:1. Never pre-checked (TCPA). The consent label is `caption` style; "Privacy Policy" link in `--c-accent`.

### 5.6 Card / panel

`.mwc-card`. Radius 16px, padding 24px. Dark variant: navy + hairline + shadow. Light variant: white + 1px navy-25 border + `--p-shadow-lg`. Section eyebrow (e.g., "YOUR APPOINTMENT") in `eyebrow` style, `--c-accent` or muted, above the card title.

### 5.7 Validation message

Inline, below the field, 13px Inter, `--c-error-on-light` (light) or `--c-error-on-dark` (dark), with a 16px alert icon. Announce via `role="alert"`.

### 5.8 Sticky CTA bar (mobile)

Fixed bottom, navy background with top hairline (`--c-border-on-dark`), one full-width primary button inside `--p-space-4` padding, safe-area inset respected. Always present on funnel pages.

### 5.9 Badge row (trust / compliance)

LegitScript, HIPAA, Google Healthcare badges rendered as supplied SVG/PNG, never recolored. Sit on navy in the footer, evenly spaced, height ~40px.

### 5.10 Success confirmation mark

The booking-confirmed checkmark and "Appointment confirmed" label use `--c-success-on-dark` (#5DD68A). **This explicitly replaces the teal currently shipping on that screen.**

---

## 6. Iconography

- Style: line icons, ~1.75–2px stroke, rounded joins (Lucide / Phosphor-regular recommended). One library across the product; do not mix sets.
- Default icon color on dark: cream-70. Accent/active icons: `--c-accent` (orange-500). Icons on orange buttons: white.
- Functional sizes: 16 (inline), 20 (inputs/buttons), 24 (section). Never scale a 16px icon up; pick the right size.
- No medical-cliché icons as decoration (stethoscope, clipboard, lab coat) per brand rules. The blood-drop, calendar, and protocol icons used on the confirmation page are approved.

---

## 7. Patterns (composition)

### 7.1 Funnel landing page (mobile order)
Sticky top (logo + city + phone) → Oswald uppercase headline → Montserrat subhead naming the differentiator → primary CTA + 4-field form above the fold → trust strip → three proof bullets (60-minute in-person, in-clinic labs, physician-led) → how it works (3 steps) → written member quotes (no before/after) → FAQ → secondary CTA + form → footer with LegitScript badge + disclosures. Hero photo must never push the form below the fold on a 390px viewport; use a background image or omit.

### 7.2 Lead-capture form
Max 4 fields: first name, last name, phone, ZIP-or-email. Phone is priority; tap-to-call always present on mobile. Location selection uses `.mwc-selectable`. TCPA checkbox (5.5), never pre-checked. Button: "Book My No-Cost Consultation". Confirmation copy: "Got it. A Men's Wellness Centers team member will call you within one business hour to schedule your 60-minute in-person consultation."

### 7.3 Multi-step intake
White card on navy page. Labels uppercase (5.3), one input style (5.3), required asterisk in accent. Step nav: PREV (secondary) / NEXT (primary) as a footer bar; the legacy full-bleed orange footer is replaced by the standard button pair to keep one button system. Progress indicator uses `--c-accent` for completed steps.

### 7.4 Scheduler
Light card. Week strip = `.mwc-selectable` date chips; selected day = solid bright orange (#FF6B2C) with navy text. Time slots = `.mwc-selectable` grid grouped Morning/Afternoon/Evening (eyebrow labels). "Next available" line uses an `--c-accent` dot. Help bar at bottom is a secondary surface with a tap-to-call link.

### 7.5 Booking confirmation
Navy page, white detail card, success mark in `#5DD68A` (not teal). "Add to Google Calendar" = bright orange primary (navy text); "Apple or Outlook" = white secondary CTA (navy text) since the page is dark. Numbered "before you arrive" list uses orange numerals. Email-reminder input follows 5.3.

### 7.6 Full-bleed orange CTA band
The single approved use of `#FF6B2C`/`#CA4A0E` as a section fill. White Oswald headline, white Montserrat body. The CTA inside this band is a **white-fill button with navy text** (the secondary CTA pattern) since a bright-orange button on an orange band would vanish; a ghost white-outline button is the lower-emphasis alternative. Use at most once per page.

---

## 8. Accessibility (WCAG 2.2 AA, verified)

All values computed, not asserted.

| Pairing | Ratio | Result |
|---|---|---|
| White text on navy | 18.7:1 | AAA |
| Cream display on navy | 16.6:1 | AAA |
| cream-70 muted on navy | 8.4:1 | AAA |
| Accent orange #FF6B2C text/link on navy | 6.6:1 | AA |
| Success #5DD68A on navy | 10.2:1 | AAA |
| Error #FF8A8A on navy | 8.3:1 | AAA |
| Navy text on primary button #FF6B2C | 6.6:1 | **AA (any size)** |
| Navy text on hover button #F2630C | 4.0:1 | AA (large, transient hover) |
| White text on deep button #CA4A0E | 4.67:1 | **AA (any size)** |
| Navy text on white secondary CTA | 18.7:1 | AAA |
| White text on primary button #FF6B2C (BANNED) | 2.84:1 | fail — never use |
| cream-55 subtle text on navy | 5.6:1 | AA |
| navy-70 muted text on white | 7.1:1 | AAA |
| navy-55 placeholder on white (hint only, exempt) | 4.2:1 | exempt |
| Disabled text navy-70 on navy-25 fill | 2.5:1 | disabled (exempt) |
| Input text on white | 18.7:1 | AAA |
| Error #A7211C on white | 7.3:1 | AAA |
| Navy text on cream | 16.6:1 | AAA |
| navy-70 muted on cream | 6.7:1 | AA |
| White text on deep navy #122256 | 15.1:1 | AAA |
| White text on near black #0D0807 | 19.9:1 | AAA |
| Cream-50 on deep navy #122256 | 13.4:1 | AAA |
| Cream-50 on near black #0D0807 | 17.6:1 | AAA |
| Accent orange #FF6B2C on near black | 7.0:1 | AA |
| Deep navy #122256 / near black on white | 15.1:1 / 19.9:1 | AAA |

Rules:
- Focus is always visible: 3px orange ring, 2px offset, on every interactive element. Never remove outlines without a replacement.
- Minimum tap target 44×44px (buttons 52px tall, inputs 56px, selectables ≥44px).
- Body text 16px minimum (also prevents iOS input zoom).
- Color is never the only signal: errors get an icon + text; selected chips get fill + text-weight, not just color.
- Every input has a programmatic `<label>`; icons that convey meaning have `aria-label`.
- Honor `prefers-reduced-motion`.

---

## 9. AI Builder Preamble (paste this at the top of any build prompt)

```
You are building a screen for Men's Wellness Centers. Follow these rules exactly.

TOKENS: Import tokens.css and reference CSS variables only. Never hard-code hex or px.
COLOR: Navy #0B1029 is the only dark bg. Primary buttons use var(--c-action-primary-bg) bright #FF6B2C
  with var(--c-text-on-action) NAVY text (6.6:1) and the orange glow; hover deepens to
  var(--c-action-primary-bg-hover) #F2630C, navy text. Secondary CTA = white fill + navy text
  (var(--c-action-secondary-bg)/--c-action-secondary-fg) for dark backgrounds. Deep #CA4A0E
  (var(--c-action-primary-deep-bg) + white text) is only for the rare white-text button
  and the checkbox check. White text on any orange fill is BANNED (2.84:1). Accent var(--c-accent) #FF6B2C is
  for icons/dots/links-on-navy/glow.
NO TEAL anywhere. Success = #5DD68A.
NO GRAY anywhere. Muted text/borders/placeholders = navy or cream at opacity tokens
  (cream-70, navy-70, navy-55, navy-25, cream-14). Black only inside shadow rgba.
TYPE: Oswald (headlines, UPPERCASE), Montserrat (marketing body), Inter (app/forms/UI).
  No Bebas Neue. Form labels = uppercase Inter 700 11px (.mwc-form-label). Buttons sentence case.
RADIUS: 8px buttons/inputs, 16px cards.
INPUTS: one style only — white fill, 2px navy-25 border, 8px radius, leading icon, 56px tall
  (.mwc-input). Focus = orange border + orange ring. Error = error-700 border + message + icon.
SELECTABLE (location/date/time): one component (.mwc-selectable). Selected = solid bright #FF6B2C fill,
  NAVY text (6.6:1), identical to the primary button. Unselected = navy/bordered with orange icon.
A11Y: WCAG 2.2 AA. Visible orange focus ring on everything. 44px min tap targets. 16px min body.
  Color never the only signal.
COPY/BRAND: "Men's Wellness Centers" (not clinic). "members" (not patients). "no-cost consultation"
  (never "free"). No "guy/guys". No em-dashes. 60-minute in-person consultation framing.
  CTA verbs: Book/Schedule/Claim/Reserve. LegitScript badge + disclosures in footer.
Build mobile-first at 390px. Primary CTA visible without scroll on funnel pages.
```

---

## 10. Governance

- **Source of truth is `tokens.json`.** `tokens.css` and this document are generated from it. Change a value there first.
- **No raw values in component code.** Reviews reject hard-coded hex/px. Lint rule recommended: flag hex codes outside `tokens.css`.
- **Adding a token:** add the primitive, map a semantic token to it, then use the semantic token in components. Never skip the semantic layer.
- **Versioning:** semver in `$meta.version`. Breaking color/type changes bump major. Log changes in a CHANGELOG.
- **Deprecation:** retired values (e.g., `#000033`, teal, Bebas Neue, gray hexes) must not reappear. If found in an asset, it is a defect.
- **Source images:** badges (LegitScript/HIPAA/Google Healthcare) are supplied assets, never recolored or regenerated.

---

## 11. Logo

The Men's Wellness Centers mark is the **"men's WELLNESS CENTERS" wordmark** plus the **notched "M" bug**. Both are single-fill, flat marks. The asset library lives in `logos/` next to this spec; vector sources are in the brand asset package.

### 11.1 Asset inventory (`logos/`)

Each mark is provided as a transparent PNG in every approved fill, plus on-background composites.

| Mark | File pattern | Provided fills |
|---|---|---|
| Wordmark | `wordmark_<fill>_transparent.png` | white, midnight-navy, deep-navy, near-black, accent-orange (#FF6B2C, bug only) |
| Wordmark on bg | `wordmark_<fill>_on_<bg>.png` | white-on-{midnight-navy, deep-navy, near-black}, {midnight-navy, deep-navy, near-black}-on-white, accent-orange-on-near-black |
| M bug | `m_icon_<fill>_transparent.png` | white, midnight-navy, deep-navy, near-black, accent-orange |
| M bug on bg | `m_icon_<fill>_on_<bg>.png` | same pairings as the wordmark |

Vector sources (`wordmark_navy.svg`, `m_icon_navy.svg`, plus white/black variants, and `icon.svg`) are single-fill SVGs; recolor by swapping the fill value, then export.

### 11.2 Recolor rules

- The mark is **monochrome**. It takes exactly one approved fill at a time: `--c-logo-white`, `--c-logo-midnight-navy`, `--c-logo-deep-navy`, `--c-logo-near-black`, or `--c-logo-accent` (orange — **bug only**).
- **No gray fill.** This obeys the no-gray rule.
- **Accent orange is bug-only.** Never fill the full wordmark in orange; orange on the wordmark fails legibility and brand hierarchy. Orange is reserved for an accent treatment of the M bug on a dark background.
- Recolor only to the values above — no gradients, photos, textures, or off-palette hues.

### 11.3 Clear space and minimum size

- **Clear space:** keep a margin equal to the height of the M bug on all four sides. Nothing (text, edges, other logos) enters that zone.
- **Minimum size — wordmark:** 160px wide on screen, 1.25in / 32mm wide in print (below this the "WELLNESS CENTERS" lockup loses legibility).
- **Minimum size — M bug:** 24px on screen, 0.25in / 6mm in print.

### 11.4 Approved color-on-background pairings (verified)

| Fill | Background | Contrast | Result |
|---|---|---|---|
| White | Midnight Navy `#0B1029` | 18.7:1 | AAA · primary lockup on dark |
| White | Deep Navy `#122256` | 15.1:1 | AAA |
| White | Near Black `#0D0807` | 19.9:1 | AAA |
| Midnight Navy | White | 18.7:1 | AAA · primary lockup on light |
| Deep Navy `#122256` | White | 15.1:1 | AAA |
| Near Black `#0D0807` | White | 19.9:1 | AAA |
| Accent Orange `#FF6B2C` (bug only) | Near Black `#0D0807` | 7.0:1 | AA |

### 11.5 Do / Don't

**Do:** use the primary lockup (white on midnight navy, or midnight navy on white); keep the bug and wordmark at supplied proportions; give the mark its full clear space; pick a single approved fill per placement.

**Don't:** recolor to gray or any off-palette hue; fill the full wordmark in orange; stretch, skew, rotate, or re-space the letters; add drop shadows, bevels, glows, or outlines; place the mark on a busy photo or any background under 4.5:1 contrast; rebuild the mark from a screenshot instead of using the supplied asset.

---

*End of specification. Companion machine-readable files: `tokens.json`, `tokens.css`. Logo assets: `logos/`.*

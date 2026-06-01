# Men's Wellness Centers — React Integration Guide (v1.2.1)

This package gives OpenClaw a typed, brand-locked React layer for Men's Wellness Centers. Everything resolves to the single source of truth in `../tokens.json`. **Never hard-code a raw hex or pixel value in a component.** Reference the token object (`theme.ts`) or the Tailwind utilities mapped from it (`tailwind.config.ts`).

---

## 0. The non-negotiable color law (read first)

- **Primary button = deep `#CA4A0E` (orange-800) + glow, with WHITE text** (4.67:1, passes AA). Hover deepens to `#D35F1A` (orange-600).
- **Selected chips / options = the same deep `#CA4A0E` fill + WHITE text + white icon.** Identical to the primary button.
- **Accent = basic site orange `#E8732A`** (from menswellnesscenters.com): icons, links on navy, eyebrows, focus ring, glow. Never a button fill (white on it is 3.04:1).
- **Deep `#CA4A0E` (orange-800) carries WHITE text.** It is used only for the rare white-text orange button (`variant="deep"`) and the **checkbox checked fill** (white check = 4.67:1).
- **White secondary CTA** = white fill + navy text, for dark/navy backgrounds (`variant="secondary"`).

- **NO GRAY.** Every muted text, border, placeholder, and disabled state is navy or cream at opacity. Never `#ccc`, `#e5e7eb`, `#9ca3af`, `gray-*`, `slate-*`, `zinc-*`, `neutral-*`.
- Fonts: **Oswald** (display/UPPERCASE), **Montserrat** (marketing body), **Inter** (app/form UI). **No Bebas Neue.** Success `#5DD68A` (no teal anywhere).

---

## 1. What's in this folder

```
react/
  theme.ts                 # canonical token object (tokens) + inline-style helpers (mwc) + MwcTokens type
  tailwind.config.ts       # maps tokens -> Tailwind utilities (bg-action, text-on-action, shadow-cta, ...)
  components/
    Button.tsx             # primary / secondary / deep / ghost
    Input.tsx              # 56px field, orange focus ring, orange required asterisk
    Selectable.tsx         # chip/option; SELECTED = deep #CA4A0E + white text
    Checkbox.tsx           # checked fill = deep #CA4A0E + white check (accent-color)
    Card.tsx               # light (white) / dark (navy) surfaces, 16px radius
    index.ts               # barrel export (components + tokens)
  examples/
    ConsultForm.tsx        # above-the-fold funnel form, all rules applied
  README-react.md          # this file
```

Recommended install path inside the app: copy `theme.ts` + `components/` to `src/brand/`, and merge `tailwind.config.ts` into the project's Tailwind config.

---

## 2. Wiring it up

### Step 1 — Fonts

Load the three families once (in `index.html` head, or via the framework's font loader):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

### Step 2 — Tailwind config

Merge the `theme.extend` block from `tailwind.config.ts` into the app's config, and make sure `content` covers your component files. The key utilities you will write:

| Utility | Resolves to | Use for |
|---|---|---|
| `bg-action` | `#CA4A0E` | primary button fill, selected chip |
| `hover:bg-action-hover` | `#D35F1A` | primary button hover |
| `text-on-action` | `#FFFFFF` (white) | **the only** text color on the deep orange button (4.67:1) |
| `bg-action-deep` / `text-on-action-deep` | `#CA4A0E` / `#FFFFFF` | alias of the primary deep-orange + white button |
| `bg-surface-selected` | `#CA4A0E` | selected chip fill |
| `text-accent` / `bg-accent` | `#E8732A` | icons, links on navy, asterisk, dots, eyebrows |
| `shadow-cta` | orange glow | primary button / selected chip glow |
| `font-display` / `font-marketing` / `font-ui` | Oswald / Montserrat / Inter | headlines / marketing / UI |
| `bg-surface-dark` / `bg-surface-light` | `#0B1029` / `#F5F0EB` | page backgrounds |
| `border-border-input` / `border-border-on-dark` | navy-25 / cream-14 | hairlines (never gray) |

### Step 3 (recommended) — single-source via CSS variables

If you already ship `../css/tokens.css` globally, point the Tailwind color values at the CSS vars (see the commented OPTION block at the bottom of `tailwind.config.ts`). Then a single edit to `tokens.css` flows to both plain CSS and Tailwind. Example:

```ts
action: { DEFAULT: "var(--c-action-primary-bg)", hover: "var(--c-action-primary-bg-hover)" },
"on-action": "var(--c-text-on-action)",
```

---

## 3. Using the components

```tsx
import { Button, Input, Selectable, Checkbox, Card } from "@/brand/components";

// Primary CTA — deep orange + white text + glow (default variant)
<Button>Book Your No-Cost Visit</Button>

// White secondary CTA on a navy hero
<Button variant="secondary">Call Our Richmond Center</Button>

// Rare white-text orange button (only when explicitly required on a light surface)
<Button variant="deep">Reserve My 60-Minute Visit</Button>

// Ghost tertiary on dark
<Button variant="ghost">See Pricing</Button>

// Selected chip = deep #CA4A0E + white text (matches primary button)
const [plan, setPlan] = useState("trt");
<Selectable selected={plan === "trt"} onClick={() => setPlan("trt")}>TRT</Selectable>
<Selectable selected={plan === "ed"} onClick={() => setPlan("ed")}>ED</Selectable>

// Field with orange focus ring + orange required asterisk
<Input name="phone" type="tel" label="Phone" required />

// Express SMS opt-in (unchecked by default; checked fill = deep orange + white check)
<Checkbox name="sms" label="Reply STOP to opt out. Msg & data rates may apply." />

<Card tone="dark">...navy surface...</Card>
```

See `examples/ConsultForm.tsx` for the full above-the-fold funnel form with all rules applied.

### Inline styles (when not using Tailwind)

`theme.ts` also exports `tokens` (the full semantic object) and `mwc` (ready-made style objects):

```tsx
import { tokens, mwc } from "@/brand/theme";

<button style={mwc.btnPrimary}>Book Now</button>
<div style={{ background: tokens.color.surface.pageDark, color: tokens.color.text.onDark }} />
```

---

## 4. Copy rules baked into components (keep them when you pass children)

- Business name in full: **Men's Wellness Centers**. Never "clinic".
- **members**, never "patients" in marketing copy.
- Never the word **"free"** — use **"no-cost visit"**.
- Never **"guy/guys"**. Never **em-dashes (—)** in patient-facing copy.
- CTA verbs: **Book / Schedule / Claim / Reserve**. Frame the consult as **60-minute, in-person**.
- Tagline: **Finding Your Edge Over Age.**

---

## 5. Ralph-loop notes (for openclaw-ralph-optimizer)

When OpenClaw runs an autonomous optimization pass over this React layer, treat these as **invariants that must survive every refactor** (add them as assertions in the test harness):

1. No component uses the accent orange `#E8732A` (or any light orange) as a button/chip fill. Button/chip fills must be the deep `#CA4A0E` (`bg-action` / `bg-surface-selected`). The accent is icons/links/eyebrows/focus only.
2. No raw gray hex or Tailwind gray scales (`gray-`, `slate-`, `zinc-`, `neutral-`, `#9ca3af`, `#e5e7eb`, `#ccc`). Borders/muted text must be navy/cream at opacity.
3. `Button` default variant renders `bg-action text-on-action shadow-cta`.
4. `Selectable` selected renders `bg-surface-selected text-on-action` (deep orange + white), matching the primary button.
5. `Checkbox` checked uses `accent-color:#CA4A0E` (deep) — the one sanctioned deep-orange fill.
6. No `Bebas`, no teal, no blue multi-color gradients.
7. Primary CTA is reachable above the fold at 390px width (mobile-first).
8. Minimum control heights preserved: buttons 52px, inputs 56px.

A reduction in lines / bundle size is welcome **only** if all eight invariants still hold and the visual output is unchanged. Reference the 12-point audit in `../openclaw.md`.

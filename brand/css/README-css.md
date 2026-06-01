# Men's Wellness Centers — CSS Usage Guide (verbose)

**Version 1.2.1 · Pair with `openclaw.md` (the brand law) and `tokens.css` (the values).**

This guide tells OpenClaw exactly how to consume the CSS in any stack: a raw HTML/CSS page, a WordPress theme, a Lovable export, or a React app that imports a global stylesheet. The literal values live in [`tokens.css`](./tokens.css). This file explains how to use them so you never have to guess.

---

## 1. How the cascade is built

There are three layers and they only ever reference downward:

```
PRIMITIVE   --p-*   raw values (the only place a hex/px literal is allowed to live)
   │
SEMANTIC    --c-*   intent ("the primary action background"), references --p-*
   │
COMPONENT   .mwc-*  finished classes, reference --c-* (and sometimes --p-* for spacing)
```

**You write code against `--c-*` and `.mwc-*`. You almost never touch `--p-*` directly** (the exception is spacing/radius primitives like `--p-space-4`, which are fine to use because they have no semantic alias). If you find yourself wanting a raw hex, stop — there is a `--c-*` token for it.

---

## 2. Loading the stylesheet and fonts

```html
<!-- 1) Fonts (self-host in production; CDN shown for clarity) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- 2) Tokens + components (single file, load once, globally) -->
<link rel="stylesheet" href="/assets/css/tokens.css">
```

`tokens.css` is safe to load once at the document root. It defines `:root` custom properties plus the `.mwc-*` component classes and `.mwc-*` typography helpers. It adds **no** resets and **no** global element styles, so it will not fight an existing theme.

---

## 3. The tokens you will use most

### Color (semantic — always prefer these)

```css
/* Backgrounds */
background: var(--c-surface-page-dark);    /* #0B1029 navy, the default dark page */
background: var(--c-surface-page-light);   /* #F5F0EB cream, the default light page */
background: var(--c-surface-card-light);   /* white card */
background: var(--c-surface-page-deep-navy);  /* #122256 richer dark hero */
background: var(--c-surface-page-near-black); /* #0D0807 premium dark frame */

/* Text */
color: var(--c-text-on-dark);          /* cream on dark */
color: var(--c-text-on-dark-muted);    /* cream-70 muted on dark */
color: var(--c-text-on-light);         /* navy on light */
color: var(--c-text-on-light-muted);   /* navy-70 muted on light */
color: var(--c-text-link-on-dark);     /* orange link on navy */

/* Actions — THE important ones */
background: var(--c-action-primary-bg);        /* deep #CA4A0E */
color:      var(--c-action-primary-fg);        /* white text on deep orange (4.67:1) */
box-shadow: var(--c-action-primary-glow);      /* the orange glow */
background: var(--c-action-primary-bg-hover);  /* hover deepens to #D35F1A */

/* Accent (icons, dots, focus, asterisk) */
color: var(--c-accent);                /* #E8732A */
```

### Spacing, radius, shadow, motion

```css
padding: var(--p-space-6);          /* 24px (4px scale: 1=4,2=8,3=12,4=16,5=20,6=24,8=32,10=40,12=48,16=64,20=80,24=96) */
border-radius: var(--p-radius-md);  /* 8px buttons/inputs/selectables */
border-radius: var(--p-radius-lg);  /* 16px cards/panels/modals */
box-shadow: var(--p-shadow-lg);     /* card elevation */
transition: background var(--p-motion-base); /* 0.20s ease */
```

---

## 4. Drop-in components (already in tokens.css)

You usually do not write button/input CSS — you apply the class:

```html
<!-- Primary CTA: bright orange + glow + navy text -->
<button class="mwc-btn">Book My No-Cost Visit</button>

<!-- White secondary CTA on a navy section -->
<button class="mwc-btn mwc-btn--secondary">Add to Apple or Outlook</button>

<!-- Ghost tertiary (dark surfaces only) -->
<button class="mwc-btn mwc-btn--ghost">Skip for now</button>

<!-- Input with a leading icon -->
<label class="mwc-form-label mwc-form-label--light" for="phone">Phone <span class="req">*</span></label>
<input class="mwc-input has-icon" id="phone" type="tel" placeholder="(804) 555-0100" />

<!-- Selectable chip (location / date / time). Selected = bright orange + navy text -->
<button class="mwc-selectable mwc-selectable--on-light is-selected" aria-pressed="true">
  <span class="icon">●</span> 8:00 AM
</button>

<!-- TCPA checkbox: never pre-checked -->
<input class="mwc-checkbox" type="checkbox" id="sms" />
```

Typography helpers (apply, do not re-create):

```html
<h1 class="mwc-h1">Richmond Men, Find Your Edge Over Age.</h1>
<p class="mwc-eyebrow">Physician-led men's health</p>
<p class="mwc-body">A 60-minute, in-person appointment at your local Men's Wellness Centers.</p>
```

---

## 5. When you DO write new CSS

Compose from tokens. A new "info banner on navy" would be:

```css
.mwc-info-banner {
  background: var(--c-surface-card-dark);
  border: var(--p-border-hairline) solid var(--c-border-on-dark);
  border-radius: var(--p-radius-lg);
  padding: var(--p-space-5) var(--p-space-6);
  color: var(--c-text-on-dark);
  font-family: var(--p-font-ui);
  font-size: 16px;
}
.mwc-info-banner .label { color: var(--c-accent); } /* orange accent */
```

Notice: zero raw hex, zero raw px for color/radius/spacing. That is the standard every generated rule must meet.

---

## 6. Common mistakes the audit will catch

| Mistake | Why it is wrong | Fix |
|---|---|---|
| `background: #E8732A` on `.mwc-btn` | White on the accent orange is 3.04:1, fails AA | Use `var(--c-action-primary-bg)` (deep #CA4A0E) + `var(--c-action-primary-fg)` (white) |
| `background: #E8732A` for a selected chip | Accent orange is not a fill | Use `var(--c-surface-selected)` (deep #CA4A0E) + white text |
| `color: #6b7280` for muted text | Gray is banned | `var(--c-text-on-light-muted)` (navy-70) |
| `border: 1px solid #ddd` | Gray border banned | `var(--c-border-card-light)` or `var(--c-border-on-dark)` |
| `font-family: 'Bebas Neue'` | Removed from the system | `var(--p-font-display)` (Oswald) |
| `border-radius: 12px` on a card | Off the radius scale | `var(--p-radius-lg)` (16px) |
| Missing `:focus-visible` ring | Accessibility regression | The `.mwc-*` classes already include it — keep it |

---

## 7. Dark vs light placement cheat sheet

- **Navy page** → cream text, white/cream-tinted cards, accent-orange (#E8732A) accents, deep-orange primary button (white text), white secondary CTA.
- **Cream/white page** → navy text, white cards with navy-25 borders, accent-orange accents, deep-orange primary button (white text). The white secondary CTA is for dark backgrounds; on a light page use the ghost or a plain text link instead.
- **One orange CTA band per page max** (full-bleed `#CA4A0E`): white Oswald headline, white body, and a **white-fill** button (the orange-on-orange button would vanish).

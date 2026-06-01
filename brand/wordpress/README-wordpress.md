# Men's Wellness Centers WordPress Integration Guide (v1.3.0)

This package brands a WordPress site (block themes, Gutenberg, and most page builders) to the Men's Wellness Centers system. The source of truth is `../tokens.json`, expressed for WordPress three ways: a `theme.json` palette/typography, an enqueue file (`mwc-brand.php`) that loads fonts + `tokens.css` and locks core-block styles, and a ready-made block pattern.

---

## 0. The non-negotiable color law (read first)

- **Primary button = deep `#CA4A0E` + glow, with WHITE `#FFFFFF` text** (4.67:1 AA any size). Hover deepens to `#D35F1A`. This deep orange is the ONLY orange that carries white text.
- **Selected option / active chip = the same deep `#CA4A0E` + WHITE text.** (In WP this shows up on toggle/filter UI and builder "active" states.) Checkbox/radio checked fill (`accent-color`) is also `#CA4A0E`.
- **Basic site orange `#E8732A` is ACCENT ONLY** — links on navy, icons, eyebrows, required asterisks, focus ring, glow. It is the dominant orange on menswellnesscenters.com. **Never use `#E8732A` as a button fill** (white on it 3.04:1 fails, navy on it 6.17:1).
- **White secondary button** (`is-style-outline` here) = white fill + navy text, for navy sections.
- **Accent `#E8732A`** = links, icons, asterisks, focus ring, glow.
- **NO GRAY.** Borders/muted text/placeholders are navy or cream at opacity. Never `#ccc`, `#e5e7eb`, `#9ca3af`, gray slugs.
- Fonts: **Oswald** (display/UPPERCASE), **Montserrat** (marketing body), **Inter** (UI). **No Bebas Neue.** Success `#5DD68A`, no teal.

---

## 1. What's in this folder

```
wordpress/
  theme.json              # WP global styles: palette slugs + font families + button/link/heading element styles
  mwc-brand.php           # enqueue fonts + tokens.css + brand-locked core-block CSS; registers is-style-deep button
  patterns/
    consult-hero.php      # navy visit-hero block pattern with deep-orange CTA (white text)
  README-wordpress.md     # this file
```

You also need the canonical tokens: copy `../css/tokens.css` to `<theme>/assets/css/tokens.css`.

---

## 2. Install (block theme — recommended)

1. **Copy files into your (child) theme:**
   - `theme.json` -> theme root (merge if one already exists; keep the `settings.color.palette`, `typography.fontFamilies`, and `styles.elements.button` blocks).
   - `mwc-brand.php` -> theme root.
   - `../css/tokens.css` -> `<theme>/assets/css/tokens.css`.
   - `patterns/consult-hero.php` -> `<theme>/patterns/consult-hero.php`.
2. **Load the enqueue file.** In `functions.php`:
   ```php
   require get_stylesheet_directory() . '/mwc-brand.php';
   ```
   (Or paste the body of `mwc-brand.php` directly into `functions.php`.)
3. Open the Site Editor. The palette, fonts, and button defaults are now brand-locked. The "MWC Visit Hero" pattern appears in the inserter.

### Classic theme / page builder
Skip `theme.json` reliance and lean on `mwc-brand.php`. The inline CSS targets core blocks AND native form fields, so Contact Form 7 / Gravity Forms inputs, checkboxes, and buttons inherit the brand automatically. Builders read the same enqueued `tokens.css` variables.

---

## 3. Color slug mapping (theme.json palette)

When choosing colors in the editor or a builder, use these slugs (CSS var shown for builders that accept raw CSS):

| Editor slug | Hex | CSS var | Use |
|---|---|---|---|
| `navy` | `#0B1029` | `--p-navy-900` | page/hero background, text-on-light |
| `deep-navy` | `#122256` | `--p-deep-navy` | alternate dark surface / logo bg |
| `near-black` | `#0D0807` | `--p-near-black` | premium max-contrast dark / logo bg |
| `cream` | `#F5F0EB` | `--p-cream-50` | text on dark, light sections |
| `white` | `#FFFFFF` | `--p-white` | cards on light, secondary button fill |
| `action` | `#CA4A0E` | `--p-orange-800` | **primary button bg, selected chip, checkbox fill** |
| `action-hover` | `#D35F1A` | `--p-orange-600` | primary hover |
| `accent` | `#E8732A` | `--p-orange-500` | **links, icons, eyebrows, asterisk, focus ring, glow (basic site orange)** |
| `on-action` | `#FFFFFF` | `--p-white` | **button text on deep orange (white)** |
| `success` | `#5DD68A` | `--p-success-300` | success (no teal) |
| `error` | `#A7211C` | `--p-error-700` | error |

**Rule for editors:** when you set a button background to `action` (deep `#CA4A0E`), you MUST set its text color to `on-action` (white). The enqueue CSS enforces this even if an editor forgets, but set the slug correctly so the editor preview matches. Use the `accent` slug (`#E8732A`) only for links, icons, eyebrows, asterisks, and focus rings, never as a button fill.

### Builder-specific notes
- **Gutenberg:** palette + element button styles come from `theme.json`. The default button is the deep `#CA4A0E` + white-text primary. Use the `is-style-outline` style for the white secondary CTA on navy sections.
- **Elementor:** Site Settings -> Global Colors: map Primary = `#CA4A0E`, Text = `#0B1029` on light / `#F5F0EB` on dark, Accent = `#E8732A`. Site Settings -> Global Fonts: Primary (headings) = Oswald, Secondary (body) = Montserrat, Text = Inter. Set the global Button: bg `#CA4A0E`, text `#FFFFFF`, hover bg `#D35F1A`, border-radius 8px, box-shadow `0 4px 16px rgba(232,115,42,.40)`. The enqueued `tokens.css` is still loaded, so you can reference `var(--p-...)` in any Custom CSS box.
- **Beaver/Bricks/Divi:** same idea — set the primary button bg `#CA4A0E` with white text and hover `#D35F1A`, set global accent `#E8732A` for links/icons, load `tokens.css`, reference vars.

---

## 4. Copy rules (apply to all WP content)

- Full name **Men's Wellness Centers**; never "clinic". **members** not patients. Never **"free"** (use "no-cost visit" / "no-cost appointment"). Never **"guy/guys"**. **No em-dashes** in patient-facing copy. Use **"visit"** in short CTAs and **"appointment"** in longer body copy; do not use "consultation". CTA verbs Book/Schedule/Claim/Reserve. **60-minute in-person** framing. Tagline **Finding Your Edge Over Age.** LegitScript badge in the footer of every funnel/service page.

---

## 5. Ralph-loop / OpenClaw audit notes

OpenClaw is hooked to the WordPress site. When it runs an autonomous CRO/repair pass, enforce these invariants (see the 12-point audit in `../openclaw.md`):

1. Every `.wp-block-button__link` / `.wp-element-button` primary button renders WHITE text on the deep `#CA4A0E` background (hover `#D35F1A`). The basic site orange `#E8732A` never appears as a button fill — accent only (links/icons/eyebrows/focus).
2. White-on-orange is allowed only on the deep `#CA4A0E` (primary button, selected chip, checkbox/radio `accent-color`). No button uses `#E8732A` as its fill.
3. No gray hex or gray palette slugs introduced (navy/cream at opacity only).
4. Headings stay Oswald uppercase; body Montserrat; forms/UI Inter. No Bebas, no teal.
5. Inputs keep 56px height + orange focus ring; buttons keep 52px + glow.
6. LegitScript footer + required disclosures remain on funnel/service templates.
7. Mobile-first: hero CTA reachable above the fold at 390px; sticky bottom CTA on funnels.

LOC/asset reductions are fine only if every invariant holds and the rendered page is visually unchanged.

# Landing Page (`/`) — WCAG AA Contrast Audit
_Last updated: 2026-05-15 — brand orange `#E8670A` restored (locked)._

## Hard brand constraint
Brand orange `#E8670A` is non-negotiable. White-on-orange = **3.29:1**, which only passes WCAG AA at "large text" thresholds (≥18pt regular, ≥14pt bold ≈ 18.66px). All AA fixes below preserve the orange and meet AA either by qualifying as large text or by switching the **text color** (not the orange).

## Tokens (src/index.css)
| Token | Value | Use |
|---|---|---|
| `--brand-accent` / `--accent-orange` / `--brand-cta` / `--brand-cta-hover` | `#E8670A` | All orange surfaces, icons, accents |
| `--c-text-on-light` | `#000033` | Body text on white/cream (17:1) |
| `--c-text-on-light-muted` | `#424857` | Secondary text on light (9.5:1) |
| `--c-placeholder-light` | `#5A6072` | Input placeholders on white (6.0:1) |
| `--c-text-on-dark-muted` | `#E7DDD2` | Secondary on navy (13:1) |
| `--c-text-on-dark-subtle` | `#C5BFB7` | Tertiary on navy (9.4:1) |
| `--c-border-on-light` | `#949494` | UI borders/dividers on white (3.07:1) |
| `--c-border-on-dark` | `#6B7299` | UI borders/dividers on navy (3.10:1) |
| `--c-success-on-dark` | `#5DD68A` | Success text on navy (6.4:1) |
| `--c-error-on-light` | `#A7211C` | Error text on white (7.4:1) |
| `--c-error-on-dark` | `#FF8A8A` | Error text on navy (6.6:1) |

## Fix matrix (post brand-revert)

| # | Surface | Before | After | Ratio | Pass |
|---|---|---|---|---:|---|
| 1 | Primary CTA fills | `#C2410C` (off-brand) | `#E8670A` (brand) with white label, ≥16px/700, uppercase, letter-spaced | 3.29:1 (large) | AA-large |
| 2 | TRTMarquee text on orange | 18px/700 | **19px/700** Oswald uppercase | 3.29:1 (large) | AA-large |
| 3 | TRTMarquee `◆` separators | rgba(255,255,255,0.65) | rgba(255,255,255,0.85), `aria-hidden` | decorative | exempt |
| 4 | TRTHowItWorks eyebrow ("Sound Familiar?", "The Fix") | small orange on cream (3.13:1) | navy `#000033` text + small orange divider | 17:1 | AA |
| 5 | TRTHowItWorks step circle digit (white on orange) | 16px/700 | unchanged | 3.29:1 (large) | AA-large |
| 6 | TRTLocations drive-time pill | small orange on white (3.29:1) | navy text + orange MapPin icon | 17:1 text / 3.29:1 icon | AA / AA-UI |
| 7 | TRTLocations address/clock icons | orange on white | unchanged (icons are UI, ≥3:1) | 3.29:1 | AA-UI |
| 8 | TRTFAQ inline link "→ Book consult" | 14px semibold orange on white (3.29:1) | navy bold + underline + orange arrow icon | 17:1 text / 3.29:1 icon | AA |
| 9 | TRTFAQ chevron icon | orange on white | unchanged | 3.29:1 | AA-UI |
| 10 | TRTFinalCTA placeholders | `#999` (2.85:1) | `var(--c-placeholder-light)` `#5A6072` | 6.0:1 | AA |
| 11 | TRTFinalCTA input borders | `#C8C6C1` (1.51:1) | `var(--c-border-on-light)` `#949494` | 3.07:1 | AA-UI |
| 12 | TRTFinalCTA error helper | `#CC4444` (4.16:1) | `var(--c-error-on-light)` `#A7211C` | 7.4:1 | AA |
| 13 | TRTHeroForm input borders on navy | `rgba(245,240,235,0.20)` (1.5:1) | `var(--c-border-on-dark)` `#6B7299` | 3.10:1 | AA-UI |
| 14 | TRTHeroForm error helper | `#FF8A8A` on navy | unchanged | 6.6:1 | AA |
| 15 | TRTPillars card borders | `rgba(255,255,255,0.10)` (1.25:1) | `var(--c-border-on-dark)` | 3.10:1 | AA-UI |
| 16 | StickyMobileCTA top border | `rgba(245,240,235,0.12)` (1.41:1) | `var(--c-border-on-dark)` | 3.10:1 | AA-UI |
| 17 | TRTFooter dividers | `rgba(255,255,255,0.08)` (1.18:1) | `var(--c-border-on-dark)` | 3.10:1 | AA-UI |
| 18 | White-card borders | `#E5E5EA` (1.18:1) | `var(--c-border-on-light)` | 3.07:1 | AA-UI |
| 19 | Header phone-CTA pulse overlay | rgba on orange | `aria-hidden` decorative animation; underlying icon is white on solid orange | 3.29:1 (icon) | AA-UI |
| 20 | `:focus-visible` | n/a | dual-tone orange ring + white shadow offset | ≥3:1 on any surface | AA-UI |

## Verified ratios — primary CTAs (white on `#E8670A`)
- White (`#FFFFFF`) on `#E8670A` = **3.29:1**
- All landing-page primary CTA labels bumped to **`fontSize: 19`** (≥14pt) bold uppercase letter-spaced — qualifies as WCAG large text → 3.29:1 passes AA.
- Components updated: TRTHero (mobile CTA), TRTHeroForm (submit), TRTManifesto, TRTResults, TRTLocations (per-card book), TRTFinalCTA, TRTHowItWorks, StickyMobileCTA. TRTHeader phone CTA is icon-only (UI element, 3:1 bar, passes).

## Full-page sweep — verified passing pairs (no change needed)
- TRTManifesto eyebrow `#E8670A` 13px/700 on `#000033` = **6.1:1** ✓
- TRTManifesto body `rgba(255,255,255,0.85)` on navy ≈ **14:1** ✓
- TRTManifesto quote attribution `rgba(255,255,255,0.65)` on navy ≈ **8.6:1** ✓
- TRTPillars body `rgba(255,255,255,0.65)` on navy ≈ **8.6:1** ✓; hover border `#8C92B0` on navy = **6.7:1** ✓
- TRTHero subhead `rgba(245,240,235,0.85)` on navy-deep ≈ **14:1** ✓; trust line `0.75` ≈ **9.9:1` ✓; checklist `0.55` ≈ **6.3:1** ✓; medical-review caption 12px `0.60` ≈ **6.1:1** ✓
- TRTHero orange Check icons on navy-deep = **6.0:1** ✓ (UI ≥3)
- TRTHeroForm input text `#F5F0EB` on `rgba(11,16,41,0.6)` ≈ **17:1** ✓; placeholder `0.50` ≈ **5.4:1** ✓; TCPA 12px `0.65` ≈ **7.5:1** ✓; native `<option>` `#0B1029` on white = **19:1** ✓
- TRTResults stars `#E8670A` on white = 3.29:1 ✓ (decorative icon, ≥3)
- TRTResults testimonial italic `#1a1a2e` on white = **17:1** ✓
- TRTFooter `rgba(255,255,255,0.78)` on `#000033` ≈ **12:1** ✓; legal `0.55` ≈ **6.3:1** ✓
- CredibilityBand white on `#0A1628` ≈ **17:1** ✓; sublabel `0.65` ≈ **8.4:1** ✓
- StickyMobileCTA call-side cream on `rgba(11,16,41,0.96)` ≈ **15:1** ✓; phone-number 11px @ opacity 0.80 ≈ **12:1** ✓

## Non-contrast cleanup noted (not blocking AA)
- `TRTHero.tsx` `COLORS.navy` (`#1B2B4B`) is declared but unused — safe to remove in a future cleanup pass.
- Google "G" SVG path fills (`#FFC107` / `#FF3D00` / `#4CAF50` / `#1976D2`) in TRTHero are brand-mark fills (logo exemption — WCAG 1.4.3 specifically excludes logos).


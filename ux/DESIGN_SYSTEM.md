# MWC Design System — Baseline 2026-05-25

## Color Tokens

### Brand Surfaces
| Token | Value | Usage |
|-------|-------|-------|
| `--brand-navy` | `#000033` | Primary brand surface |
| `--brand-navy-deep` | `#0B1029` | Deep dark surface |
| `--brand-cream` | `#F5F0EB` | Warm light surface |
| `--brand-cta` | `#E8670A` | CTA orange (3.29:1 on white — AA large text only) |
| `--brand-cta-hover` | `#CF5B09` | CTA hover state |
| `--brand-cta-accessible` | `#BF5608` | CTA orange for small text (4.62:1 — AA all sizes) |
| `--brand-accent` | `#E8670A` | Accent — display only |

### Background Tokens
| Token | Value |
|-------|-------|
| `--bg-black` | `#000033` |
| `--bg-warm-grey` | `#EBEAE8` |
| `--bg-charcoal` | `#1A1A2E` |
| `--bg-white` | `#FFFFFF` |

### Text Tokens (Light Surfaces)
| Token | Value | Contrast vs White |
|-------|-------|-------------------|
| `--c-text-on-light` | `#000033` | 17:1 ✅ |
| `--c-text-on-light-muted` | `#424857` | 9.5:1 ✅ |
| `--c-text-on-light-muted-2` | `#5A6170` | 6.22:1 ✅ |
| `--c-placeholder-on-white` | `#636B80` | 5.32:1 ✅ |

### Text Tokens (Dark Surfaces)
| Token | Value | Contrast vs Navy |
|-------|-------|------------------|
| `--c-text-on-dark` | `#FFFFFF` | 17:1 ✅ |
| `--c-text-on-dark-muted` | `#E7DDD2` | 13:1 ✅ |
| `--c-text-on-dark-subtle` | `#C5BFB7` | 9.4:1 ✅ |
| `--c-footnote-on-dark` | `rgba(255,255,255,0.50)` | 5.26:1 ✅ |

### Border Tokens
| Token | Value | Contrast |
|-------|-------|---------|
| `--c-border-on-light` | `#949494` | 3.07:1 ✅ |
| `--c-border-on-dark` | `#8890A4` | 5.87:1 ✅ |
| `--border-light` | `#D4D3D1` | — |
| `--border-dark` | `#2A2A40` | — |

### Status Tokens
| Token | Value |
|-------|-------|
| `--c-success-on-dark` | `#5DD68A` (6.4:1 on navy) |
| `--c-error-on-light` | `#A7211C` (7.4:1 on white) |
| `--c-error-on-dark` | `#FF8A8A` (6.6:1 on navy) |

## Typography
| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Display H1 | Oswald | clamp(36px, 6vw, 72px) | 700 | 1.0 |
| Section H2 | Oswald / Inter | clamp(24px, 3.5vw, 40px) | 700 | 1.1 |
| Card H3 | Inter | 18–24px | 700 | 1.2 |
| Body | Inter | 16–18px | 400 | 1.6 |
| Small/helper | Inter | 14px (min) | 400 | 1.5 |

**Fonts:** Oswald (display), Inter (body) — loaded non-blocking via `<link>` in `index.html`

## Spacing Scale
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px

## Touch Targets
Minimum 44x44px for all interactive elements

## Border Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | (per index.css) | Inputs, tags |
| `--radius-md` | (per index.css) | Cards |
| `--radius-lg` | (per index.css) | Sections, modals |
| `--radius-xl` | (per index.css) | Hero panels |

## Known Violations (Baseline)
- `#6B7280` used in 5 locations — FAILS AA (3.0:1)
- `#9CA3AF` used in 3 locations — FAILS AA (2.33:1)
- FontSizes below 16px: BookSchedule2.tsx (13px), TRTGetStarted.tsx (12px), ProductTRTSchedule.tsx (14px)

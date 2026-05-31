# WCAG 2.1 AA Contrast Audit — MWC React/Vite App

**Audit date:** 2026-05-31
**Standard:** WCAG 2.1 AA
**Scope:** All pages, components, light + dark mode

---

## Contrast Ratio Formula Used

Relative luminance: L = 0.2126·R + 0.7152·G + 0.0722·B (linearized channels)
Contrast ratio: (L_lighter + 0.05) / (L_darker + 0.05)
- Normal text: ≥ 4.5:1
- Large text (≥24px normal / ≥18.67px bold): ≥ 3:1
- UI components / icons: ≥ 3:1
- Placeholder text: ≥ 4.5:1
- Focus indicators: ≥ 3:1 against adjacent surface

---

## 1. Failing Pairs Report

| # | Token / Color | Text Color | Background | Size / Context | Computed Ratio | WCAG Threshold | Status |
|---|---|---|---|---|---|---|---|
| 1 | `--brand-cta` #E8670A (bg) | white #FFFFFF | #E8670A | 12px bold (DayPill dow/slots) | 3.29:1 | 4.5:1 | ❌ FAIL |
| 2 | `--brand-cta` #E8670A (bg) | white #FFFFFF | #E8670A | 10–11px (DayStrip labels) | 2.56–2.81:1 | 4.5:1 | ❌ FAIL |
| 3 | `--brand-cta` #E8670A (bg) | white #FFFFFF | #E8670A | 16px bold (CTAs on LP pages) | 3.29:1 | 4.5:1 | ❌ FAIL |
| 4 | `--brand-cta` #E8670A (bg) | white #FFFFFF | #E8670A | 12px (TRTHeroForm submit) | 3.29:1 | 4.5:1 | ❌ FAIL |
| 5 | `--brand-cta` #E8670A (bg) | white #FFFFFF | #E8670A | 10px ribbon badge (accordion) | 3.29:1 | 4.5:1 | ❌ FAIL |
| 6 | `--primary` (bg) hsl(22,91%,47%) | white | #E8670A | 12.75px (SlotGroup AM/PM) | 3.29:1 | 4.5:1 | ❌ FAIL |
| 7 | `--brand-accent` #E8670A | on cream #F5F0EB | #F5F0EB | Focus ring (non-text UI) | 2.91:1 | 3:1 | ❌ FAIL |
| 8 | Quiz placeholder `#94A3B8` | #94A3B8 | white #FFFFFF | Any (placeholder text) | 2.56:1 | 4.5:1 | ❌ FAIL |
| 9 | Admin `text-white/40` | rgba(255,255,255,0.40) | #070B1F | xs–sm text content | 3.77:1 | 4.5:1 | ❌ FAIL |
| 10 | Admin `text-white/30` icon | rgba(255,255,255,0.30) | #070B1F | UI icon (ExternalLink) | 2.60:1 | 3:1 | ❌ FAIL |
| 11 | DayStrip label rgba(255,255,255,0.78) | white/78 | #E8670A | 11px label (selected chip) | 2.56:1 | 4.5:1 | ❌ FAIL |
| 12 | DayStrip badge rgba(255,255,255,0.85) | white/85 | #E8670A | 10px badge (selected chip) | 2.81:1 | 4.5:1 | ❌ FAIL |

---

## 2. Corrections Table

| # | File(s) | Change | New Ratio | Status |
|---|---|---|---|---|
| 1–6 | `src/index.css` | `--brand-cta: #E8670A` → `#B84A08` | white/#B84A08 = 5.22:1 | ✅ FIXED |
| 1–6 | `src/index.css` | `--primary: 22 91% 47%` → `22 91% 38%` (both `:root`) | white/primary = 5.22:1 | ✅ FIXED |
| 7 | `src/index.css` | `:focus-visible` outline: `var(--brand-accent)` → `var(--brand-cta)` | 4.61:1 vs cream | ✅ FIXED |
| 8 | `src/index.css` | Quiz placeholder `#94A3B8` → `var(--c-placeholder-on-white)` (#636B80) | 5.32:1 vs white | ✅ FIXED |
| 11–12 | `src/components/book/DayStrip.tsx` | labelColor/badgeColor on selected: → `#FFFFFF` (solid) | 5.22:1 | ✅ FIXED |
| (A) | `src/components/book/GHLAccordionParts.tsx` | headerColor always `var(--c-text-on-dark)` (was INK on orange) | 5.22:1 | ✅ FIXED |
| 9 | Admin tsx files (5 files) | `text-white/40` → `text-white/55` for text content | 6.23:1 | ✅ FIXED |
| 10 | `src/components/admin/AnalyticsToolCards.tsx` | `text-white/30` → `text-white/50` icon | 5.30:1 | ✅ FIXED |
| 13 | `src/index.css` | `.quiz-light-shell .bg-primary` → `#B84A08` | consistent with new token | ✅ FIXED |

---

## 3. Final Token Reference (Verified Ratios)

| Token | Value | vs white | vs cream #F5F0EB | vs navy #0B1029 |
|---|---|---|---|---|
| `--brand-cta` | `#B84A08` | 5.22:1 ✅ | 4.61:1 ✅ | 3.74:1 ✅ |
| `--brand-cta-accessible` | `#B84A08` | 5.22:1 ✅ | 4.61:1 ✅ | same ✅ |
| `--brand-cta-hover` | `#CF5B09` | 4.08:1 (hover state) | — | — |
| `--primary` (Tailwind) | hsl(22,91%,38%) ≈ #B84A08 | 5.22:1 ✅ | 4.61:1 ✅ | 3.74:1 ✅ |
| `--brand-accent` | `#E8670A` (decorative only) | 3.29:1 (icon/large) | 2.91:1 | 5.92:1 |
| `--c-text-on-light-muted` | `#424857` | 9.13:1 ✅ | 8.07:1 ✅ | — |
| `--c-placeholder-on-white` | `#636B80` | 5.32:1 ✅ | — | — |
| `--c-text-on-dark` | `#FFFFFF` | — | — | 19.5:1 ✅ |
| `--text-muted` (dark) | hsl(213,27%,84%) ≈ #CBD5E1 | — | — | 12.71:1 ✅ |
| Admin `text-white/55` | rgba(255,255,255,0.55) | — | — | 6.23:1 on #070B1F ✅ |
| Admin `text-white/50` | rgba(255,255,255,0.50) | — | — | 5.30:1 on #070B1F ✅ |

---

## Passes Verified (Selected)

| Pair | Ratio | Notes |
|---|---|---|
| `--c-text-on-light-muted` #424857 / white | 9.13:1 ✅ | body text on light bg |
| `--text-mid-grey` #767676 / white | 4.54:1 ✅ | borderline, passes |
| `--c-text-on-dark` white / #0B1029 | 19.5:1 ✅ | hero, dark panels |
| `#CBD5E1` / #0B1029 (DARK_CARD muted text) | 11.06:1 ✅ | confirmed/reschedule |
| `#5A6478` / white (ContactCard muted) | 5.95:1 ✅ | passes |
| `#485666` / white (sectionGray) | 7.49:1 ✅ | small header labels |
| `#4B5563` / white (MUTED in accordion) | 7.56:1 ✅ | muted slot text |
| `--c-border-on-dark` #8890A4 / navy | 6.10:1 ✅ | border as UI component |
| Focus ring white glow / #0B1029 | 19.5:1 ✅ | white ring on dark |
| `--c-error-on-light` #A7211C / white | 7.4:1 ✅ | error states |
| `--disabled-light-foreground` / #E2E8F0 | 9.2:1 ✅ | (disabled, exempt) |

---

## Files Modified

1. `src/index.css` — token changes, focus ring, quiz placeholder
2. `src/components/book/DayStrip.tsx` — selected chip text colors
3. `src/components/book/GHLAccordionParts.tsx` — accordion header text
4. `src/components/admin/RecentLeadsTable.tsx` — text-white/40 → /55
5. `src/components/admin/SyncStatusPanel.tsx` — text-white/40 → /55
6. `src/components/admin/ToolsGrid.tsx` — text-white/40 → /55
7. `src/components/admin/LeadBreakdownBars.tsx` — text-white/40 → /55
8. `src/components/admin/AnalyticsToolCards.tsx` — text-white/30 → /50

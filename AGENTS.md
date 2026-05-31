# AGENTS.md — MWC /optimize LP Lessons

## CRO Patterns That Worked

### CTA Architecture
- **All mid-page CTAs should anchor to `#hero-form`, not `#hero` (section top).** On mobile a stacked 1-col layout means `#hero` shows the headline, not the form — the user has to scroll through all copy again. `#hero-form` delivers them directly to the conversion element.
- **Add a mobile-only early CTA between service chips and symptom list.** Desktop visitors see the form side-by-side. Mobile visitors don't see the form until they've scrolled past all hero copy. An early mobile CTA gives immediately-convinced visitors a fast path without reading everything.
- **Add a bridge CTA after the differentiation section.** After reading "Why MWC vs telehealth" comparison, visitors at peak conviction have no immediate action path — they have to scroll through the entire stats+reviews section. A compact CTA at the bottom of the comparison section closes this gap.

### Trust & Proof
- **Credential badges need visual weight to convert.** Tiny text+icon spans (11px, no background) read like a footer disclaimer. A 2x2 grid of credential cards (icon container + label + descriptor) carries real authority. The layout communicates "this is a certified practice" rather than "here's our fine print."
- **Add a founding-year longevity badge at the hero form, not just mid-page.** Visitors who bounce from the hero never see "since 2015" in the stats section. Place it as a full-width element within the credential grid — spans both columns, visible immediately at the conversion point.
- **"Virginia Board of Medicine licensed providers" near the final form removes the #1 men's health hesitation.** Visitors want to know: "Is this a real doctor?" Adding a strip before the final CTA form that explicitly says "licensed clinician - not a chatbot, not a PA" converts final hesitators.

### Value Proposition
- **Lead the hero subheadline with outcome, then process.** "Three Virginia centers. One provider. Same-day labs." is a process spec. "Actual answers, not guesses." is an outcome promise. The outcome should always come first — process details serve as proof.
- **Service chips should state WHAT YOU GET, not just what the service is called.** Two-line chips (service name + 1-line outcome) add immediate value clarity at the self-identification moment without adding visual clutter.
- **The final CTA headline should close the narrative arc from the hero.** Hero: "You don't feel normal." Final CTA: "Walk out with answers. Not guesses." The page tells a complete story when the CTA resolves the hero's opening problem.

### Scannability
- **Bold-key list structure eliminates "wall of text" comparison cards.** WHY_US items restructured as `{ key (bold), detail (muted) }` creates a two-tier scan: skimmers see the bold benefit summary; readers get the clarifying detail. Also eliminates em-dashes (banned per brand guidelines).

### Interaction Quality
- **Form submit buttons need focus-visible CSS, not just JS hover handlers.** The TRTHeroForm button used inline `onMouseEnter`/`onMouseLeave` — mouse only. Adding `className="trt-hero-form-submit"` + a CSS `focus-visible` rule in `index.css` fixes keyboard accessibility globally for all LP instances.
- **All CTA anchor links need `:active` press states.** Hover states (translateY, opacity) exist but `:active` states don't — no tactile feedback on mobile tap. `scale(0.97) + opacity 0.82` on `:active` makes every tap feel responsive.

### Visual Hierarchy
- **Reviewer avatar monograms make testimonials feel real.** Plain white review cards look generic. A navy monogram circle (first initial, Oswald bold, cream text) creates an identity marker that answers "is this a real person?" at a subconscious level. Pattern: avatar → stars → quote → name/badge.

### Accessibility & Performance
- **`prefers-reduced-motion` must wrap ALL CSS animations.** The scroll-hint bounce animation was not guarded. Wrap with `@media (prefers-reduced-motion: no-preference)` — not `reduce` (the no-preference approach is safer because it only runs animation when the user has NOT requested reduced motion).

## WCAG 2.1 AA Contrast Audit (2026-05-31)

### Key Failures Fixed

| Failing Pair | Root Cause | Fix Applied |
|---|---|---|
| white text on `#E8670A` buttons (all CTAs) | `--brand-cta` = 3.29:1 vs white (FAIL) | `--brand-cta: #E8670A` → `#B84A08` (5.22:1 ✅) in index.css |
| `--primary` (Tailwind) on booking funnel | hsl(22,91%,47%) = #E8670A, same failure | `--primary: 22 91% 47%` → `22 91% 38%` in both :root blocks |
| Focus ring `--brand-accent` on cream | #E8670A on #F5F0EB = 2.91:1 FAIL (SC 1.4.11) | `:focus-visible` outline → `var(--brand-cta)` (#B84A08, 4.61:1 ✅) |
| Quiz placeholder `#94A3B8` on white | 2.56:1 FAIL | → `var(--c-placeholder-on-white)` (#636B80, 5.32:1 ✅) |
| Admin `text-white/40` on `#070B1F` | 3.77:1 FAIL for xs–sm text | → `text-white/55` (6.23:1 ✅) in 4 admin components |
| Admin `text-white/30` ExternalLink icon | 2.60:1 FAIL for UI component | → `text-white/50` (5.30:1 ✅) in AnalyticsToolCards |
| DayStrip selected chip label/badge (rgba/78, rgba/85 on orange) | 2.56–2.81:1 FAIL on #E8670A | → solid `#FFFFFF` on new darker orange (5.22:1 ✅) |
| TimeGrid ampm text (rgba/80 on orange) | 3.91:1 FAIL on #B84A08 for 12px | → solid `#FFFFFF` (5.22:1 ✅) |
| GHLAccordionParts header INK on orange (expanded) | `#0B1029` on #B84A08 = 3.74:1 FAIL for 11px | → always `var(--c-text-on-dark)` white (5.22:1 ✅) |
| OrangeCTA/OrangeBullet gradient `#E8670A→#F07820` | #F07820 gives white 2.83:1 FAIL | → solid `var(--brand-cta)` (#B84A08, 5.22:1 ✅) |
| MOST POPULAR badge gradient + white 10px text | Same gradient failure | → solid `var(--brand-cta)` |
| BookConfirmedHero date pill rgba/85 at 12px on orange | 2.81:1 FAIL | Pill bg → `var(--brand-cta)`, text → solid `#FFFFFF` |
| bookv2-funnel focus border `#E8670A` on cream input | 2.89:1 FAIL | → `#B84A08` (4.59:1 ✅) |
| quiz-light-shell border-primary `#E8670A` on cream | 2.91:1 FAIL | → `#B84A08` (4.61:1 ✅) |
| AdminSync button `bg-[#E8670A]` white text-sm | 3.29:1 FAIL | → `bg-[#B84A08]` (5.22:1 ✅) |

### Minimal Fix Pattern
**Orange #E8670A (vibrant) only passes white text at large text (≥24px normal / ≥18.67px bold) or as UI icon on dark bg.**
**For ALL text sizes and light surfaces: use `var(--brand-cta)` = `#B84A08` (5.22:1 vs white ✅).**

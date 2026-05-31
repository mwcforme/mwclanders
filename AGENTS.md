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

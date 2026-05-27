# MWC Polish — Implementation Plan

## P0 — Compliance sweep (run once, repo-wide)
- [ ] P0.1 Grep landing surfaces for banned terms (`free`, `guy`, `guys`, `clinic`, `patients`). Replace each with brand-approved equivalent.
  Verify: `grep -nEi '\b(free|guy|guys|clinic|patients?)\b' src/pages src/components/landing`
- [ ] P0.2 Grep for em-dashes / en-dashes. Replace with period, comma, colon, or rephrase.
  Verify: `grep -nE '[—–]' src/pages src/components/landing`
- [ ] P0.3 Grep for hardcoded `#0B1029` / `#E8670A` / `#000033` / `#F5F0EB` in components. Replace with `var(--brand-*)` tokens.
  Verify: `grep -nEi '#0B1029|#E8670A|#000033|#F5F0EB' src/pages src/components/landing`

## P1 — Landing pages
- [ ] P1.1 / (NewLandingPage.tsx) — hero, manifesto, pillars, final CTA
- [ ] P1.2 /wl (NewWeightLoss.tsx) — symptom list + cream/navy alternation + final CTA star strip

## P2 — Secondary pages
- [ ] P2.1 /pricing (Affordability.tsx) — pricing tier hover lift + star strip
- [ ] P2.2 /trt-education (TRTEducation.tsx) — eyebrow normalization, Lucide bullets

## P3 — Cleanup
- [ ] P3.1 /cro-op (CROOptimized.tsx) — token + icon pass
- [ ] P3.2 /quiz, /quiz/approved — heavy hex-literal cleanup (TRTQuizApproved has 62 hexes)

## P4 — Booking funnel (VISUAL SHELL ONLY — anchored to mwclocked · <2% variance · 10-loop floor)
- [ ] P4.1 ProductTRT.tsx — tokens + icons
- [ ] P4.2 ProductTRTSchedule.tsx — tokens + icons (do not touch slot logic)
- [ ] P4.3 BookLocation.tsx — light-card hover lift on location tiles
- [ ] P4.4 BookSchedule.tsx — anchor: https://mwclocked.pplx.app/#/ — must hit <2% variance at 390 + 1280 with min 10 successful loops
  - [ ] P4.4a personalize headline to `<FIRSTNAME>, LOCK IN A TIME.` with `<center> center.` second line
  - [ ] P4.4b add `Next available: <day> · <time>` orange-dot banner with `🔒 LOCK IN →` shortcut on the right
  - [ ] P4.4c week-strip day chips with prev/next arrows, orange-filled selected state, slot count in body-muted, `Full` / `Closed` states
  - [ ] P4.4d three-group time chip grid (MORNING / AFTERNOON / EVENING) with uniform-width chips
  - [ ] P4.4e footer `Need help?` row → navy card with Lucide Phone icon
  - [ ] P4.4f spacing, padding, border-radius, line-height micro-tuning until variance < 2%
  - [ ] P4.4g font-weight, letter-spacing, color-token micro-tuning until variance < 2%
  - [ ] P4.4h shadow, border, opacity micro-tuning until variance < 2%
  - [ ] P4.4i (reserve loop slot) any remaining diff region from pixelmatch heatmap
  - [ ] P4.4j final QA pass — verify gate, capture final screenshots, commit
- [ ] P4.5 BookConfirmed.tsx — anchor: https://mwclocked.pplx.app/#/confirmed — must hit <2% variance at 390 + 1280 with min 10 successful loops
  - [ ] P4.5a personalize headline to `YOU'RE BOOKED, <FIRSTNAME>.`
  - [ ] P4.5b insert `YOUR APPOINTMENT` summary card at top: date block + time + duration + center + 3-up Lucide Check row
  - [ ] P4.5c add `ADD TO GOOGLE CALENDAR` (solid orange) + `APPLE OR OUTLOOK` (outlined) buttons under summary card
  - [ ] P4.5d reorder sections to: hero → summary → calendar buttons → leave-with → video → arrive prep → location → email → change-appt
  - [ ] P4.5e swap unicode bullets to Lucide icons (Check on dark, MapPin + Clock in location card)
  - [ ] P4.5f spacing, padding, border-radius, line-height micro-tuning until variance < 2%
  - [ ] P4.5g font-weight, letter-spacing, color-token micro-tuning until variance < 2%
  - [ ] P4.5h shadow, border, opacity micro-tuning until variance < 2%
  - [ ] P4.5i (reserve loop slot) any remaining diff region from pixelmatch heatmap
  - [ ] P4.5j final QA pass — verify gate, capture final screenshots, commit

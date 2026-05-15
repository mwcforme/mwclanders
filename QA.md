# MWC Intake — Final QA Checklist

Run through this before flipping the GHL workflow live.

## Mobile / device

- [ ] All 20 steps tested at 360px, 390px, and 430px viewport widths
- [ ] No horizontal scroll on any step
- [ ] iOS Safari: soft keyboard never covers the sticky CTA (visualViewport lift active)
- [ ] Android Chrome: chip/radio taps feel snappy (no 300ms delay)
- [ ] Safari back/forward cache restores form state on `pageshow`

## Routing & pre-fill

- [ ] `/intake` cold-loads on Step 1
- [ ] `/intake?first_name=John&last_name=Test&phone=5555551234&email=a@b.com&dob=01/01/1965&contact_id=abc123` lands on Step 3
- [ ] Resume toast appears on reload when partial data exists in localStorage
- [ ] Back button restores values on every step (1–19)

## Validation

- [ ] CTA is disabled when current step is invalid
- [ ] Field errors only appear on first blur OR first CTA tap
- [ ] Phone mask works with paste, backspace, and partial input
- [ ] DOB mask MM/DD/YYYY rejects years outside 1920–(currentYear − 18)
- [ ] Signature mismatch shows the gentle error
- [ ] Auto-advance fires only on Steps 16, 17, 18 (and not when "Something else" is selected on 16)
- [ ] "None of these" / "No known allergies" quick buttons clear conflicting state

## Submission

- [ ] Submit CTA disables instantly on press (no double-submit)
- [ ] Demo mode (no `VITE_WEBHOOK_URL`): payload appears in console, success page renders
- [ ] Real webhook: payload arrives at the configured URL with all fields populated
- [ ] Retry path: with network offline, error banner appears on Step 19 with the support phone
- [ ] localStorage `mwc_intake_v1` is cleared after successful submit
- [ ] Success page shows masked email/phone and Title-Case first name
- [ ] `submitted_at` and `signature.signed_at` ISO timestamps match

## Accessibility

- [ ] Every input has an associated `<label for>` and visible focus ring
- [ ] CardRadio uses `role="radio"` + `aria-checked`; arrow keys move focus within a radiogroup
- [ ] CardCheckbox uses `role="checkbox"` + `aria-checked`; Space/Enter toggle
- [ ] Error messages use `aria-live="polite"` and `aria-describedby`
- [ ] WCAG AA contrast: body text ≥ 4.5:1, large headings ≥ 3:1
- [ ] `prefers-reduced-motion` collapses step slides to opacity-only and shortens the saved-indicator fade

## Performance

- [ ] Step components are code-split (`React.lazy`)
- [ ] Bebas Neue + Montserrat preconnected with `font-display: swap`
- [ ] Lighthouse mobile performance ≥ 90 on `/intake`

## Copy

- [ ] No instance of "mandatory" or "failure" in user-facing strings (use "required" / gentle guidance)
- [ ] Step 15 helper reads exactly: *"Your provider sees this daily. Be straight with them — it helps them help you."*
- [ ] No shame language anywhere in the symptoms section
- [ ] Success page first name is Title Case regardless of input casing

## GHL handoff

- [ ] Outbound SMS link template documented in README
- [ ] Inbound webhook URL set in GHL workflow and field-mapped per README table
- [ ] Test contact submitted end-to-end and a contact note created in GHL with full payload

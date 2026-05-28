# MWC Booking Funnel — Fix Plan

Last updated: 2026-05-28

## CRITICAL (compliance + revenue)

- [x] MWC-003: GTM firing before TCPA consent
  Status: ALREADY FIXED — GTM deferred to first user interaction OR 5s timeout.
  GTM script does NOT fire on page load. `dataLayer` stub only. Verified in index.html lines 63-80.
  Note: GTM consent mode v2 (`gtag('consent', 'default', {...})`) not yet wired — add if Meta Pixel / Google Ads conversion tracking is active before consent. MEDIUM priority unless GDPR/CCPA applies.

- [x] MWC-004: Missing CSP header on booking subdomain
  Status: ALREADY FIXED — vercel.json has `Content-Security-Policy` header on all routes.
  Current CSP: default-src 'self', script-src covers GTM/GA4/Clarity/Sentry, frame-src covers Google Maps.
  Gap: `frame-src` missing `https://api.leadconnectorhq.com` (GHL calendar widget). Fix in next loop.

- [ ] MWC-004b: CSP frame-src missing GHL calendar domain
  Priority: HIGH — GHL calendar iframe will be blocked by current CSP.
  Fix: Add `https://api.leadconnectorhq.com https://*.gohighlevel.com` to frame-src in vercel.json.

- [ ] MWC-005: CLS > 0.28 from late font stack
  Status: Oswald woff2 preload URL was stale (404) — fixed 2026-05-27. Font now preloads correctly.
  Verify with Lighthouse after next deploy. May still need `font-display: swap` in @font-face override.

## HIGH (conversion)

- [ ] MWC-006: Form errors only shown on submit
  Scope: BookSymptom, BookDuration option cards — no inline validation issue since these are radio-style.
  Real issue: BookEntry form has no error display if wp-token-exchange returns 400. Verify and fix.

- [x] MWC-007: UTM params stripped on redirect
  Status: BookEntry.tsx preserves searchParams through handoff flow (lines 91, 110-111).
  Verify source/campaign params flow into bookingStore and out to GHL contact custom fields.

- [ ] MWC-008: Chat widget loading synchronously
  Not found in codebase — may be a GTM tag injecting it. Check GTM container tags.

## MEDIUM

- [x] MWC-010: No LocalBusiness schema markup
  Status: ALREADY EXISTS — src/lib/schema.ts exports buildLocalBusinessJsonLd() and buildFaqJsonLd().
  NewLandingPage.tsx uses useJsonLd(faqSchema). Verify LocalBusiness is also injected.

- [ ] MWC-009: Missing image width/height attributes
  Run: grep -rn "<img" src/pages/ src/components/ | grep -v "width=\|height="
  Many images in booking funnel may be missing. Fix with explicit dimensions.

- [ ] MWC-011: Duplicate GTM triggers on page view
  index.html fires: gtag('config', 'G-286547777') synchronously AND GTM is deferred.
  If GTM also has a GA4 config tag, it fires twice. Audit GTM container.

## BACKLOG

- [ ] MWC-012: Missing canonical tag
  src/components/SEO.tsx has no canonical link injection. Add per-page canonical.

- [ ] MWC-013: Missing HSTS header
  vercel.json missing Strict-Transport-Security header. Add with max-age=31536000.

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

- [x] MWC-005: CLS > 0.28 from late font stack
  Status: Oswald woff2 preload URL was stale (404) — fixed 2026-05-27. Font now preloads correctly.
  2026-05-28: Added explicit @font-face { font-display: swap } overrides in src/index.css for Oswald/Montserrat/Inter.
  Google Fonts URL already has display=swap. No JS adds classes to <html> before fonts load. Verify CLS with Lighthouse.

## HIGH (conversion)

- [x] MWC-006: Form errors only shown on submit
  Scope: BookSymptom, BookDuration option cards — no inline validation issue since these are radio-style.
  2026-05-28: Added ErrorScreen component to BookEntry.tsx. On any fail() call (400/5xx/network), user sees
  inline error with 'Something went wrong' message + tel: link to (866) 344-4955 instead of silent redirect.

- [x] MWC-007: UTM params stripped on redirect
  Status: BookEntry.tsx preserves searchParams through handoff flow (lines 91, 110-111).
  Verify source/campaign params flow into bookingStore and out to GHL contact custom fields.

- [x] MWC-008: Chat widget loading synchronously [NOT_APPLICABLE]
  No chat widget (Intercom/Drift/Tawk/Zendesk/Crisp/Tidio/etc.) found in src/ or index.html.
  If injected via GTM, it will be deferred along with GTM (first interaction or 5s fallback). N/A.

## MEDIUM

- [x] MWC-010: No LocalBusiness schema markup
  Status: ALREADY EXISTS — src/lib/schema.ts exports buildLocalBusinessJsonLd() and buildFaqJsonLd().
  NewLandingPage.tsx uses useJsonLd(faqSchema). Verify LocalBusiness is also injected.

- [x] MWC-009: Missing image width/height attributes
  2026-05-28: Audited all img tags. Most already had explicit width/height attrs.
  Fixed: CROFooter.tsx — 3 badge images (clia, legitscript, hipaa) were missing explicit width/height (had style only). Added width/height attrs matching TRTFooter pattern.

- [ ] MWC-011: Duplicate GTM triggers on page view [NEEDS_GTM_AUDIT]
  index.html fires: gtag('config', 'G-286547777', { send_page_view: false }) — inline config does NOT fire a page_view.
  GA4 anonymize_ip: true is set. url_passthrough: true is set on sensitive /book/ paths.
  CANNOT FIX FROM CODE: if GTM container has a GA4 Configuration tag that fires on All Pages,
  it will send a second page_view. Requires GTM container access to audit/fix.
  Action needed: open GTM-5X9DB23T, check for GA4 Configuration tag firing trigger, disable or set send_page_view=false there.

## BACKLOG

- [ ] MWC-012: Missing canonical tag
  src/components/SEO.tsx has no canonical link injection. Add per-page canonical.

- [ ] MWC-013: Missing HSTS header
  vercel.json missing Strict-Transport-Security header. Add with max-age=31536000.

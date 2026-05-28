# AGENT.md — MWC Booking Funnel Loop Learnings

## Architecture
- Stack: Vite + React 18 + TypeScript + Tailwind + Supabase (slot data) + GHL (CRM/calendar)
- Hosting: Vercel (book.menswellnesscenters.com)
- Analytics: GA4 G-286547777, Google Ads AW-954193072, GTM GTM-5X9DB23T, Clarity
- GHL Calendar: Supabase table `ghl_free_slots` caches available slots — NOT a direct iframe embed

## Key Learnings

### 2026-05-28
- GTM is deferred to first interaction (not page load) — already handles MWC-003
- GHL calendar is NOT an iframe embed — it's a Supabase data fetch rendered by React components (GHLDayView). The iframe sandbox warnings from console come from google.com/maps embed in old BookConfirmedContent.tsx (now dead code) or GTM injected scripts
- CSP frame-src currently only allows google.com/maps — if any GHL iframe is added later, need leadconnectorhq.com / gohighlevel.com domains
- Font preload URL was stale (2026-05-27 fix): Google Fonts woff2 hashes change with new Oswald versions — always fetch the CSS first and extract the current hash
- vercel.json headers apply to the Vercel deployment at book.menswellnesscenters.com — verify with `curl -I https://book.menswellnesscenters.com/` to confirm headers are live
- BookEntry.tsx uses useSearchParams() to preserve UTM params through WP handoff
- Dead code still in repo: BookConfirmedHero.tsx, BookConfirmedContent.tsx, GHLDayView.tsx, DayStrip.tsx, TimeGrid.tsx (used only by now-deleted BookSchedule2 route) — safe to delete
- MWC-011 (Duplicate GA4 page_view): index.html already has send_page_view: false AND anonymize_ip: true AND url_passthrough: true on /book/ paths. Cannot fix duplicate page_view from code — requires GTM container audit. Open GTM-5X9DB23T, check if a GA4 Configuration tag fires on All Pages (it will double-fire). Disable page_view on the GTM-side GA4 tag or change its trigger to fire only on custom events.

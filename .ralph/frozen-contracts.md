# Frozen Contracts — index.html Scripts

## ⚠️ DO NOT MODIFY THESE SCRIPTS — FROZEN

These scripts are safety-critical (PHI guard, analytics compliance). Any change requires a separate compliance review.

---

## 1. PHI Guard Script

```javascript
(function () {
  try {
    if (location.pathname === '/book/entry' && location.search) {
      window.__MWC_BOOK_ENTRY_SEARCH__ = location.search;
    }
    if (location.pathname.indexOf('/book/') === 0 && (location.search || location.hash)) {
      history.replaceState(null, '', location.pathname);
    }
  } catch (e) { /* no-op */ }
})();
```

**Purpose:** Strip query string + hash from any `/book/*` URL BEFORE analytics load, so `page_location` never carries PII/PHI. For `/book/entry` only, preserve search string in memory so React can verify the WP handoff token after the URL is sanitized. Runs synchronously in `<head>`.

---

## 2. GTM Deferred Load Script

```javascript
window.dataLayer = window.dataLayer || [];
(function () {
  var GTM_ID = 'GTM-5X9DB23T';
  var _gtmLoaded = false;
  function loadGTM() {
    if (_gtmLoaded) return;
    _gtmLoaded = true;
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',GTM_ID);
  }
  // Defer GTM until first interaction or 5s — mirrors GA4 load strategy
  ['click','scroll','keydown','touchstart','mousemove'].forEach(function(evt) {
    document.addEventListener(evt, loadGTM, { once: true, passive: true, capture: true });
  });
  setTimeout(loadGTM, 5000);
})();
```

**Purpose:** GTM-5X9DB23T deferred until first user interaction or 5s. Zero TBT impact on Core Web Vitals.

---

## 3. GA4 + Google Ads Deferred Load Script

**GA4 ID:** G-286547777  
**Google Ads ID:** AW-954193072  
**Purpose:** GA4 + Ads loaded after window.load / first interaction. Healthcare compliance: redacts ad data on sensitive paths (`/book/`, `/quiz`, `/ed`, `/wl`).

---

## 4. Microsoft Clarity Deferred Script

**Clarity ID:** `%VITE_CLARITY_PROJECT_ID%` (env-gated, prod-only)  
**Purpose:** Deferred session recording. Only loads on prod hosts. `maskAllInputs: true` for HIPAA-adjacent compliance.

---

## Frozen Files
- `index.html` — ALL `<script>` tags in `<head>`
- `src/integrations/` — Supabase generated types (ENTIRE DIRECTORY)
- `src/components/ui/` — shadcn/Radix component library (ENTIRE DIRECTORY)
- `vercel.json` — routing config (requires BEHAVIOR_CHANGE tag)

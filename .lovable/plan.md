Root cause found: the published site’s `<head>` PHI guard strips every `/book/*` query string before React mounts. It saves the original query in `window.__MWC_BOOK_ENTRY_SEARCH__`, but `BookEntry` only reads `useSearchParams()`, so React sees no `t` and no `debug=1`, then silently redirects to `/`.

Plan:

1. Update `BookEntry` to read the preserved handoff query
   - Prefer `window.__MWC_BOOK_ENTRY_SEARCH__` when present.
   - Fall back to the current URL query for local/dev cases.
   - Parse both `t` and `debug=1` from that effective query.

2. Tighten diagnostics without leaking the token
   - Add production-safe `console.warn/error` for handoff failures.
   - Log only safe metadata: reason, token present, token length, host, debug mode, and edge response status if available.
   - Never log the full token or identity payload in the console.

3. Improve failure behavior
   - If `debug=1`, keep rendering the debug panel instead of redirecting.
   - If not debug mode and exchange fails, send the user to `/book/lets-talk?handoff=<reason>` instead of the homepage.
   - Keep the successful path unchanged: valid token → seed booking store → `/book/symptom`.

4. Validate after implementation
   - Open `/book/entry?t=fake&debug=1`: it should show diagnostics, not homepage.
   - Open the real token URL with `debug=1`: it should either exchange successfully or show the exact failure reason.
   - Confirm `wp-token-exchange` receives requests once the query is read correctly.

No database changes are needed. WP redirect changes are not needed for this specific bug.
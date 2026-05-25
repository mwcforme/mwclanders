## Goal

Provide a hardened Fluent Forms → `lead-intake` PHP snippet with rich, greppable debug logging at every step, so any failure (token mismatch, field mapping, non-200 response, missing `funnel_url`, redirect filter not firing) is obvious from `wp-content/debug.log`.

## What the snippet will log

Every log line prefixed `[MWC-INTAKE]` + a per-submission request ID (8-char hex) so you can trace one submission end-to-end in the log.

1. **Hook fired** — entry id, form id, form title
2. **Form gate** — whether form id matched `$TARGET_FORM_IDS` (skip vs proceed)
3. **Raw form data** — `print_r` of `$formData` keys + values (so you can confirm field names like `names`, `phone`, `email`)
4. **Mapped payload** — final JSON body before POST, with token presence check (`MWC_INTAKE_TOKEN` defined? length? first/last 4 chars only — never log full secret)
5. **Endpoint URL** being called
6. **HTTP response** — status code, full body, `wp_remote_retrieve_headers`
7. **WP_Error path** — full error message if `is_wp_error($response)`
8. **Parsed response** — `capture_id`, `crm_contact_id`, `funnel_url` (or missing)
9. **Redirect decision** — whether filter was registered, what URL will be used
10. **Filter invocation** — log inside the `fluentform/submission_confirmation` filter so you know it actually ran (common failure: Fluent's confirmation settings override it)

## Safety / config

- Wraps everything in `try/catch` so a logging bug never breaks form submission
- Only logs when `WP_DEBUG` is true OR a new `MWC_INTAKE_DEBUG` constant is defined (so you can leave it in prod and toggle via wp-config)
- Logs token **fingerprint only** (`strlen` + first4…last4), never the secret itself
- Adds a `X-Request-Id` header on the POST so the same id appears in Supabase edge logs → you can correlate WP log line with Supabase log line in one search

## Deliverable

A single PHP snippet (in chat, not committed to the repo) you can paste into WPCode replacing the current one. Plus a 3-line "how to read the logs" cheat sheet:

- `tail -f wp-content/debug.log | grep MWC-INTAKE`
- Grep the request id in Supabase edge function logs to see the matching server-side trace
- Common signatures: `token_fingerprint=…` mismatch, `http_code=401`, `funnel_url=MISSING`, `filter_fired=NO`

No project code changes — this is a WordPress-side artifact only.
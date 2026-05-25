# Runbook: Form Redirect Broken (WordPress → Booking Funnel)

**Service:** WordPress form → lead-intake → token → `/book/entry?t=TOKEN`
**SLO:** Token exchange latency < 500ms P95 (SLO-4)
**Severity:** P1 — members cannot enter booking funnel from WordPress

---

## Flow Recap

```
WordPress Fluent Form submit
  → PHP webhook → lead-intake (Supabase edge)
    → GHL contact upsert
    → wp_intake_tokens INSERT (15-min token)
    → funnel_url returned to PHP
  → WordPress redirects browser to /book/entry?t=TOKEN
    → wp-token-exchange edge function
      → token validated, marked used
      → identity seeded into booking store
        → redirect to /book/symptom
```

---

## Symptoms

- User submits WordPress form but lands on error page instead of booking funnel
- Token URL fails with 404 or 410 error
- `wp_intake_tokens` table has rows with `used = false` that are hours old
- lead-intake returns `ok: true` but no `funnel_url` in response

---

## Step 1: Check lead-intake response

Examine recent lead-intake edge function logs in Supabase Dashboard:
- Is `token insert failed` warning present?
- Is `funnel_url` being returned in the response?

---

## Step 2: Check wp_intake_tokens

```bash
# Check recent tokens (requires service role — use Supabase dashboard SQL editor)
SELECT id, token, used, expires_at, created_at, first_name
FROM wp_intake_tokens
ORDER BY created_at DESC
LIMIT 10;
```

- If `used = true`: token was already consumed (replay)
- If `expires_at < now()`: token expired before user clicked (> 15 min elapsed)
- If no rows: token insert is failing

---

## Step 3: Test token exchange directly

```bash
# First, get a valid unused token from the DB (service role)
# Then test wp-token-exchange:
TOKEN="<token-from-db>"
curl -s "https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/wp-token-exchange" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" | jq .
```

Expected:
```json
{
  "ok": true,
  "firstName": "...",
  "lastName": "...",
  "phone": "...",
  "email": "...",
  "contactId": "...",
  "location": "..."
}
```

Error responses:
- `404` = token not found (DB issue or wrong token)
- `410` = token used or expired (correct behavior — user already completed flow)
- `500` = internal error (check Supabase edge function logs)

---

## Step 4: Check WordPress PHP webhook

In the WordPress admin:
1. Navigate to Fluent Forms → Integration Settings
2. Check the webhook URL is: `https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/lead-intake`
3. Check the `x-intake-token` header matches the `LEAD_INTAKE_TOKEN` secret

---

## Step 5: Check BookEntry component

If tokens are valid but the React app is erroring on entry:
1. Check browser console at `/book/entry?t=TOKEN`
2. Look for errors in wp-token-exchange fetch call
3. Check `src/pages/BookEntry.tsx` for any changes in recent commits

---

## Step 6: Extend token expiry for affected users

If a user's token expired before they could use it, have them resubmit the WordPress form (which issues a new token).

There is no manual token extension — by design, tokens expire after 15 minutes for security.

---

## Recovery Verification

1. Submit a test form on the WordPress site
2. Confirm redirect to `/book/entry?t=TOKEN` within a few seconds
3. Confirm `/book/symptom` loads with name/phone pre-populated
4. Check `wp_intake_tokens` — row should show `used = true`

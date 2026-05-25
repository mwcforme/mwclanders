# Runbook: GHL Integration Failure

**Service:** GoHighLevel CRM integration — lead forwarding, appointment booking
**SLO:** Lead intake success rate > 98% (SLO-2)
**Severity:** P1 if lead_captures.crm_status = 'failed' > 5%; P2 if isolated failures

---

## Symptoms

- Failure alert email fires: "[MWC ALERT] GHL lead submission failed"
- `lead_captures` rows with `crm_status = 'failed'`
- Members book appointments but they don't appear in GHL
- ghl-sync returns non-200 from GHL API

---

## Step 1: Assess scope

Check failure rate:
```bash
# Via Supabase Dashboard SQL Editor:
SELECT
  crm_status,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM lead_captures
WHERE created_at > now() - interval '2 hours'
GROUP BY crm_status;
```

- `pending` = normal (waiting for sync)
- `synced` = success
- `failed` = GHL forward failed (lead still in DB — not lost)

---

## Step 2: Check GHL API status

```bash
# Check GHL status page
open https://status.gohighlevel.com/

# Test GHL API health
# GHL_PIT_TOKEN from GHL → Settings → Integrations → Private Integration Tokens
curl -s "https://services.leadconnectorhq.com/calendars/1Cfy5JnO2A4ggiZlMVvX/free-slots?startTime=2026-01-01&endTime=2026-12-31&timezone=America/New_York" \
  -H "Authorization: Bearer $GHL_PIT_TOKEN" \
  -H "Version: 2021-04-15" | head -20
```

---

## Step 3: Check edge function logs

In Supabase Dashboard → Edge Functions → lead-intake → Logs:
- Look for GHL error responses (4xx = bad request, 5xx = GHL down, 429 = rate limited)
- Check `request_id` field to correlate with specific failures

---

## Step 4: Manually re-submit failed leads

For each `capture_id` with `crm_status = 'failed'`:

```bash
# Get failed leads
curl -s "https://lapvqhmmgeduuedleyhf.supabase.co/rest/v1/lead_captures?crm_status=eq.failed&select=id,name,phone,email,created_at" \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

Then manually create the GHL contact for each failed lead:
1. Go to https://app.gohighlevel.com/contacts
2. Create new contact with the data from `lead_captures`
3. Update the `crm_status` to `manually_synced` via the admin panel

---

## Step 5: GHL API key rotation

If the GHL PIT token has expired or been revoked:
1. Log into GHL → Settings → Integrations → Private Integration Tokens
2. Generate new token
3. Update `GHL_API_KEY_PROD_1` in Supabase Edge Function secrets:
   - Supabase Dashboard → Edge Functions → Secrets
   - Or: `npx supabase secrets set GHL_API_KEY_PROD_1=<new-ghl-pit-token> --project-ref lapvqhmmgeduuedleyhf`
4. Redeploy edge functions

---

## Step 6: Check ghl-proxy allowlist

If the error is 403 from ghl-proxy, the request path may not be in the ALLOW list.
Check `supabase/functions/ghl-proxy/index.ts` → `ALLOW` array.

---

## Recovery Verification

```bash
# Test live lead-intake endpoint
curl -s "https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/lead-intake" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-intake-token: [LEAD_INTAKE_TOKEN]" \
  -d '{"fullName":"Test Lead","phone":"+15551234567","consent":true,"email":"test@example.com"}' | jq .
```

Expected: `{"ok":true,"capture_id":"...","crm_contact_id":"..."}` 

---

## Escalation

- GHL Support: https://help.gohighlevel.com/
- GHL Status: https://status.gohighlevel.com/
- Internal escalation: eobrien@menswellnesscenters.com

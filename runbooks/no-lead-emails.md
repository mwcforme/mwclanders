# Runbook: No Lead Notification Emails

**Service:** SendGrid → eobrien@menswellnesscenters.com lead notifications
**Severity:** P2 — leads still captured in DB, but team not notified

---

## Flow Recap

```
lead-intake edge function
  → lead persisted to lead_captures
  → GHL contact upsert (success)
  → void sendEmail({ to: "eobrien@...", subject: "New TRT lead..." })  [fire-and-forget]
```

Also:
```
slot-monitor (every 30 min)
  → Zero-slot or stale conditions detected
  → sendEmail({ to: "eobrien@..." })
```

---

## Symptoms

- New leads visible in admin panel but no email notification
- slot-monitor alerts not being received
- Failure alerts not arriving

---

## Step 1: Check if leads are still being captured

```bash
# SUPABASE_ANON_KEY from Supabase Dashboard → Settings → API
# Lead count (anon can't read data, check via admin panel)
open https://book.menswellnesscenters.com/admin/leads
```

If leads are present in the admin panel: captures are working. Email is the issue.

---

## Step 2: Check SendGrid status and activity

1. Log into SendGrid: https://app.sendgrid.com/
2. Navigate to Activity Feed
3. Search for `eobrien@menswellnesscenters.com` as recipient
4. Check for:
   - Delivered (good)
   - Bounced (email address issue)
   - Blocked (spam filter)
   - Deferred (temporary failure)

---

## Step 3: Check SendGrid API key

```bash
# Test SendGrid API key (use key from 1Password/Supabase secrets)
curl -s "https://api.sendgrid.com/v3/user/account" \
  -H "Authorization: Bearer $SENDGRID_API_KEY" | jq .status
```

Expected: `"active"`. If expired or revoked, generate a new key.

---

## Step 4: Update SendGrid API key in Supabase secrets

If the API key needs rotation:

```bash
export SUPABASE_ACCESS_TOKEN=$(op read 'op://MWC/Supabase/access-token')  # or set from 1Password

# Set new SendGrid key
npx supabase secrets set SENDGRID_API_KEY=<new-sendgrid-key> --project-ref lapvqhmmgeduuedleyhf

# Redeploy affected functions
npx supabase functions deploy lead-intake --project-ref lapvqhmmgeduuedleyhf
npx supabase functions deploy slot-monitor --project-ref lapvqhmmgeduuedleyhf
```

---

## Step 5: Check edge function logs for email errors

In Supabase Dashboard → Edge Functions → lead-intake → Logs:
- Search for `"level":"warn"` and `"lead notify email error"`
- Look for: `{"level":"warn","fn":"lead-intake","msg":"lead notify email error",...}`

In slot-monitor logs:
- Search for `sendgrid failed`

---

## Step 6: Check sender domain

SendGrid requires verified sender domain. If `info@menswellnesscenters.com` (the from address) has issues:
1. SendGrid Dashboard → Settings → Sender Authentication
2. Verify DNS records for `menswellnesscenters.com` are still correct

---

## Step 7: Check spam/junk folder

If SendGrid shows "Delivered" but emails are missing:
- Check spam/junk folder for `eobrien@menswellnesscenters.com`
- Check if SendGrid reputation score has dropped (Dashboard → Sender Reputation)

---

## Recovery Verification

1. Submit a test lead via the booking funnel or admin
2. Check SendGrid activity feed within 2 minutes
3. Confirm email received at `eobrien@menswellnesscenters.com`

---

## Note: Lead capture is independent of email delivery

**Leads are NEVER lost due to email failures.** The `sendEmail()` call is fire-and-forget.
Every submission is persisted to `lead_captures` before any external call.
If emails are down, check the admin panel at https://book.menswellnesscenters.com/admin/leads
for all captured leads.

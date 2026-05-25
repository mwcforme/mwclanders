# Runbook: Site Down

**Service:** `book.menswellnesscenters.com`
**SLO:** 99.5% availability (SLO-1)
**Severity:** P1 — immediate response required

---

## Symptoms

- All pages returning 5xx or timing out
- Uptime Robot alert fires
- Members cannot access booking funnel

---

## Step 1: Confirm the outage

```bash
# Quick health check
curl -sI https://book.menswellnesscenters.com/ | head -5

# Check Vercel status
open https://www.vercel-status.com/
```

**Expected:** HTTP 200 with `strict-transport-security` header.
**If DNS failure:** Check Vercel domain configuration at https://vercel.com/mwclanders/men-s-wellness-centers/settings/domains

---

## Step 2: Check Vercel deployment status

1. Go to https://vercel.com/mwclanders/men-s-wellness-centers/deployments
2. Check if the latest deployment is in "Error" state
3. If yes: roll back to the previous successful deployment (click "..." → "Promote to Production")

---

## Step 3: Check if it's a Vercel platform incident

- https://www.vercel-status.com/
- If Vercel is having an incident: no action needed, wait for resolution, update status page

---

## Step 4: Check DNS

```bash
dig book.menswellnesscenters.com CNAME
# Should resolve to cname.vercel-dns.com or similar Vercel CNAME

nslookup book.menswellnesscenters.com
```

If DNS is broken, check registrar (GoDaddy/Cloudflare) for CNAME record pointing to Vercel.

---

## Step 5: Check for bad deployment (recent push)

```bash
cd /data/.openclaw/workspace/menswell
git log --oneline -5
```

If a recent commit is suspect:
```bash
# Roll back
git revert HEAD
git push origin main
# Vercel will auto-deploy the revert
```

---

## Step 6: Check if edge functions are down

```bash
# Test Supabase edge function availability
curl -s https://lapvqhmmgeduuedleyhf.supabase.co/functions/v1/ghl-proxy \
  -X OPTIONS | head -5
```

If Supabase edge functions are unavailable, check https://status.supabase.com/

---

## Recovery Verification

```bash
curl -sI https://book.menswellnesscenters.com/ | grep "200\|content-type"
# Also test the booking funnel entry:
curl -sI https://book.menswellnesscenters.com/book/symptom
```

---

## Communication

When resolved, notify eobrien@menswellnesscenters.com with:
- Duration of outage
- Root cause
- Actions taken
- Estimated affected leads

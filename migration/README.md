# MWC → Vercel + New Supabase Migration

End-to-end runbook for moving off Lovable Cloud (project `yvuwzaxnyxoejwzqfbdf`)
onto your own Supabase project and Vercel hosting.

## 0. Prereqs
- Supabase CLI: `brew install supabase/tap/supabase && supabase login`
- Access to Vercel project for `mwcforme/mwclanders`
- GHL API key + location ID handy
- `LEAD_INTAKE_TOKEN` value (current WordPress webhook secret)

## 1. Create the new Supabase project
1. Go to https://supabase.com/dashboard (logged in as `eric_obrien@hotmail.com`)
2. New project → pick a region near your users → save the **project ref**, **anon (publishable) key**, and **service role key**

## 2. Create schema
Open SQL Editor in the new project → paste contents of `migration/01-schema.sql` → Run.

## 3. (Optional) Copy `lead_captures` rows
Ask Lovable to dump current rows to CSV (`SELECT * FROM lead_captures`), then
import via the new project's Table Editor → Import CSV.
`wp_intake_tokens` are 15-min ephemeral — skip.

## 4. Deploy edge functions
```bash
./migration/02-deploy-functions.sh <NEW_PROJECT_REF>
```

## 5. Add edge-function secrets
Supabase Dashboard → Project Settings → Edge Functions → Secrets. Add:
- `GHL_API_KEY`
- `GHL_LOCATION_ID`
- `LEAD_INTAKE_TOKEN`
- (and any others your `meta-capi` / `lead-notify` functions read)

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` are auto-injected.

## 6. Update frontend env
Update `.env` (local) and Vercel env vars (Production + Preview):
```
VITE_SUPABASE_URL=https://<NEW_REF>.supabase.co
VITE_SUPABASE_PROJECT_ID=<NEW_REF>
VITE_SUPABASE_PUBLISHABLE_KEY=<new anon key>
VITE_WP_HANDOFF_SECRET=<unchanged>
```

Regenerate types:
```bash
supabase gen types typescript --project-id <NEW_REF> > src/integrations/supabase/types.ts
```

`BookEntry.tsx` is already wired to use `VITE_SUPABASE_URL` (no more hardcoded ref).

## 7. Update WordPress webhook
Fluent Forms → your form → Integrations → change webhook URL from
`https://yvuwzaxnyxoejwzqfbdf.supabase.co/functions/v1/lead-intake`
to
`https://<NEW_REF>.supabase.co/functions/v1/lead-intake`

## 8. Deploy to Vercel
Push to `main` (or `vercel --prod`). Verify env vars are present in the build.

## 9. Smoke test
1. Submit a Fluent Form on the live site
2. Check new Supabase → `lead_captures` for a new row
3. Confirm browser redirected to `/book/entry?t=...` then `/book/schedule`
4. Check `wp-token-exchange` logs in new Supabase for a 200
5. Verify the GHL contact was created/updated

## 10. Decommission
Old Lovable Cloud project will be unused. You can't delete it (Lovable-owned),
but no traffic will flow once WordPress + Vercel are switched.

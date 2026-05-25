
# Migrate to Vercel + new Supabase

Goal: move this project off Lovable Cloud (Supabase project `yvuwzaxnyxoejwzqfbdf`, which lives in a Lovable-owned org you can't access) onto a Supabase project you own under `eric_obrien@hotmail.com`, and host the frontend on Vercel.

The repo (`mwcforme/mwclanders`) already deploys to Vercel per `.ralph/AGENTS.md`, so frontend hosting is largely in place — the heavy lift is the backend cut-over.

## What needs to move

**Database (2 tables)**
- `lead_captures` — lead form submissions
- `wp_intake_tokens` — 15-min single-use handoff tokens
- Both are service-role only (no end-user RLS rows to migrate).

**Edge functions (7)**
- `lead-intake` — WordPress/Fluent Forms webhook → creates lead + token
- `wp-token-exchange` — `/book/entry` exchanges token for identity
- `ghl-proxy` — all GoHighLevel API traffic
- `ghl-sync`, `ghl-sync-validate` — admin sync tools
- `lead-notify` — lead notifications
- `meta-capi` — Meta Conversions API

**Secrets (must be re-added on new project)**
- `GHL_API_KEY`, `GHL_LOCATION_ID` (+ stage variants if still used)
- `LEAD_INTAKE_TOKEN` (WordPress webhook shared secret)
- Any Meta CAPI / notify secrets

**Frontend hardcoded references to swap**
- `src/pages/book/BookEntry.tsx` line 50: `TOKEN_EXCHANGE_URL` hardcodes `https://yvuwzaxnyxoejwzqfbdf.supabase.co/...` — must use `import.meta.env.VITE_SUPABASE_URL`
- `.env` values for `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- WordPress site's webhook URL pointing at the current `lead-intake` function

## Migration steps

1. **Create new Supabase project** in your own org (`eric_obrien@hotmail.com`) — pick a region close to your users.

2. **Recreate schema** — I'll generate one SQL file you run in the new Supabase SQL editor:
   - `lead_captures` table + RLS (service-role only)
   - `wp_intake_tokens` table + RLS + the `gen_random_bytes(32)` default
   - Enable `pgcrypto` extension

3. **Migrate data (optional)** — `wp_intake_tokens` is ephemeral (15-min TTL) so skip. For `lead_captures`, export from Lovable Cloud (I can do that from here via `read_query` → CSV) and import into the new project.

4. **Deploy edge functions** — copy all 7 functions from `supabase/functions/` into the new project using the Supabase CLI (`supabase functions deploy <name> --project-ref <new-ref>`). I'll write a one-shot deploy script.

5. **Add secrets** to the new Supabase project (Settings → Edge Functions → Secrets): GHL keys, LEAD_INTAKE_TOKEN, etc.

6. **Switch the frontend codebase**:
   - Replace `.env` values with new project's URL/anon key/project ID
   - Fix `BookEntry.tsx` to use `import.meta.env.VITE_SUPABASE_URL` instead of hardcoded URL
   - Regenerate `src/integrations/supabase/types.ts` against the new project
   - Remove Lovable Cloud integration from this Lovable project (so it stops trying to manage `yvuwzaxnyxoejwzqfbdf`)

7. **Update Vercel**:
   - Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_WP_HANDOFF_SECRET` to Vercel env vars (Production + Preview)
   - Trigger a redeploy

8. **Update WordPress** — change Fluent Forms webhook URL from `https://yvuwzaxnyxoejwzqfbdf.supabase.co/functions/v1/lead-intake` to the new project's URL.

9. **Smoke test** — submit a Fluent Form, confirm token exchange works, confirm GHL contact is created, confirm `/book/schedule` loads.

10. **Decommission** — once verified for a few days, the old Lovable Cloud project can be left to age out (you can't delete it; it's Lovable-managed).

## Things I need from you before starting

1. **Have you created the new Supabase project yet?** If yes, share the project ref (`xxxxx.supabase.co`) and anon key. If no, do that first.
2. **Do you want to migrate existing `lead_captures` rows**, or start clean on the new project?
3. **Confirm you have the Supabase CLI installed locally** (needed to deploy edge functions to your own project — Lovable can't deploy to a Supabase project it doesn't own). If not, you'll install it: `brew install supabase/tap/supabase`.
4. **Are you keeping this Lovable project** (frontend dev continues here, deploys to Vercel) or moving development entirely off Lovable too?

Once you answer those, I'll move to build mode and execute steps 2, 4, 6 (schema SQL, deploy script, codebase edits) in one pass.

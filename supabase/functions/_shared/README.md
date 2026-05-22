# Edge Function Shared Utilities

All MWC edge functions import from this `_shared/` directory.
Never duplicate CORS headers, GHL config, or Supabase client setup in individual functions.

## Modules

### cors.ts
- `corsHeaders` — CORS headers for all endpoints
- `corsResponse()` — 200 OK for OPTIONS preflight
- `jsonResponse(status, data)` — JSON response with CORS headers

### ghlEnv.ts
- `detectEnv(req, hint?)` — detect prod vs stage from request origin/referer
- `getGhlCreds(env)` — returns `{ apiKey, locationId }`, throws if env vars missing
- `tryGetGhlCreds(env)` — returns `GhlCreds | null` (graceful, no throw)
- `GHL_API_BASE`, `GHL_API_VERSION`, `PROD_LOCATION_ID` — shared constants

### supabaseAdmin.ts
- `createAdminClient()` — service role Supabase client (no session, no refresh)

## Adding a new edge function

1. Import shared utils instead of duplicating:
   ```typescript
   import { corsHeaders, jsonResponse, corsResponse } from "../_shared/cors.ts";
   import { detectEnv, tryGetGhlCreds } from "../_shared/ghlEnv.ts";
   import { createAdminClient } from "../_shared/supabaseAdmin.ts";
   ```
2. Add to `supabase/config.toml`:
   ```toml
   [functions.your-function-name]
   verify_jwt = false
   ```
3. If writing new event_type values to `booking_event_log`, add them to the
   CHECK constraint via a new migration in `supabase/migrations/`.

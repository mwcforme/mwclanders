# AGENTS.md — MWC Booking Funnel

## Project
- Stack: Vite + React + TypeScript + Tailwind + shadcn/ui + Supabase
- Package manager: npm
- Working dir: /data/.openclaw/workspace/menswell
- Target: src/ (exclude src/integrations/**, src/components/ui/**)
- Live URL: https://book.menswellnesscenters.com
- Repo: https://github.com/mwcforme/mwclanders
- Deployment: Vercel (main → production, staging → bookstage.menswellnesscenters.com)

## Backpressure (every iteration, in order)
1. npm run lint -- --max-warnings 0
2. npx tsc --noEmit
3. npm test -- --run --coverage
4. npm run build
Do NOT push if any step fails.

## Metric commands
- LOC: cloc src --exclude-dir=integrations,ui --json
- Bundle: ls -la dist/assets/*.js 2>/dev/null
- Dead code: npx knip
- Coverage: cat coverage/coverage-summary.json 2>/dev/null

## Architecture — critical rules
- All GHL API calls go through the `ghl-proxy` Supabase edge function. Never call GHL directly from the client.
- All Meta CAPI events go through the `meta-capi` Supabase edge function. Never call Meta API directly.
- PHI (name, phone, email) must NEVER appear in: URLs, query strings, dataLayer pushes, GA4 events, Sentry breadcrumbs, or console.log.
- Booking funnel state lives in Zustand (`useBookingStore`). Do not use URL params to pass identity between funnel steps.
- Environment detection is hostname-based (`src/lib/env.ts`). Never hardcode "prod" or "stage" strings elsewhere.
- `src/data/copy.ts` is the single source of truth for all CTA labels and offer copy. Never hardcode CTA text in components.
- The word "free" is banned in user-facing copy. Use "no-cost", "no obligation", or "at no charge".

## Funnel route map
- `/trt` → TRT landing page (primary paid traffic destination)
- `/ed` → ED landing page
- `/wl` → Weight loss landing page
- `/` → Homepage (all three services)
- `/book/symptom` → Step 1: symptom selection
- `/book/duration` → Step 2: how long (urgency tier)
- `/book/location` → Step 3: clinic picker (skipped if location set in hero form)
- `/book/schedule` → Step 4: GHL calendar
- `/book/confirmed` → Post-booking confirmation
- `/book/lets-talk` → Phone/text fallback ("Something else" path + booking failure fallback)

## Key files — know these before touching anything
- `src/data/copy.ts` — all CTA/offer copy
- `src/data/testimonials.ts` — Google review cards (order matters for CRO)
- `src/lib/attribution.ts` — UTM/gclid/fbclid 90-day cookie
- `src/lib/capi.ts` — Meta CAPI client helper
- `src/hooks/useAnalytics.ts` — GA4 funnel events + scroll depth
- `src/domain/booking/bookingStore.ts` — Zustand booking state
- `src/domain/booking/bookingEntry.ts` — LP form → funnel entry point
- `src/lib/env.ts` — prod/stage detection (hostname-based)
- `supabase/functions/` — edge functions (ghl-proxy, meta-capi, lead-intake, etc.)

## House rules
- No any. No @ts-ignore. No unjustified as casts.
- Components <= 150 LOC. Functions <= 30 LOC. Cyclomatic complexity <= 8.
- Pure functions where I/O not required.
- Supabase access only via src/services/<entity>.ts
- Zod-validate every external boundary.
- SRP > OCP > LSP > ISP > DIP.
- Do not touch: src/integrations/**, src/components/ui/**, generated types.
- MWC brand voice: "Men's Wellness Centers", "members" not "patients", no em-dashes.
- No "free" in user-facing copy (TCPA/FTC compliance).
- All landing page sections must be added to BOTH the relevant LP page AND mirrored to ED/WL pages if applicable.

## Do not change without explicit instruction
- TCPA disclaimer copy or checkbox behavior (legal/compliance review required)
- GHL workflow-touching fields: `urgencyTier`, `mwc_symptom`, `mwc_urgency_tier`
- Hero form field set (name/phone/location/TCPA) — ops dependencies
- `supabase/functions/` — deploy separately, not via Vite build
- `src/lib/ghlCalendars.ts` — calendar IDs are production credentials

## Learnings
(appended by agent)

#!/usr/bin/env bash
# Deploys all edge functions to the NEW Supabase project.
#
# Prereqs:
#   1. Install Supabase CLI: brew install supabase/tap/supabase
#   2. Login:                supabase login
#   3. Set the new project ref below (or pass as $1)
#
# Usage:  ./migration/02-deploy-functions.sh <new-project-ref>

set -euo pipefail

PROJECT_REF="${1:-${NEW_SUPABASE_PROJECT_REF:-}}"
if [[ -z "$PROJECT_REF" ]]; then
  echo "ERROR: pass new project ref as arg or set NEW_SUPABASE_PROJECT_REF" >&2
  exit 1
fi

FUNCTIONS=(
  lead-intake
  wp-token-exchange
  ghl-proxy
  ghl-sync
  ghl-sync-validate
  lead-notify
  meta-capi
)

cd "$(dirname "$0")/.."

for fn in "${FUNCTIONS[@]}"; do
  echo "──── Deploying $fn ────"
  supabase functions deploy "$fn" --project-ref "$PROJECT_REF" --no-verify-jwt
done

echo
echo "Done. Now set secrets in the Supabase dashboard:"
echo "  - GHL_API_KEY"
echo "  - GHL_LOCATION_ID"
echo "  - LEAD_INTAKE_TOKEN"
echo "  - (plus any Meta CAPI / notify secrets you use)"

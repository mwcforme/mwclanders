/**
 * Runtime environment detection.
 *
 * PRODUCTION = the live custom domain (book.menswellnesscenters.com).
 * Everything else (lovable preview, menswell.lovable.app, localhost) = STAGE.
 *
 * Manual override: append `?env=prod` (or `?env=stage`) to any URL to force
 * an env. The choice is persisted to localStorage as `mwc_env_override` so
 * subsequent navigations stay on the chosen env. Use `?env=auto` to clear.
 *
 * The same edge functions are deployed once and pick the matching GHL
 * credentials + location + calendars based on either the `__env` body hint
 * or the request `Origin` header.
 */

const PROD_HOSTS = new Set<string>([
  "book.menswellnesscenters.com",
  "menswellnesscenters.com",
  "www.menswellnesscenters.com",
]);

const STORAGE_KEY = "mwc_env_override";

function readOverride(): "prod" | "stage" | null {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("env");
    if (q === "prod" || q === "stage") {
      window.localStorage.setItem(STORAGE_KEY, q);
      return q;
    }
    if (q === "auto") {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "prod" || stored === "stage") return stored;
  } catch {
    /* ignore */
  }
  return null;
}

function detect(): "prod" | "stage" {
  if (typeof window === "undefined") return "stage";
  const override = readOverride();
  if (override) return override;
  // Only the live custom domain hits production GHL. Everything else
  // (preview, lovable.app, localhost) routes to the stage sandbox.
  // Append `?env=prod` to any URL to force prod from a non-prod host.
  try {
    const host = window.location.hostname.toLowerCase();
    if (PROD_HOSTS.has(host)) return "prod";
  } catch {
    /* ignore */
  }
  return "stage";
}

export const APP_ENV: "prod" | "stage" = detect();
export const IS_PROD = APP_ENV === "prod";
export const IS_STAGE = APP_ENV === "stage";

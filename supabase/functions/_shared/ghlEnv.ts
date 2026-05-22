/**
 * GHL environment detection and credentials.
 * Single source of truth — used by ghl-proxy, lead-intake, ghl-sync.
 */

export type AppEnv = "prod" | "stage";

export const GHL_API_BASE = "https://services.leadconnectorhq.com";
export const GHL_API_VERSION = "2021-07-28";
export const PROD_LOCATION_ID = "Ghstz8eIsHWLeXek47dk";

const PROD_HOSTS = new Set<string>([
  "book.menswellnesscenters.com",
  "menswellnesscenters.com",
  "www.menswellnesscenters.com",
]);

/**
 * Detect prod vs stage from request origin/referer, with optional override hint.
 */
export function detectEnv(req: Request, hint?: unknown): AppEnv {
  if (hint === "prod" || hint === "stage") return hint as AppEnv;
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (PROD_HOSTS.has(host)) return "prod";
  } catch { /* ignore */ }
  return "stage";
}

export interface GhlCreds {
  apiKey: string;
  locationId: string;
}

/**
 * Returns GHL API credentials for the given environment.
 * Throws if required env vars are missing.
 */
export function getGhlCreds(env: AppEnv): GhlCreds {
  if (env === "stage") {
    const apiKey = Deno.env.get("GHL_API_KEY_STAGE_1") ?? Deno.env.get("GHL_API_KEY_STAGE");
    const locationId = Deno.env.get("GHL_LOCATION_ID_STAGE_1") ?? Deno.env.get("GHL_LOCATION_ID_STAGE") ?? "";
    if (!apiKey) throw new Error("GHL_API_KEY_STAGE not configured");
    return { apiKey, locationId };
  }
  const apiKey = Deno.env.get("GHL_API_KEY");
  const locationId = Deno.env.get("GHL_LOCATION_ID") ?? PROD_LOCATION_ID;
  if (!apiKey) throw new Error("GHL_API_KEY not configured");
  return { apiKey, locationId };
}

/**
 * Returns GHL API credentials, returning null instead of throwing if missing.
 * Use this when the caller wants to handle missing creds gracefully.
 */
export function tryGetGhlCreds(env: AppEnv): GhlCreds | null {
  try {
    return getGhlCreds(env);
  } catch {
    return null;
  }
}

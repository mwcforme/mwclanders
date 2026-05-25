/**
 * GHL credentials helper — prod only.
 * Stage environment removed 2026-05-25.
 */

export type AppEnv = "prod";

export const GHL_API_BASE = "https://services.leadconnectorhq.com";
export const GHL_API_VERSION = "2021-07-28";

export interface GhlCreds {
  apiKey: string;
  locationId: string;
}

/** Always returns prod credentials. __env hint ignored. */
export function detectEnv(_req: Request, _hint?: unknown): AppEnv {
  return "prod";
}

export function tryGetGhlCreds(_env: AppEnv = "prod"): GhlCreds | null {
  const apiKey = Deno.env.get("GHL_API_KEY_PROD_1") ?? Deno.env.get("GHL_API_KEY");
  const locationId = Deno.env.get("GHL_LOCATION_ID_PROD_1") ?? Deno.env.get("GHL_LOCATION_ID") ?? "";
  if (!apiKey) return null;
  return { apiKey, locationId };
}

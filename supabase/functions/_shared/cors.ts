/**
 * Shared CORS headers for all MWC edge functions.
 * Import as: import { corsHeaders, corsResponse, corsHeadersFor } from "../_shared/cors.ts";
 *
 * SECURITY: Do not use corsHeaders directly for browser-facing endpoints.
 * Use corsHeadersFor(req) to return origin-specific headers.
 */

const ALLOWED_ORIGINS = [
  "https://book.menswellnesscenters.com",
  "https://menswellnesscenters.com",
  "https://www.menswellnesscenters.com",
];

/**
 * Returns CORS headers with the specific requesting origin if it's allowed,
 * or null origin for disallowed/non-browser requests.
 */
export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-intake-token, x-request-id",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

/**
 * Legacy wildcard headers — kept for internal/cron-only functions that are
 * never called from a browser. Browser-facing functions should use corsHeadersFor().
 * @deprecated Use corsHeadersFor(req) for browser-facing endpoints.
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-intake-token, x-request-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
} as const;

export const corsResponse = (req?: Request) => {
  const headers = req ? corsHeadersFor(req) : corsHeaders;
  return new Response("ok", { headers });
};

export const jsonResponse = (status: number, data: unknown, req?: Request): Response => {
  const headers = req ? corsHeadersFor(req) : corsHeaders;
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
};

/**
 * Shared CORS headers for all MWC edge functions.
 * Import as: import { corsHeaders, corsResponse } from "../_shared/cors.ts";
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-intake-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

export const corsResponse = () => new Response("ok", { headers: corsHeaders });

export const jsonResponse = (status: number, data: unknown): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

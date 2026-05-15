import { supabase } from "@/integrations/supabase/client";
import { APP_ENV } from "@/lib/env";

export interface GHLRequest {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  injectLocationId?: boolean;
}

export interface GHLResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
}

/**
 * Single entry-point for all GoHighLevel calls.
 * The PIT and locationId stay server-side in the `ghl-proxy` edge function.
 * `__env` tells the proxy which credentials/location to use (stage vs prod).
 */
export async function ghl<T = unknown>(req: GHLRequest): Promise<GHLResponse<T>> {
  const { data, error } = await supabase.functions.invoke<GHLResponse<T>>("ghl-proxy", {
    body: { ...req, __env: APP_ENV },
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Empty response from ghl-proxy");
  return data;
}

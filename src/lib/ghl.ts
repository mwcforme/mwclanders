const getSupabase = () => import("@/integrations/supabase/client").then(m => m.supabase);

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
 * Always routes to production GHL credentials via ghl-proxy edge function.
 */
export async function ghl<T = unknown>(req: GHLRequest): Promise<GHLResponse<T>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.functions.invoke<GHLResponse<T>>("ghl-proxy", {
    body: { ...req },
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Empty response from ghl-proxy");
  return data;
}

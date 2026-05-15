import { z } from "zod";

/**
 * Runtime-validated environment configuration.
 * Fails fast at module load with a clear message if anything is misconfigured.
 */
const EnvSchema = z.object({
  VITE_CLARITY_PROJECT_ID: z.string().min(1).optional(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("[env] Invalid environment configuration:", parsed.error.flatten());
  throw new Error("Invalid environment configuration. See console for details.");
}

export const env = parsed.data;

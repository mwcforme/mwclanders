// Untyped wrapper around the supabase client.
// Used by code that references tables not present in the auto-generated
// Database types (e.g. tables that live in the legacy/external Supabase
// project). Casting to `any` lets the TS build pass while still using the
// real runtime client.
import { supabase as typedSupabase } from "./client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = typedSupabase;

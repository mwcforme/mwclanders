/**
 * useUtmFields — returns current UTM / click-id attribution as a plain record.
 *
 * Reads from the already-initialised mwc_attr_v2 cookie (written at app boot
 * in main.tsx via initAttribution). Falls back to the live URL params so the
 * values are always fresh on first page load even before the cookie is written.
 *
 * Usage: spread the returned object into hidden <input> elements inside any
 * lead-capture form so pixel / tag-manager scrapers can read UTM values from
 * the DOM on form submit.
 */
import { useMemo } from "react";
import { getAttribution, ATTRIBUTION_KEYS } from "@/lib/attribution";

export type UtmFields = Partial<Record<typeof ATTRIBUTION_KEYS[number], string>>;

export function useUtmFields(): UtmFields {
  // memo — re-reads only on mount; attribution doesn't change mid-session
  return useMemo(() => getAttribution(), []);
}

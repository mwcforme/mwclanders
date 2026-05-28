/**
 * useSlotFetching — fetches available appointment slots from Supabase.
 * Extracted from BookSchedule.tsx (OPT 2).
 *
 * Handles:
 * - Auto-refresh every 60 seconds
 * - Refresh on window focus
 * - BUG 4 fix: clears stale slotsByDay before each new fetch
 */
import { useEffect, useState } from "react";
import { addDaysInTimeZone } from "@/lib/etDate";
import { TIMEZONE } from "@/lib/ghlCalendars";

// ─── Private Supabase fetcher ─────────────────────────────────────────────────

const getSupabase = () => import("@/integrations/supabase/legacy").then(m => m.supabase);

async function fetchCachedSlots(
  calendarId: string,
  start: Date,
  end: Date,
): Promise<Record<string, string[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("ghl_free_slots")
    .select("slot_start")
    .eq("calendar_id", calendarId)
    .gte("slot_start", start.toISOString())
    .lt("slot_start", end.toISOString())
    .order("slot_start", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  const out: Record<string, string[]> = {};
  for (const row of data || []) {
    const iso = row.slot_start as string;
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date(iso));
    (out[key] ||= []).push(iso);
  }
  return out;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSlotFetchingResult {
  slotsByDay: Record<string, string[]>;
  loading: boolean;
  loadError: string | null;
}

/**
 * @param calendarId  GHL calendar ID, or null to skip fetching.
 * @param location    Location key — used as a dependency trigger on location change.
 * @param weekStart   The Monday (or Sunday) start of the week to fetch.
 */
export function useSlotFetching(
  calendarId: string | null,
  location: string | null,
  weekStart: Date,
): UseSlotFetchingResult {
  const [slotsByDay, setSlotsByDay] = useState<Record<string, string[]>>({});
  const [loading, setLoading]       = useState(false);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    if (!calendarId) return;
    let cancelled = false;
    const fetchWeek = async () => {
      // BUG 4 fix: reset stale data immediately so the UI doesn't show last week's slots
      setSlotsByDay({});
      setLoading(true);
      setLoadError(null);
      try {
        const end = addDaysInTimeZone(weekStart, 7, TIMEZONE);
        const data = await fetchCachedSlots(calendarId, weekStart, end);
        if (!cancelled) setSlotsByDay(data);
      } catch {
        if (!cancelled) setLoadError("Couldn't load slots. Tap to retry.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWeek();
    const interval = window.setInterval(() => setRefreshNonce(n => n + 1), 60_000);
    const onFocus = () => setRefreshNonce(n => n + 1);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [calendarId, location, weekStart, refreshNonce]);

  return { slotsByDay, loading, loadError };
}

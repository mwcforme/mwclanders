/**
 * useWeekSchedule — all scheduling state for the BookSchedule page.
 *
 * SRP: Extracts week navigation, day cell building, slot filtering,
 *      next-available detection from the 430-line BookSchedule component.
 *
 * BookSchedule becomes a thin orchestration layer; this hook owns data.
 */
import { useState, useEffect, useMemo } from "react";
import { type LocationKey } from "@/lib/ghlCalendars";
import { CENTER_CALENDARS, TIMEZONE } from "@/lib/ghlCalendars";
import { useSlotFetching } from "@/hooks/useSlotFetching";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import {
  addDaysInTimeZone, isSundayInTimeZone,
  ymdInTimeZone, dateFromYmdInTimeZone,
} from "@/lib/etDate";
import {
  DOW_SHORT, MONTHS_SHORT, ymd,
  dropPastAndOutOfHours, fmtTimeParts, groupSlots,
  type DayCell,
} from "@/lib/scheduleUtils";

export interface NextAvailable {
  idx: number;
  iso: string;
  label: string;
}

export function useWeekSchedule(location: string | null | undefined) {
  const cal = location && location in CENTER_CALENDARS
    ? CENTER_CALENDARS[location as LocationKey]
    : null;

  // ── Week navigation ────────────────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState(() => {
    const todayYmdET = ymdInTimeZone(new Date(), TIMEZONE);
    return dateFromYmdInTimeZone(todayYmdET, TIMEZONE);
  });

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysInTimeZone(weekStart, i, TIMEZONE)),
    [weekStart],
  );

  function goNextWeek() { setWeekStart(w => addDaysInTimeZone(w, 7, TIMEZONE)); }

  function goPrevWeek() {
    const prev = addDaysInTimeZone(weekStart, -7, TIMEZONE);
    const todayYmd = ymdInTimeZone(new Date(), TIMEZONE);
    const prevEnd  = ymdInTimeZone(addDaysInTimeZone(prev, 6, TIMEZONE), TIMEZONE);
    if (prevEnd < todayYmd) return; // all past
    setWeekStart(prev);
  }

  // ── Slot fetching ──────────────────────────────────────────────────────────
  const { slotsByDay, loading, loadError } = useSlotFetching(
    cal?.calendarId ?? null,
    location ?? null,
    weekStart,
  );

  // ── Day cells ──────────────────────────────────────────────────────────────
  const dayCells: DayCell[] = useMemo(() => days.map(d => {
    const key      = ymd(d);
    const closed   = isSundayInTimeZone(d, TIMEZONE);
    const rawSlots = slotsByDay[key] || [];
    const available = dropPastAndOutOfHours(d, rawSlots);
    return {
      date: d,
      slotsLeft: available.length,
      full: !loading && !closed && rawSlots.length > 0 && available.length === 0,
      closed,
    };
  }), [days, slotsByDay, loading]);

  const firstAvailableIdx = dayCells.findIndex(d => !d.full && !d.closed && d.slotsLeft > 0);

  // ── Slot selection ─────────────────────────────────────────────────────────
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [selectedSlot,   setSelectedSlot]   = useState<string | null>(null);
  const [reviewOpen,     setReviewOpen]     = useState(false);

  // Auto-select first available day once slots load
  useEffect(() => {
    if (selectedDayIdx === null && firstAvailableIdx !== -1 && !loading) {
      setSelectedDayIdx(firstAvailableIdx);
    }
  }, [firstAvailableIdx, loading, selectedDayIdx]);

  // Open review sheet + fire analytics when slot picked
  useEffect(() => {
    if (selectedSlot) {
      setReviewOpen(true);
      trackFunnelEvent("time_selected", { location: location ?? "" });
    }
  }, [selectedSlot, location]);

  // ── Derived time slots for selected day ───────────────────────────────────
  const selectedDay = selectedDayIdx !== null ? dayCells[selectedDayIdx] : null;
  const rawTimes    = selectedDayIdx !== null ? slotsByDay[ymd(days[selectedDayIdx])] || [] : [];
  const filteredTimes = selectedDay ? dropPastAndOutOfHours(selectedDay.date, rawTimes) : [];
  const timeSlots = filteredTimes.map(iso => ({ iso, ...fmtTimeParts(iso) }));
  const groups    = useMemo(() => groupSlots(timeSlots), [timeSlots]);

  // ── Next available label ───────────────────────────────────────────────────
  const nextAvailable: NextAvailable | null = useMemo(() => {
    if (firstAvailableIdx === -1) return null;
    const d     = dayCells[firstAvailableIdx];
    const key   = ymd(days[firstAvailableIdx]);
    const raw   = slotsByDay[key] || [];
    const avail = dropPastAndOutOfHours(d.date, raw);
    if (!avail.length) return null;
    const { display, meridiem } = fmtTimeParts(avail[0]);
    return {
      idx: firstAvailableIdx,
      iso: avail[0],
      label: `${DOW_SHORT[d.date.getDay()]}, ${MONTHS_SHORT[d.date.getMonth()]} ${d.date.getDate()} · ${display} ${meridiem}`,
    };
  }, [firstAvailableIdx, dayCells, days, slotsByDay]);

  function resetSelection() {
    setSelectedDayIdx(null);
    setSelectedSlot(null);
    setReviewOpen(false);
  }

  return {
    // Week navigation
    weekStart, days, goNextWeek, goPrevWeek,
    // Slot data
    slotsByDay, loading, loadError,
    dayCells, groups, timeSlots,
    // Selection
    selectedDay, selectedDayIdx, setSelectedDayIdx,
    selectedSlot, setSelectedSlot,
    reviewOpen, setReviewOpen,
    nextAvailable,
    resetSelection,
    // Derived
    cal,
  };
}

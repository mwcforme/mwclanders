/**
 * Shared types, constants, and pure utility functions for the booking schedule UI.
 * Extracted from BookSchedule.tsx to support component decomposition.
 */
import { TIMEZONE } from "@/lib/ghlCalendars";
import { ymdInTimeZone } from "@/lib/etDate";

// ─── Constants ────────────────────────────────────────────────────────────────

export const HOLD_SECONDS = 5 * 60;
export const HOUR_MIN = 8;
export const HOUR_MAX = 18;

export const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
export const DOW_SHORT    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;
export const MONTHS_UPPER = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type DayCell = {
  date: Date;
  slotsLeft: number;
  full: boolean;
  closed: boolean;
};

export type TimeSlot = { iso: string; display: string; meridiem: "AM" | "PM" };

export type SlotGroups = {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
};

// ─── Date utilities ───────────────────────────────────────────────────────────

export const ymd = (d: Date): string => ymdInTimeZone(d, TIMEZONE);

export function isTodayET(d: Date): boolean {
  return ymd(d) === new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/** True if `d` is strictly before today in US Eastern time. */
export function isPastDayET(d: Date): boolean {
  const todayYmd = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return ymd(d) < todayYmd;
}

export function etHourOf(iso: string): number {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE, hour: "numeric", hour12: false,
  }).format(new Date(iso));
  const n = parseInt(s, 10);
  return n === 24 ? 0 : n;
}

export function dropPastAndOutOfHours(d: Date, slots: string[]): string[] {
  // Past day (ET) → no slots at all.
  // Today (ET)    → only future slots (cutoff = now, with 5-min buffer).
  // Future day    → all slots within operating hours.
  const BUFFER_MS = 5 * 60 * 1000; // 5-minute lead time so user can't book a slot starting "right now"
  let cutoffMs: number;
  if (isPastDayET(d)) {
    cutoffMs = Infinity; // nothing passes
  } else if (isTodayET(d)) {
    cutoffMs = Date.now() + BUFFER_MS;
  } else {
    cutoffMs = 0; // future day — all slots pass
  }
  return slots.filter(iso => {
    const h = etHourOf(iso);
    if (h < HOUR_MIN || h >= HOUR_MAX) return false;
    return new Date(iso).getTime() > cutoffMs;
  });
}

// ─── Formatting utilities ─────────────────────────────────────────────────────

export function fmtTimeParts(iso: string): { display: string; meridiem: "AM" | "PM" } {
  const s = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const parts = s.split(/[\s\u202f]+/);
  return {
    display: parts[0] ?? "",
    meridiem: (parts[1]?.toUpperCase() === "PM" ? "PM" : "AM") as "AM" | "PM",
  };
}

export function formatLong(d: Date): string {
  return `${DOW_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function formatLongFull(d: Date): string {
  return `${DOW_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function groupSlots(slots: TimeSlot[]): SlotGroups {
  const morning: TimeSlot[]   = [];
  const afternoon: TimeSlot[] = [];
  const evening: TimeSlot[]   = [];
  for (const s of slots) {
    const h = parseInt(s.display.split(":")[0], 10);
    if (s.meridiem === "AM") morning.push(s);
    else if (h === 12 || h < 5) afternoon.push(s);
    else evening.push(s);
  }
  return { morning, afternoon, evening };
}

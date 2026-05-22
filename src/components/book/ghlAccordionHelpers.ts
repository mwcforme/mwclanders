import { TIMEZONE } from "@/lib/ghlCalendars";
import { ymdInTimeZone } from "@/lib/etDate";

// Color constants
export const INK = "var(--brand-navy-deep)";
// hardcoded-color-allow-next-line
export const MUTED = "#4B5563";
// hardcoded-color-allow-next-line
export const LINE = "#E5E7EB";
// hardcoded-color-allow-next-line
export const BORDER = "#8B92A0";
export const SURFACE = "var(--bg-white)";
export const ORANGE = "var(--brand-cta)";

export const ymd = (d: Date) => ymdInTimeZone(d, TIMEZONE);

export const fmtDayShort = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", timeZone: TIMEZONE }).toUpperCase();

export const fmtMonthDay = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();

export const fmtTimeParts = (iso: string): { time: string; ampm: string } => {
  const s = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const [time, ampm] = s.split(" ");
  return { time, ampm };
};

export const fmtFullDay = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TIMEZONE });

export const todayET = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

export const isTodayET = (day: Date): boolean => todayET() === ymd(day);

export const isTomorrowET = (day: Date): boolean => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const tom = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(t);
  return tom === ymd(day);
};

export const dropPastSlots = (day: Date, slots: string[]): string[] => {
  if (!isTodayET(day)) return slots;
  const cutoffMs = Date.now();
  return slots.filter((iso) => new Date(iso).getTime() > cutoffMs);
};

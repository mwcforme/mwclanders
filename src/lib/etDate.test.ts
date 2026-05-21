/**
 * Tests for lib/etDate.ts — pure timezone date utilities.
 * No React. No browser globals needed (Intl is available in Node).
 */
import { describe, it, expect } from "vitest";
import {
  ymdInTimeZone,
  timeZoneOffsetMinutes,
  zonedWallTimeToDate,
  dateFromYmdInTimeZone,
  addDaysInTimeZone,
  isSundayInTimeZone,
  EASTERN_TIME_ZONE,
} from "@/lib/etDate";

// ─── ymdInTimeZone ─────────────────────────────────────────────────────────

describe("ymdInTimeZone", () => {
  it("formats a UTC date as YYYY-MM-DD in Eastern time", () => {
    // 2024-03-15 05:00 UTC = 2024-03-15 01:00 EDT (UTC-4)
    const d = new Date("2024-03-15T05:00:00Z");
    expect(ymdInTimeZone(d, EASTERN_TIME_ZONE)).toBe("2024-03-15");
  });

  it("handles day boundary — UTC midnight may be previous ET day", () => {
    // 2024-03-15 04:00 UTC = 2024-03-15 00:00 EDT — still today
    const d = new Date("2024-03-15T04:00:00Z");
    expect(ymdInTimeZone(d, EASTERN_TIME_ZONE)).toBe("2024-03-15");
  });

  it("handles day boundary — UTC 00:00 = previous ET day in EST (UTC-5)", () => {
    // 2024-01-15 00:30 UTC = 2024-01-14 19:30 EST (UTC-5)
    const d = new Date("2024-01-15T00:30:00Z");
    expect(ymdInTimeZone(d, EASTERN_TIME_ZONE)).toBe("2024-01-14");
  });

  it("uses Eastern as default timezone", () => {
    const d = new Date("2024-06-01T12:00:00Z");
    expect(ymdInTimeZone(d)).toBe(ymdInTimeZone(d, EASTERN_TIME_ZONE));
  });
});

// ─── timeZoneOffsetMinutes ─────────────────────────────────────────────────

describe("timeZoneOffsetMinutes", () => {
  it("returns -300 for EST (UTC-5)", () => {
    // January = EST = UTC-5 = -300 minutes
    const d = new Date("2024-01-15T12:00:00Z");
    expect(timeZoneOffsetMinutes(d, EASTERN_TIME_ZONE)).toBe(-300);
  });

  it("returns -240 for EDT (UTC-4)", () => {
    // July = EDT = UTC-4 = -240 minutes
    const d = new Date("2024-07-15T12:00:00Z");
    expect(timeZoneOffsetMinutes(d, EASTERN_TIME_ZONE)).toBe(-240);
  });

  it("returns 0 for UTC", () => {
    const d = new Date("2024-07-15T12:00:00Z");
    expect(timeZoneOffsetMinutes(d, "UTC")).toBe(0);
  });
});

// ─── zonedWallTimeToDate ───────────────────────────────────────────────────

describe("zonedWallTimeToDate", () => {
  it("converts ET wall time to UTC Date — summer (EDT = UTC-4)", () => {
    // 2024-07-15 09:00 EDT = 2024-07-15 13:00 UTC
    const d = zonedWallTimeToDate("2024-07-15", 9, 0, EASTERN_TIME_ZONE);
    expect(d.getUTCHours()).toBe(13);
    expect(d.getUTCMinutes()).toBe(0);
  });

  it("converts ET wall time to UTC Date — winter (EST = UTC-5)", () => {
    // 2024-01-15 09:00 EST = 2024-01-15 14:00 UTC
    const d = zonedWallTimeToDate("2024-01-15", 9, 0, EASTERN_TIME_ZONE);
    expect(d.getUTCHours()).toBe(14);
    expect(d.getUTCMinutes()).toBe(0);
  });

  it("defaults minute to 0", () => {
    const d = zonedWallTimeToDate("2024-07-15", 10);
    expect(d.getUTCMinutes()).toBe(0);
  });
});

// ─── dateFromYmdInTimeZone ──────────────────────────────────────────────────

describe("dateFromYmdInTimeZone", () => {
  it("parses YYYY-MM-DD string to midday Date in Eastern time", () => {
    const d = dateFromYmdInTimeZone("2024-07-15", EASTERN_TIME_ZONE);
    const ymd = ymdInTimeZone(d, EASTERN_TIME_ZONE);
    expect(ymd).toBe("2024-07-15");
  });

  it("uses Eastern as default timezone", () => {
    const d1 = dateFromYmdInTimeZone("2024-07-15");
    const d2 = dateFromYmdInTimeZone("2024-07-15", EASTERN_TIME_ZONE);
    expect(d1.toISOString()).toBe(d2.toISOString());
  });
});

// ─── addDaysInTimeZone ──────────────────────────────────────────────────────

describe("addDaysInTimeZone", () => {
  it("adds 1 day crossing DST boundary correctly", () => {
    // 2024-03-09 is Saturday before DST (spring forward on Sunday Mar 10)
    const sat = dateFromYmdInTimeZone("2024-03-09", EASTERN_TIME_ZONE);
    const sun = addDaysInTimeZone(sat, 1, EASTERN_TIME_ZONE);
    expect(ymdInTimeZone(sun, EASTERN_TIME_ZONE)).toBe("2024-03-10");
  });

  it("adds 7 days to get same weekday", () => {
    const mon = dateFromYmdInTimeZone("2024-07-01");
    const nextMon = addDaysInTimeZone(mon, 7);
    expect(ymdInTimeZone(nextMon)).toBe("2024-07-08");
  });

  it("adds 0 days returns same day", () => {
    const d = dateFromYmdInTimeZone("2024-07-15");
    const same = addDaysInTimeZone(d, 0);
    expect(ymdInTimeZone(same)).toBe("2024-07-15");
  });
});

// ─── isSundayInTimeZone ─────────────────────────────────────────────────────

describe("isSundayInTimeZone", () => {
  it("returns true for a Sunday", () => {
    // 2024-07-07 is a Sunday
    const d = dateFromYmdInTimeZone("2024-07-07", EASTERN_TIME_ZONE);
    expect(isSundayInTimeZone(d, EASTERN_TIME_ZONE)).toBe(true);
  });

  it("returns false for a Monday", () => {
    // 2024-07-08 is a Monday
    const d = dateFromYmdInTimeZone("2024-07-08", EASTERN_TIME_ZONE);
    expect(isSundayInTimeZone(d, EASTERN_TIME_ZONE)).toBe(false);
  });

  it("returns false for a Saturday", () => {
    // 2024-07-06 is a Saturday
    const d = dateFromYmdInTimeZone("2024-07-06", EASTERN_TIME_ZONE);
    expect(isSundayInTimeZone(d, EASTERN_TIME_ZONE)).toBe(false);
  });
});

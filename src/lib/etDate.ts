export const EASTERN_TIME_ZONE = "America/New_York";

export const ymdInTimeZone = (date: Date, timeZone = EASTERN_TIME_ZONE): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const getPart = (parts: Intl.DateTimeFormatPart[], type: string) =>
  parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);

export const timeZoneOffsetMinutes = (instant: Date, timeZone = EASTERN_TIME_ZONE): number => {
  const formatParts = (tz: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(instant);

  const utc = formatParts("UTC");
  const target = formatParts(timeZone);
  const utcMs = Date.UTC(
    getPart(utc, "year"),
    getPart(utc, "month") - 1,
    getPart(utc, "day"),
    getPart(utc, "hour") % 24,
    getPart(utc, "minute"),
  );
  const targetMs = Date.UTC(
    getPart(target, "year"),
    getPart(target, "month") - 1,
    getPart(target, "day"),
    getPart(target, "hour") % 24,
    getPart(target, "minute"),
  );
  return Math.round((targetMs - utcMs) / 60000);
};

export const zonedWallTimeToDate = (
  ymdStr: string,
  hour: number,
  minute = 0,
  timeZone = EASTERN_TIME_ZONE,
): Date => {
  const [year, month, day] = ymdStr.split("-").map((n) => parseInt(n, 10));
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const offsetMin = timeZoneOffsetMinutes(probe, timeZone);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMin * 60_000);
};

export const dateFromYmdInTimeZone = (ymdStr: string, timeZone = EASTERN_TIME_ZONE): Date =>
  zonedWallTimeToDate(ymdStr, 12, 0, timeZone);

export const addDaysInTimeZone = (date: Date, days: number, timeZone = EASTERN_TIME_ZONE): Date => {
  const [year, month, day] = ymdInTimeZone(date, timeZone).split("-").map((n) => parseInt(n, 10));
  const next = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  const nextYmd = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  return dateFromYmdInTimeZone(nextYmd, timeZone);
};

export const isSundayInTimeZone = (date: Date, timeZone = EASTERN_TIME_ZONE): boolean =>
  new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date) === "Sun";
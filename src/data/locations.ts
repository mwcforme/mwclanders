/**
 * Single source of truth for all 3 Virginia center locations.
 * Phone strings: Newport News and Virginia Beach share (757) 806-6263.
 * Virginia Beach shares (757) 806-6263 until a dedicated tracking number is assigned.
 * Hours: Saturday is OPEN. Do not narrow Mon–Fri 8:00 AM – 6:00 PM · Sat 8:00 AM – 4:00 PM.
 */

export interface Location {
  slug: "richmond-va" | "newport-news-va" | "virginia-beach-va";
  city: string;
  region: "richmond" | "hampton-roads";
  name: string;
  address: string;
  cityStateZip: string;
  fullAddress: string;
  phone: string;
  phoneHref: string;
  hours: string;
  /** Schedule used by isOpenNow() and openingHoursSpecification JSON-LD */
  weeklyOpens: "08:00";
  /** Weekday close (Mon–Fri) */
  weeklyCloses: "18:00";
  /** Saturday close */
  weeklyClosesSat: "16:00";
  /** Days the center is open (Sun=0..Sat=6). Saturday MUST be in this array. */
  openDays: number[];
  driveTime: string;
  parking: string;
  mapsQuery: string;
  /** Static map URL — uses unkeyed Maps Static fallback via OpenStreetMap-style. */
  staticMapUrl?: string;
  /** ISO geo for JSON-LD */
  geo: { latitude: number; longitude: number };
}

export const LOCATIONS: Location[] = [
  {
    slug: "richmond-va",
    city: "Glen Allen",
    region: "richmond",
    name: "Men's Wellness Centers, Richmond",
    address: "4050 Innslake Dr, Suite 360",
    cityStateZip: "Glen Allen, VA 23060",
    fullAddress: "4050 Innslake Dr, Suite 360, Glen Allen, VA 23060",
    phone: "(804) 346-4636",
    phoneHref: "tel:8043464636",
    hours: "Mon–Fri 8am–6pm · Sat 8am–4pm",
    weeklyOpens: "08:00",
    weeklyCloses: "18:00",
    weeklyClosesSat: "16:00",
    openDays: [1, 2, 3, 4, 5, 6],
    driveTime: "5 min from I-64",
    parking: "On-site parking, no charge",
    mapsQuery: "Men's Wellness Centers, 4050 Innslake Dr, Suite 360, Glen Allen, VA 23060",
    geo: { latitude: 37.6648, longitude: -77.5497 },
  },
  {
    slug: "newport-news-va",
    city: "Newport News",
    region: "hampton-roads",
    name: "Men's Wellness Centers, Newport News",
    address: "827 Diligence Drive, Suite 206",
    cityStateZip: "Newport News, VA 23606",
    fullAddress: "827 Diligence Drive, Suite 206, Newport News, VA 23606",
    phone: "(757) 806-6263",
    phoneHref: "tel:7578066263",
    hours: "Mon–Fri 8am–6pm · Sat 8am–4pm",
    weeklyOpens: "08:00",
    weeklyCloses: "18:00",
    weeklyClosesSat: "16:00",
    openDays: [1, 2, 3, 4, 5, 6],
    driveTime: "3 min from I-64, Exit 258A",
    parking: "On-site parking, no charge",
    mapsQuery: "Men's Wellness Centers, 827 Diligence Drive, Suite 206, Newport News, VA 23606",
    geo: { latitude: 37.1132, longitude: -76.4955 },
  },
  {
    slug: "virginia-beach-va",
    city: "Virginia Beach",
    region: "hampton-roads",
    name: "Men's Wellness Centers, Virginia Beach",
    address: "996 First Colonial Road",
    cityStateZip: "Virginia Beach, VA 23454",
    fullAddress: "996 First Colonial Road, Virginia Beach, VA 23454",
    // NOTE: Newport News and Virginia Beach share this number.
    phone: "(757) 806-6263",
    phoneHref: "tel:7578066263",
    hours: "Mon–Fri 8am–6pm · Sat 8am–4pm",
    weeklyOpens: "08:00",
    weeklyCloses: "18:00",
    weeklyClosesSat: "16:00",
    openDays: [1, 2, 3, 4, 5, 6],
    driveTime: "5 min from I-264",
    parking: "On-site parking, no charge",
    mapsQuery: "Men's Wellness Centers, 996 First Colonial Road, Virginia Beach, VA 23454",
    geo: { latitude: 36.8554, longitude: -76.0394 },
  },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Pure-function "Open now" status for a given location.
 * Uses local clock (matches Virginia ET in 99% of visits; close-enough for badge).
 * Saturday is treated as a regular open day per business rules.
 */
export function getOpenStatus(loc: Location, now: Date = new Date()):
  | { open: true; closesAt: string }
  | { open: false; nextOpenLabel: string } {
  const day = now.getDay();
  const hours = now.getHours();
  const opensH = parseInt(loc.weeklyOpens.slice(0, 2), 10);
  const closesH = parseInt(loc.weeklyCloses.slice(0, 2), 10);

  const isSaturday = day === 6;
  const effectiveClose = isSaturday
    ? parseInt((loc as Location & { weeklyClosesSat?: string }).weeklyClosesSat?.slice(0, 2) ?? "16", 10)
    : closesH;

  if (loc.openDays.includes(day) && hours >= opensH && hours < effectiveClose) {
    const closesLabel = isSaturday ? "4:00 PM" : "6:00 PM";
    return { open: true, closesAt: closesLabel };
  }

  // Find next open day
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    if (loc.openDays.includes(next)) {
      const label = i === 1 ? `tomorrow` : DAY_NAMES[next];
      return { open: false, nextOpenLabel: `Opens ${label} at 8:00 AM` };
    }
  }
  return { open: false, nextOpenLabel: "Opens at 8:00 AM" };
}

export function getMapsDirectionsUrl(loc: Location): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.fullAddress)}`;
}

export function getMapsSearchUrl(loc: Location): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapsQuery)}`;
}

/**
 * Single source of truth for all 3 Virginia center locations.
 * Newport News: (757) 806-6263 | Virginia Beach: (757) 612-4428
 *
 * Richmond & Virginia Beach:
 *   Mon & Fri 8am to 6pm · Tue/Wed/Thu 9am to 5pm · Sat 8am to 3pm
 *
 * Newport News:
 *   Mon & Tue 9am to 5pm · Wed closed · Thu & Fri 9am to 5pm · Sat 8am to 3pm
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
  /**
   * Per-day schedule for isOpenNow() and JSON-LD openingHoursSpecification.
   * Key = day abbreviation (Mo/Tu/We/Th/Fr/Sa), value = [opens, closes] in HH:MM.
   * Days absent from this map are closed.
   */
  schedule: Record<string, [string, string]>;
  /** @deprecated use schedule — kept for back-compat during migration */
  weeklyOpens: string;
  weeklyCloses: string;
  weeklyClosesSat: string;
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
    hours: "Mon & Fri 8am to 6pm · Tue/Wed/Thu 9am to 5pm · Sat 8am to 3pm",
    schedule: {
      Mo: ["08:00", "18:00"],
      Tu: ["09:00", "17:00"],
      We: ["09:00", "17:00"],
      Th: ["09:00", "17:00"],
      Fr: ["08:00", "18:00"],
      Sa: ["08:00", "15:00"],
    },
    weeklyOpens: "08:00",
    weeklyCloses: "18:00",
    weeklyClosesSat: "15:00",
    openDays: [1, 2, 3, 4, 5, 6],
    driveTime: "5 minutes from I-64",
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
    hours: "Mon & Tue 9am to 5pm · Wed closed · Thu & Fri 9am to 5pm · Sat 8am to 3pm",
    schedule: {
      Mo: ["09:00", "17:00"],
      Tu: ["09:00", "17:00"],
      // Wednesday closed
      Th: ["09:00", "17:00"],
      Fr: ["09:00", "17:00"],
      Sa: ["08:00", "15:00"],
    },
    weeklyOpens: "09:00",
    weeklyCloses: "17:00",
    weeklyClosesSat: "15:00",
    openDays: [1, 2, 4, 5, 6],
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
    phone: "(757) 612-4428",
    phoneHref: "tel:7576124428",
    hours: "Mon & Fri 8am to 6pm · Tue/Wed/Thu 9am to 5pm · Sat 8am to 3pm",
    schedule: {
      Mo: ["08:00", "18:00"],
      Tu: ["09:00", "17:00"],
      We: ["09:00", "17:00"],
      Th: ["09:00", "17:00"],
      Fr: ["08:00", "18:00"],
      Sa: ["08:00", "15:00"],
    },
    weeklyOpens: "08:00",
    weeklyCloses: "18:00",
    weeklyClosesSat: "15:00",
    openDays: [1, 2, 3, 4, 5, 6],
    driveTime: "5 min from I-264",
    parking: "On-site parking, no charge",
    mapsQuery: "Men's Wellness Centers, 996 First Colonial Road, Virginia Beach, VA 23454",
    geo: { latitude: 36.8554, longitude: -76.0394 },
  },
];



export function getMapsSearchUrl(loc: Location): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapsQuery)}`;
}

/**
 * Maps short location keys (used by booking/lead forms) to the full Location slug.
 * Single source of truth — import this instead of defining inline SLUG_MAPs.
 */
export const LOCATION_KEY_TO_SLUG: Record<string, Location["slug"]> = {
  "richmond":       "richmond-va",
  "virginia-beach": "virginia-beach-va",
  "newport-news":   "newport-news-va",
} as const;

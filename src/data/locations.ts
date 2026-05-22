/**
 * Single source of truth for all 3 Virginia center locations.
 * Phone strings: Newport News and Virginia Beach share (757) 612-4428.
 * Virginia Beach shares (757) 612-4428 until a dedicated tracking number is assigned.
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
    phone: "(757) 612-4428",
    phoneHref: "tel:7576124428",
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
    phone: "(757) 612-4428",
    phoneHref: "tel:7576124428",
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



export function getMapsSearchUrl(loc: Location): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapsQuery)}`;
}

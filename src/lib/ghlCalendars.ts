import { ghl } from "@/lib/ghl";

export type LocationKey = "richmond" | "virginia-beach" | "newport-news";

export interface CenterCalendar {
  key: LocationKey;
  label: string;
  calendarId: string;
}

// Production calendars (live GHL location Ghstz8eIsHWLeXek47dk).
const PROD_CALENDARS: Record<LocationKey, CenterCalendar> = {
  richmond: { key: "richmond", label: "Richmond", calendarId: "1Cfy5JnO2A4ggiZlMVvX" },
  "virginia-beach": { key: "virginia-beach", label: "Virginia Beach", calendarId: "4xmnBGMWJ6TVUKcAPpPb" },
  "newport-news": { key: "newport-news", label: "Newport News", calendarId: "lBaRbjUpEmesxEloFBME" },
};

export const CENTER_CALENDARS: Record<LocationKey, CenterCalendar> = PROD_CALENDARS;

export const TIMEZONE = "America/New_York";

export interface FreeSlot {
  startTime: string;
  endTime: string;
}

interface FreeSlotsResponse {
  // GHL returns either { _dates_: { 'YYYY-MM-DD': { slots: string[] } } } or a flat array depending on version
  [date: string]: { slots: string[] } | unknown;
}

/** Fetch free appointment slots for a center between two ISO dates. */
export async function getFreeSlots(location: LocationKey, startDate: Date, endDate: Date) {
  const cal = CENTER_CALENDARS[location];
  const res = await ghl<FreeSlotsResponse>({
    path: `/calendars/${cal.calendarId}/free-slots`,
    method: "GET",
    injectLocationId: false, // calendar endpoint scopes by calendarId
    query: {
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      timezone: TIMEZONE,
    },
  });
  return res.data;
}

export interface BookAppointmentInput {
  location: LocationKey;
  contactId: string; // GHL contact id (create or upsert first)
  startTime: string; // ISO string
  endTime?: string; // optional, GHL infers from calendar duration
  title?: string;
  notes?: string;
}

/** Create a confirmed appointment on a center's calendar. */
export async function bookAppointment(input: BookAppointmentInput) {
  const cal = CENTER_CALENDARS[input.location];
  return ghl({
    path: "/calendars/events/appointments",
    method: "POST",
    body: {
      calendarId: cal.calendarId,
      contactId: input.contactId,
      startTime: input.startTime,
      ...(input.endTime ? { endTime: input.endTime } : {}),
      title: input.title ?? `Appointment - ${cal.label}`,
      appointmentStatus: "confirmed",
      ignoreDateRange: false,
      toNotify: true,
      ...(input.notes ? { notes: input.notes } : {}),
    },
  });
}

/** Maps location keys to GHL location tags. */
const LOCATION_TAGS: Record<string, string> = {
  "richmond":       "location_rva",
  "virginia-beach": "location_vba",
  "newport-news":   "location_npn",
};

/**
 * GHL custom field IDs — confirmed from live contact inspection on working funnel.
 * All IDs are scoped to location Ghstz8eIsHWLeXek47dk.
 */
const GHL_FIELDS = {
  preferredLocation: "Cou856tOhaxW62vwehVI", // Preferred Location (dropdown)
  trafficSource:     "Np2WHxON2I4DVnYjZh3e", // Traffic Source (Facebook, Google, etc.)
  landingPageUrl:    "UZBaHuKr9PpFNro47it7", // Landing Page URL
  utmCampaign:       "Vh0MH504ujQfBh0Q5UFx", // Campaign name (utm_campaign)
  utmMedium:         "ssEvmmfe1tz5H4fiMHZR", // UTM medium (paid, organic, etc.)
  utmContent:        "thwe93MxRDzS2SO9pxxC", // UTM content / ad set
  adId:              "1Wo5z9YpDh9Lv64IBEoa", // Ad ID (fbclid / gclid)
  ipAddress:         "RrRyWKMSzZvu6MFGXTZb", // IP address
} as const;

/** Maps location keys to Preferred Location display values. */
const LOCATION_DISPLAY: Record<string, string> = {
  "richmond":       "Richmond, VA",
  "virginia-beach": "Virginia Beach, VA",
  "newport-news":   "Newport News, VA",
};

/** Maps utm_source to Traffic Source display value. */
function trafficSourceLabel(utmSource?: string): string | undefined {
  if (!utmSource) return undefined;
  const s = utmSource.toLowerCase();
  if (s.includes("facebook") || s.includes("fb")) return "Facebook";
  if (s.includes("google"))  return "Google";
  if (s.includes("bing") || s.includes("microsoft")) return "Bing";
  if (s.includes("tiktok")) return "TikTok";
  if (s.includes("instagram")) return "Instagram";
  return utmSource;
}

export interface UpsertContactInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  /** Location key — used to apply location tag + Preferred Location custom field. */
  location?: string;
  tags?: string[];
  /** Marketing attribution — mapped to GHL custom fields. */
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    gclid?: string;
    fbclid?: string;
    msclkid?: string;
    landing_page_url?: string;
  };
  /** PHI-safe structured fields routed to GHL contact custom fields only. */
  customFields?: Partial<Record<
    | "mwc_symptom"
    | "mwc_symptom_duration"
    | "mwc_urgency_tier"
    | "mwc_clinical_note"
    | "mwc_funnel_service"
    | "mwc_lp_slug",
    string
  >>;
}

/** Upsert a contact and return its id (idempotent on email/phone). */
export async function upsertContact(input: UpsertContactInput): Promise<string> {
  // Build required tags: book_react_app + location tag + caller tags, deduped
  const requiredTags = ["book_react_app"];
  if (input.location && LOCATION_TAGS[input.location]) {
    requiredTags.push(LOCATION_TAGS[input.location]);
  }
  const allTags = Array.from(new Set([...requiredTags, ...(input.tags ?? [])]));

  // Upsert contact — pass tags in body so ghl-proxy auto-applies them
  // via /contacts/{id}/tags after upsert (GHL ignores inline tags on upsert).
  const res = await ghl<{ contact?: { id: string }; new?: boolean }>({
    path: "/contacts/upsert",
    method: "POST",
    body: {
      firstName: input.firstName,
      ...(input.lastName ? { lastName: input.lastName } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.source ? { source: input.source } : {}),
      tags: allTags,
      // Build custom fields array matching GHL field IDs from live funnel
      customFields: (() => {
        const cf: Array<{ id: string; fieldValue: string }> = [];
        const a = input.attribution ?? {};

        // Preferred Location
        if (input.location && LOCATION_DISPLAY[input.location]) {
          cf.push({ id: GHL_FIELDS.preferredLocation, fieldValue: LOCATION_DISPLAY[input.location] });
        }
        // Traffic Source
        const src = trafficSourceLabel(a.utm_source);
        if (src) cf.push({ id: GHL_FIELDS.trafficSource, fieldValue: src });
        // UTM fields
        if (a.utm_campaign) cf.push({ id: GHL_FIELDS.utmCampaign, fieldValue: a.utm_campaign });
        if (a.utm_medium)   cf.push({ id: GHL_FIELDS.utmMedium,   fieldValue: a.utm_medium });
        if (a.utm_content)  cf.push({ id: GHL_FIELDS.utmContent,  fieldValue: a.utm_content });
        // Ad ID (fbclid preferred, fallback gclid/msclkid)
        const adId = a.fbclid ?? a.gclid ?? a.msclkid;
        if (adId) cf.push({ id: GHL_FIELDS.adId, fieldValue: adId });
        // Landing page URL
        if (a.landing_page_url) cf.push({ id: GHL_FIELDS.landingPageUrl, fieldValue: a.landing_page_url });
        // Additional mwc_ fields from caller
        if (input.customFields) {
          for (const [key, value] of Object.entries(input.customFields)) {
            if (value) cf.push({ id: key, fieldValue: value });
          }
        }
        return cf;
      })(),
    },
  });
  const id = res.data?.contact?.id;
  if (!id) throw new Error("GHL upsertContact: missing contact id");
  return id;
}

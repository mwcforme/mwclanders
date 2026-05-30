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
      title: input.title ?? `Consultation - ${cal.label}`,
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
 * Maps location keys to GHL custom field values.
 * Field IDs confirmed from live contact inspection:
 *   c8u5gHvM9fx1d6WADcQG = Preferred Location (full display name, dropdown)
 *   i3FP2Vqv0HaMU86dkbzO = Location (short city name)
 */
const LOCATION_CUSTOM_FIELDS: Record<string, { preferred: string; city: string }> = {
  "richmond":       { preferred: "Richmond, VA",      city: "Richmond" },
  "virginia-beach": { preferred: "Virginia Beach, VA", city: "Virginia Beach" },
  "newport-news":   { preferred: "Newport News, VA",   city: "Newport News" },
};

export interface UpsertContactInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  /** Location key — used to apply the correct location tag (location_rva / location_vba / location_npn). */
  location?: string;
  tags?: string[];
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
      // Location custom fields — set Preferred Location + Location city fields
      ...(input.location && LOCATION_CUSTOM_FIELDS[input.location] ? {
        customFields: [
          { id: "c8u5gHvM9fx1d6WADcQG", value: LOCATION_CUSTOM_FIELDS[input.location].preferred },
          { id: "i3FP2Vqv0HaMU86dkbzO", value: LOCATION_CUSTOM_FIELDS[input.location].city },
          // Merge any additional mwc_ caller fields
          ...(input.customFields
            ? Object.entries(input.customFields).map(([key, value]) => ({ key, field_value: value }))
            : []),
        ],
      } : input.customFields && Object.keys(input.customFields).length ? {
        customFields: Object.entries(input.customFields).map(([key, value]) => ({ key, field_value: value })),
      } : {}),
    },
  });
  const id = res.data?.contact?.id;
  if (!id) throw new Error("GHL upsertContact: missing contact id");
  return id;
}

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
  // Step 1: upsert the contact (creates or updates based on phone/email dedup)
  const res = await ghl<{ contact?: { id: string }; new?: boolean }>({
    path: "/contacts/upsert",
    method: "POST",
    body: {
      firstName: input.firstName,
      ...(input.lastName ? { lastName: input.lastName } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.source ? { source: input.source } : {}),
      ...(input.customFields && Object.keys(input.customFields).length
        ? { customFields: input.customFields }
        : {}),
    },
  });
  const id = res.data?.contact?.id;
  if (!id) throw new Error("GHL upsertContact: missing contact id");

  // Step 2: apply required tags via dedicated /contacts/{id}/tags endpoint.
  // GHL's upsert API does not reliably apply tags inline; the tags endpoint
  // is the authoritative path and works on both new and existing contacts.
  const requiredTags = ["book_react_app"];
  if (input.location && LOCATION_TAGS[input.location]) {
    requiredTags.push(LOCATION_TAGS[input.location]);
  }
  const allTags = Array.from(new Set([...requiredTags, ...(input.tags ?? [])]));

  // Fire-and-forget — never block the booking flow on tag application.
  // Tags endpoint is idempotent (adds only, never removes existing tags).
  void ghl({
    path: `/contacts/${id}/tags`,
    method: "POST",
    body: { tags: allTags },
  }).catch((err) => {
    console.warn("[upsertContact] tag apply failed", err);
  });

  return id;
}

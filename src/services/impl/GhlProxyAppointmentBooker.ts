import { bookAppointment, getFreeSlots, TIMEZONE, CENTER_CALENDARS } from "@/lib/ghlCalendars";
const getSupabase = () => import("@/integrations/supabase/legacy").then(m => m.supabase);
import type {
  AppointmentInput,
  AppointmentResult,
  DateRange,
  IAppointmentBooker,
} from "@/services/contracts/IAppointmentBooker";
import type { LocationKey } from "@/lib/ghlCalendars";

async function logBookingEvent(row: {
  event_type: "attempt" | "success" | "error";
  location: LocationKey;
  slot_iso: string;
  contact_id?: string;
  error?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const supabase = await getSupabase();
    await supabase.from("booking_event_log").insert({
      event_type: row.event_type,
      location: row.location,
      calendar_id: CENTER_CALENDARS[row.location]?.calendarId ?? null,
      slot_iso: row.slot_iso,
      contact_id: row.contact_id ?? null,
      page_url: typeof window !== "undefined" ? window.location.href : null,
      error: row.error ?? null,
      meta: (row.meta ?? null) as never,
    });
  } catch {
    /* never block booking on audit-log failure */
  }
}

/**
 * Wraps the existing `ghlCalendars` helpers, which themselves route through
 * the `ghl-proxy` Supabase edge function. Returns availability bucketed by
 * ET calendar day to match the shape the existing GHLDayView consumes.
 */
export class GhlProxyAppointmentBooker implements IAppointmentBooker {
  async listAvailability(location: LocationKey, range: DateRange): Promise<Record<string, string[]>> {
    const raw = await getFreeSlots(location, range.start, range.end);
    if (!raw || typeof raw !== "object") return {};
    const out: Record<string, string[]> = {};
    for (const [_key, value] of Object.entries(raw)) {
      if (value && typeof value === "object" && "slots" in (value as object)) {
        const slots = (value as { slots: string[] }).slots;
        if (Array.isArray(slots)) {
          // Re-bucket by ET day in case GHL key differs.
          for (const iso of slots) {
            const day = new Intl.DateTimeFormat("en-CA", {
              timeZone: TIMEZONE,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date(iso));
            (out[day] ||= []).push(iso);
          }
        }
      }
    }
    return out;
  }

  async bookAppointment(input: AppointmentInput): Promise<AppointmentResult> {
    void logBookingEvent({
      event_type: "attempt",
      location: input.location,
      slot_iso: input.startTime,
      contact_id: input.contactId,
    });
    try {
      const res = await bookAppointment(input);
      const upstreamBody = (res as unknown as { upstreamBody?: string }).upstreamBody;
      void logBookingEvent({
        event_type: res.ok ? "success" : "error",
        location: input.location,
        slot_iso: input.startTime,
        contact_id: input.contactId,
        error: res.ok ? undefined : `HTTP ${res.status}: ${upstreamBody ?? ""}`.slice(0, 1000),
        meta: res.ok ? undefined : { upstreamBody, status: res.status },
      });
      return { ok: res.ok, status: res.status };
    } catch (err) {
      void logBookingEvent({
        event_type: "error",
        location: input.location,
        slot_iso: input.startTime,
        contact_id: input.contactId,
        error: (err as Error).message,
      });
      throw err;
    }
  }
}

import { useCallback, useEffect, useRef, useState } from "react";
import { useServices } from "@/app/providers/ServicesProvider";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { enqueueBooking } from "@/lib/bookingQueue";
import { CENTER_CALENDARS } from "@/lib/ghlCalendars";
import type { LocationKey } from "@/lib/ghlCalendars";
import type { MwcCustomFields } from "@/services/contracts/ILeadSubmitter";
import { trackConversion } from "@/lib/capi";

/**
 * Generic notes string written to GHL appointments. Real clinical context
 * (symptom / duration / urgency / freeform note) is routed via structured
 * contact custom fields so it never appears in URLs, GA4, or appointment
 * subjects. See PHI refactor in `BookingRouteGuard`.
 */
const GENERIC_APPT_NOTES =
  "Booked via mwc booking funnel. See contact custom fields for clinical context.";

export interface ConfirmInput {
  slotIso: string;
  location: LocationKey;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  /** Structured PHI-safe context — written to GHL contact custom fields only. */
  customFields?: MwcCustomFields;
}

export type ConfirmStatus = "idle" | "submitting" | "success" | "error";

export interface RedirectState {
  url: string;
  totalMs: number;
  remainingMs: number;
}

export interface ConfirmAppointmentController {
  status: ConfirmStatus;
  error: string | null;
  isSubmitting: boolean;
  redirect: RedirectState | null;
  confirm: (input: ConfirmInput) => Promise<boolean>;
  cancelRedirect: () => void;
  reset: () => void;
}

const FAILED_INTENT_KEY = "mwc_booking_failed_intent_v1";

export function useConfirmAppointment(opts?: {
  onBooked?: (slotIso: string) => void;
}): ConfirmAppointmentController {
  const { booking } = useServices();
  // Stable ref for opts.onBooked — prevents `confirm` from being recreated on
  // every render when the caller doesn't memoize the opts object.
  const onBookedRef = useRef(opts?.onBooked);
  onBookedRef.current = opts?.onBooked;
  const [status, setStatus] = useState<ConfirmStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<RedirectState | null>(null);
  const tickRef = useRef<number | null>(null);
  const navTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
  }, []);

  const cancelRedirect = useCallback(() => {
    clearTimers();
    setRedirect(null);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const scheduleRedirect = useCallback(
    (url: string, totalMs: number) => {
      clearTimers();
      const start = Date.now();
      setRedirect({ url, totalMs, remainingMs: totalMs });
      tickRef.current = window.setInterval(() => {
        const elapsed = Date.now() - start;
        const remainingMs = Math.max(0, totalMs - elapsed);
        setRedirect({ url, totalMs, remainingMs });
        if (remainingMs <= 0 && tickRef.current !== null) {
          window.clearInterval(tickRef.current);
          tickRef.current = null;
        }
      }, 100);
      navTimerRef.current = window.setTimeout(() => {
        window.location.href = url;
      }, totalMs);
    },
    [clearTimers],
  );

  const reset = useCallback(() => {
    clearTimers();
    setRedirect(null);
    setStatus("idle");
    setError(null);
  }, [clearTimers]);

  const confirm = useCallback(
    async (input: ConfirmInput): Promise<boolean> => {
      if (status === "submitting") return false;
      cancelRedirect();
      setStatus("submitting");
      setError(null);

      // Hard timeout — confirm button can never hang longer than 12 seconds
      const confirmTimeout = window.setTimeout(() => {
        setStatus("error");
        setError("Something took too long. Please try again or call us.");
      }, 12000);

      // Use stored contactId from hero form submit if available —
      // avoids a redundant GHL upsert round-trip on every booking confirm.
      const storedContactId = useBookingStore.getState().identity?.ghlContactId;

      let contactId: string;
      try {
        if (storedContactId) {
          // Fast path: contact already exists, just update custom fields async
          contactId = storedContactId;
          // Fire-and-forget custom fields update — don’t block booking
          void import("@/services/impl/GhlProxyLeadSubmitter").then(({ GhlProxyLeadSubmitter }) =>
            new GhlProxyLeadSubmitter().submitLead({
              firstName: input.firstName || "Guest",
              lastName: input.lastName || undefined,
              email: input.email || undefined,
              phone: input.phone || undefined,
              source: input.source || "mwc-book-funnel",
              customFields: input.customFields,
            })
          ).catch(() => { /* non-blocking */ });
        } else {
          // Slow path: upsert contact first (guest/short-form users)
          const { GhlProxyLeadSubmitter } = await import("@/services/impl/GhlProxyLeadSubmitter");
          const r = await new GhlProxyLeadSubmitter().submitLead({
            firstName: input.firstName || "Guest",
            lastName: input.lastName || undefined,
            email: input.email || undefined,
            phone: input.phone || undefined,
            source: input.source || "mwc-book-funnel",
            customFields: input.customFields,
          });
          contactId = r.contactId;
        }
      } catch (e) {
        clearTimeout(confirmTimeout);
        const msg = (e as Error).message || "Booking failed. Please try another time.";
        setError(msg);
        setStatus("error");
        return false;
      }

      // Book the appointment — clinical detail lives on contact custom fields only.
      try {
        await booking.bookAppointment({
          location: input.location,
          contactId,
          startTime: input.slotIso,
          notes: GENERIC_APPT_NOTES,
        });
        clearTimeout(confirmTimeout);
        setStatus("success");
        void trackConversion("Schedule", {
          user_data: {
            email: input.email,
            phone: input.phone,
            first_name: input.firstName,
            last_name: input.lastName,
            state: "VA",
            external_id: contactId,
          },
          custom_data: {
            content_name: `book-${input.location}`,
            content_category: "appointment",
          },
        });
        onBookedRef.current?.(input.slotIso);
        return true;
      } catch (bookErr) {
        clearTimeout(confirmTimeout);
        try {
          // PHI contract: only non-PII fields stored on failure.
          // firstName/lastName/email/phone are intentionally excluded.
          sessionStorage.setItem(
            FAILED_INTENT_KEY,
            JSON.stringify({
              contactId,
              location: input.location,
              slotIso: input.slotIso,
              failedAt: new Date().toISOString(),
            }),
          );
        } catch {
          /* ignore */
        }
        // Queue the booking offline — never lose a lead even if GHL is down
        const cal = CENTER_CALENDARS[input.location];
        if (cal && contactId) {
          enqueueBooking({
            slotIso: input.slotIso,
            location: input.location,
            contactId,
            calendarId: cal.calendarId,
            source: input.source || "booking-funnel",
          });
          // Tell user they're confirmed — we'll sync in background
          setStatus("success");
          onBookedRef.current?.(input.slotIso);
          return true;
        }
        setError(
          "That time was just taken. We'll have a coordinator call you to confirm another slot.",
        );
        setStatus("error");
        scheduleRedirect("/book/lets-talk", 4000);
        return false;
      }
    },
    [booking, cancelRedirect, scheduleRedirect, status],
  );

  return {
    status,
    error,
    redirect,
    isSubmitting: status === "submitting",
    confirm,
    cancelRedirect,
    reset,
  };
}

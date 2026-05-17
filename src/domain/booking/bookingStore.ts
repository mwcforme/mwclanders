/**
 * Booking funnel state — single source of truth for `/book/*`.
 *
 * PHI/PII safety contract:
 *  - Persisted ONLY in sessionStorage (`mwc_booking_state_v2`).
 *  - NEVER serialized into URLs, cookies, dataLayer, GA4, Sentry, or window.history.
 *  - Cleared on every fresh entry to the funnel via `enterBookingFunnel`.
 *  - On hard refresh of any `/book/*` route, BookingRouteGuard redirects the
 *    user back to the LP, which is the by-design "always restart" behavior.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Symptom = "energy" | "sexual" | "weight" | "other";
export type Duration = "lt6mo" | "6to12mo" | "1to2yr" | "gt2yr";
export type UrgencyTier = "early" | "building" | "overdue" | "long_overdue";
/**
 * TODO Phase 2: narrow to `"trt" | "ed" | "wl"` and add a runtime guard in
 * BookEntry.tsx where the token payload arrives as `string | null`. The trailing
 * `| string` makes the union collapse to `string` in TS, defeating exhaustive
 * checks in `lpFor`. Safe to change once BookEntry validates the service value.
 */
export type Service = "trt" | "ed" | "wl" | string;

export interface BookingIdentity {
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  ghlContactId?: string;
}

export interface BookingState {
  identity?: BookingIdentity;
  service?: Service;
  location?: string;
  symptom?: Symptom;
  note?: string;
  duration?: Duration;
  urgencyTier?: UrgencyTier;
  appointmentTime?: string;
  source?: string;
  lpSlug?: string;
  attribution?: string;
}

interface BookingActions {
  reset: () => void;
  setIdentity: (identity: BookingIdentity) => void;
  setService: (service?: Service) => void;
  setLocation: (location?: string) => void;
  setSymptom: (symptom?: Symptom, note?: string) => void;
  setDuration: (duration?: Duration, urgencyTier?: UrgencyTier) => void;
  setAppointmentTime: (iso?: string) => void;
  patch: (partial: Partial<BookingState>) => void;
}

const STORAGE_KEY = "mwc_booking_state_v2";

export const useBookingStore = create<BookingState & BookingActions>()(
  persist(
    (set) => ({
      reset: () =>
        set({
          identity: undefined,
          service: undefined,
          location: undefined,
          symptom: undefined,
          note: undefined,
          duration: undefined,
          urgencyTier: undefined,
          appointmentTime: undefined,
          source: undefined,
          lpSlug: undefined,
          attribution: undefined,
        }),
      setIdentity: (identity) => set({ identity }),
      setService: (service) => set({ service }),
      setLocation: (location) => set({ location }),
      setSymptom: (symptom, note) =>
        set({ symptom, note: symptom === "other" ? note : undefined }),
      setDuration: (duration, urgencyTier) => set({ duration, urgencyTier }),
      setAppointmentTime: (iso) => set({ appointmentTime: iso }),
      patch: (partial) => set(partial),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? (undefined as unknown as Storage)
          : window.sessionStorage,
      ),
      // Persist only data fields, not action functions.
      partialize: (s) => ({
        identity: s.identity,
        service: s.service,
        location: s.location,
        symptom: s.symptom,
        note: s.note,
        duration: s.duration,
        urgencyTier: s.urgencyTier,
        appointmentTime: s.appointmentTime,
        source: s.source,
        lpSlug: s.lpSlug,
        attribution: s.attribution,
      }),
    },
  ),
);

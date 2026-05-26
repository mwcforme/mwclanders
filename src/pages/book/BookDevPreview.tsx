/**
 * DEV-ONLY: Seeds bookingStore and renders BookSchedule / BookConfirmed
 * without triggering the BookingRouteGuard identity check.
 * Routes: /book/dev-schedule  /book/dev-confirmed
 */
import { useEffect, useState } from "react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import BookSchedule from "./BookSchedule";
import BookConfirmed from "./BookConfirmed";

const SEED = {
  location: "richmond" as const,
  identity: { firstName: "Eric", lastName: "OBrien", phone: "7575550000", email: "eric@menswellnesscenters.com", ghlContactId: "test-123" },
  symptom: "fatigue", service: "trt", source: "dev-preview", urgencyTier: "urgent" as const,
};

function useSeed(appointmentTime?: string) {
  const patch = useBookingStore((s) => s.patch);
  const setAppointmentTime = useBookingStore((s) => s.setAppointmentTime);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    patch(SEED);
    if (appointmentTime) setAppointmentTime(appointmentTime);
    setReady(true);
  }, [patch, setAppointmentTime, appointmentTime]);
  return ready;
}

export function BookDevSchedule() {
  const ready = useSeed();
  return ready ? <BookSchedule /> : null;
}

export function BookDevConfirmed() {
  const ready = useSeed("2026-05-27T13:00:00.000Z");
  return ready ? <BookConfirmed /> : null;
}

/**
 * Ralph loop QA routes — seeded booking state for variance measurement.
 * These bypass the route guard so the full page renders without a real session.
 * Routes: /book/dev-schedule  /book/dev-confirmed
 * NOTE: remove before hard production launch.
 */
import { useEffect, useState } from "react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import BookConfirmed from "./BookConfirmed";
import BookSchedule from "./BookSchedule";

const SEED = {
  location: "richmond" as const,
  identity: { firstName: "Eric", lastName: "OBrien", phone: "7575550000", email: "eric@menswellnesscenters.com", ghlContactId: "test-123" },
  symptom: "fatigue", service: "trt", source: "dev", urgencyTier: "urgent" as const,
};

function useSeed(apptTime?: string) {
  const patch = useBookingStore((s) => s.patch);
  const setAppointmentTime = useBookingStore((s) => s.setAppointmentTime);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    patch(SEED);
    if (apptTime) setAppointmentTime(apptTime);
    setReady(true);
  }, [patch, setAppointmentTime, apptTime]);
  return ready;
}

export function BookDevConfirmed() {
  const ready = useSeed("2026-05-26T13:00:00.000Z");
  return ready ? <BookConfirmed /> : null;
}

export function BookDevSchedule() {
  const ready = useSeed();
  return ready ? <BookSchedule /> : null;
}

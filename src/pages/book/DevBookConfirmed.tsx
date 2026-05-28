/**
 * DevBookConfirmed — seeds booking store with test data for visual QA / Ralph loop.
 * Route: /book/dev-confirmed
 * Uses same data as the mwclocked reference: ERIC, MAY 26 08:00, Richmond.
 */
import { useEffect } from "react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import BookConfirmed from "./BookConfirmed";

// Fixed date: 2026-05-26 08:00 ET  →  ISO with ET offset  (-04:00 EDT)
const TEST_APPT = "2026-05-26T08:00:00-04:00";

export default function DevBookConfirmed() {
  const patch = useBookingStore(s => s.patch);

  useEffect(() => {
    patch({
      appointmentTime: TEST_APPT,
      location: "richmond",
      identity: {
        firstName: "Eric",
        lastName:  "Test",
        phone:     "8045550001",
        email:     "",
        ghlContactId: undefined,
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <BookConfirmed />;
}

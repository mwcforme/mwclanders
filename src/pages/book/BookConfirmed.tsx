/**
 * /book/confirmed — Post-booking confirmation page.
 * CRO-optimised: check → ticket → calendar → outcomes → video → prep → location → email → reschedule
 * Senior-mobile: 16px body, 56px touch targets, 28px section gaps, #111827/#374151 on light bg.
 */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { LOCATIONS, getMapsSearchUrl, LOCATION_KEY_TO_SLUG, type Location } from "@/data/locations";
import { BookConfirmedHero } from "@/components/book/BookConfirmedHero";
import { BookConfirmedContent } from "@/components/book/BookConfirmedContent";

const DEFAULT_CENTER = LOCATIONS[1];

function formatDate(raw?: string) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const tz = "America/New_York";
  return {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: tz }).format(d),
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: tz }).format(d).toUpperCase(),
    day: new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: tz }).format(d),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }).format(d),
    iso: raw,
  };
}

function buildCalendarLinks(iso: string, address: string) {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = "Men's Wellness Centers Appointment";
  const desc = "Your no-cost testosterone consultation. Bring photo ID.";
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(address)}&details=${encodeURIComponent(desc)}`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${title}`, `LOCATION:${address}`, `DESCRIPTION:${desc}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return { google, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}

export default function BookConfirmed() {
  const appointmentTime = useBookingStore((s) => s.appointmentTime);
  const routerLocation = useLocation();
  const navState = (routerLocation.state || {}) as { appointmentTime?: string };
  const effectiveAppt = appointmentTime || navState.appointmentTime;
  const location = useBookingStore((s) => s.location);
  const identity = useBookingStore((s) => s.identity);
  const patchAction = useBookingStore((s) => s.patch);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [checkDrawn, setCheckDrawn] = useState(false);

  const slug = location ? LOCATION_KEY_TO_SLUG[location] : null;
  const center: Location = (slug && LOCATIONS.find((l) => l.slug === slug)) || DEFAULT_CENTER;
  const mapsSearchUrl = getMapsSearchUrl(center);
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(center.mapsQuery)}&output=embed`;

  const firstName = (identity?.firstName ?? "").trim().split(/\s+/)[0] || "";
  const apptDate = formatDate(effectiveAppt);
  const calLinks = apptDate ? buildCalendarLinks(apptDate.iso, center.fullAddress) : null;

  useEffect(() => {
    if (identity && !identity.phone && !identity.email) patchAction({ identity: undefined });
    const t = setTimeout(() => setCheckDrawn(true), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BookLayout page="confirmed" variant="confirmation" title="You're booked | Men's Wellness Centers">
      <BookConfirmedHero
        firstName={firstName}
        apptDate={apptDate}
        calLinks={calLinks}
        center={center}
        checkDrawn={checkDrawn}
      />
      <BookConfirmedContent
        center={center}
        mapsSearchUrl={mapsSearchUrl}
        mapsEmbedUrl={mapsEmbedUrl}
        emailCaptured={emailCaptured}
        onEmailCaptured={() => setEmailCaptured(true)}
        contactId={identity?.ghlContactId}
      />
    </BookLayout>
  );
}

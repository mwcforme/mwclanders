/**
 * BookConfirmed — confirmed page wired to real booking store data.
 * UI: BookConfirmedHero + BookConfirmedContent (Ralph-matched design).
 */
import { useEffect, useState } from "react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { BookConfirmedHero } from "@/components/book/BookConfirmedHero";
import { BookConfirmedContent } from "@/components/book/BookConfirmedContent";
import { LOCATIONS, getMapsSearchUrl, LOCATION_KEY_TO_SLUG, type Location } from "@/data/locations";

const DEFAULT_CENTER = LOCATIONS[0];
const TIMEZONE = "America/New_York";

interface ApptDate { weekday: string; month: string; day: string; time: string; iso: string; }

function formatAppt(raw?: string): ApptDate | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return {
    month:   new Intl.DateTimeFormat("en-US", { month: "short",   timeZone: TIMEZONE }).format(d).toUpperCase(),
    day:     new Intl.DateTimeFormat("en-US", { day: "numeric",   timeZone: TIMEZONE }).format(d),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: TIMEZONE }).format(d).toUpperCase(),
    time:    new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE }).format(d).replace(/\u202f/g, " "),
    iso: raw,
  };
}

function buildCalendarLinks(iso: string, address: string) {
  const start = new Date(iso);
  const end   = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt   = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = "Men's Wellness Centers Appointment";
  const desc  = "Your no-cost testosterone consultation. Bring photo ID.";
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(address)}&details=${encodeURIComponent(desc)}`;
  const ics    = ["BEGIN:VCALENDAR","VERSION:2.0","BEGIN:VEVENT",`DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,`SUMMARY:${title}`,`LOCATION:${address}`,`DESCRIPTION:${desc}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  return { google, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}

export default function BookConfirmed() {
  const appointmentTime = useBookingStore(s => s.appointmentTime);
  const location        = useBookingStore(s => s.location);
  const identity        = useBookingStore(s => s.identity);
  const patchAction     = useBookingStore(s => s.patch);

  const slug   = location ? LOCATION_KEY_TO_SLUG[location] : null;
  const center: Location = (slug && LOCATIONS.find(l => l.slug === slug)) || DEFAULT_CENTER;

  const mapsSearchUrl = getMapsSearchUrl(center);
  const mapsEmbedUrl  = `https://www.google.com/maps?q=${encodeURIComponent(center.mapsQuery)}&output=embed`;

  const firstName = (identity?.firstName ?? "").trim().split(/\s+/)[0] || "";
  const apptDate  = formatAppt(appointmentTime);
  const calLinks  = apptDate ? buildCalendarLinks(apptDate.iso, center.fullAddress) : null;

  const [emailCaptured, setEmailCaptured] = useState(false);
  const [checkDrawn,    setCheckDrawn]    = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Confirmed | Men's Wellness Centers";
    if (identity && !identity.phone && !identity.email) patchAction({ identity: undefined });
    const t = setTimeout(() => setCheckDrawn(true), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0B1029" }}>
      <BookConfirmedHero
        firstName={firstName}
        apptDate={apptDate}
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
        calLinks={calLinks}
      />
    </div>
  );
}

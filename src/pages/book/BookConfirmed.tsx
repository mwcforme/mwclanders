/**
 * BookConfirmed — confirmed page wired to real booking store data.
 * UI structure matches mwclocked.pplx.app/#/confirmed exactly.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Check, MapPin, Clock, Phone, Play, Send,
  Droplet, ClipboardList, FlaskConical,
} from "lucide-react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { LOCATIONS, getMapsSearchUrl, LOCATION_KEY_TO_SLUG, type Location } from "@/data/locations";
import { EmailCapture } from "@/components/book/EmailCapture";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";

const DEFAULT_CENTER = LOCATIONS[0];
const TIMEZONE = "America/New_York";

function formatAppt(raw?: string) {
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

  // Physical city from cityStateZip (e.g. "Glen Allen" not "Richmond")
  const physicalCity = center.cityStateZip.split(",")[0];
  const mapsUrl      = getMapsSearchUrl(center);

  const firstName = (identity?.firstName ?? "").trim().split(/\s+/)[0] || "";
  const appt      = formatAppt(appointmentTime);
  const calLinks  = appt ? buildCalendarLinks(appt.iso, center.fullAddress) : null;

  const [sent, setSent]       = useState(false);
  const [playing, setPlaying] = useState(false);
  // Location-based video src
  const LOCATION_VIDEO: Record<string, string> = {
    "richmond-va":       "/videos/what-to-expect-hampton-roads.mp4",
    "newport-news-va":   "/videos/what-to-expect-richmond.mp4",
    "virginia-beach-va": "/videos/what-to-expect-richmond.mp4",
  };
  const videoSrc = LOCATION_VIDEO[center.slug] ?? "/videos/what-to-expect.mp4";

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Confirmed | Men's Wellness Centers";
    if (identity && !identity.phone && !identity.email) patchAction({ identity: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 pt-8 pb-24">

        {/* ── Hero ── */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/15 ring-4 ring-success" aria-hidden="true">
            <Check className="h-10 w-10 text-success" strokeWidth={3} aria-hidden />
          </div>
          <p className="mt-6 font-display text-base font-bold uppercase tracking-[0.22em] text-success">
            Appointment Confirmed
          </p>
          <h1 className="mt-3 font-display text-[34px] sm:text-5xl font-bold leading-[1.1] text-foreground uppercase">
            {firstName ? `You're booked, ${firstName}.` : "You're booked."}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-text-muted leading-snug">
            Your in-person visit is locked in. Your provider will be ready for you.
          </p>
          <p className="mt-2 text-base text-text-muted">
            Same-day labs drawn on-site. Results reviewed before you leave.
          </p>
        </div>

        {/* ── Appointment card ── */}
        <section
          className="mt-8 rounded-2xl bg-panel text-panel-foreground p-6 sm:p-8 shadow-card border-2 border-panel-divider"
          aria-label="Appointment details"
        >
          <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-panel-muted">
            Your Appointment
          </p>

          {appt ? (
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Date block — full width on mobile */}
              <div className="flex-shrink-0 rounded-xl bg-primary text-primary-foreground px-6 py-4 text-center w-full sm:w-auto shadow-cta">
                <p className="font-display text-base font-bold uppercase tracking-[0.18em]">{appt.month}</p>
                <p className="font-display text-6xl sm:text-5xl font-bold leading-none mt-1">{appt.day}</p>
                <p className="font-display text-base font-bold uppercase tracking-[0.18em] mt-2">{appt.weekday}</p>
              </div>
              {/* Details — centered on mobile */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="inline-flex items-center gap-3 font-display text-3xl sm:text-4xl font-bold text-panel-foreground">
                  <Clock className="h-7 w-7 text-primary-hover flex-shrink-0" aria-hidden /> {appt.time}
                </p>
                <p className="mt-3 text-lg font-semibold text-panel-foreground">60 minutes · In-person</p>
                <p className="inline-flex items-center gap-2 text-lg font-semibold mt-1 text-panel-foreground">
                  <MapPin className="h-5 w-5 text-primary-hover flex-shrink-0" aria-hidden /> {physicalCity}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-panel-muted text-base">
              Appointment time not found. Please check your confirmation email.
            </p>
          )}

          {/* Checklist */}
          <ul
            className="mt-6 pt-6 border-t-2 border-panel-divider grid sm:grid-cols-3 gap-3 text-base font-semibold text-panel-foreground"
            aria-label="Appointment checklist"
          >
            {["No-cost consultation", "Your provider reserved", "Bring photo ID"].map(item => (
              <li key={item} className="inline-flex items-start gap-2">
                <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-success" aria-hidden strokeWidth={3} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Calendar buttons ── */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <a
            href={calLinks?.google ?? "#"} target="_blank" rel="noreferrer"
            data-testid="button-add-google"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover font-display font-bold uppercase tracking-wide px-5 py-5 text-base shadow-cta min-h-[60px]"
          >
            <Calendar className="h-6 w-6" aria-hidden /> Add to Google Calendar
          </a>
          <a
            href={calLinks?.ics ?? "#"} download="appointment.ics"
            data-testid="button-add-ics"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-surface text-foreground border-2 border-border hover:bg-surface-2 font-display font-bold uppercase tracking-wide px-5 py-5 text-base min-h-[60px]"
          >
            <Calendar className="h-6 w-6" aria-hidden /> Apple or Outlook
          </a>
        </div>

        {/* ── What You'll Leave With ── */}
        <section className="mt-8 rounded-2xl bg-panel text-panel-foreground shadow-card p-6">
          <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-panel-muted">
            What You'll Leave With
          </p>
          <ul className="mt-5 space-y-5" aria-label="What You'll Leave With">
            {[
              { Icon: Droplet,       text: "Your bloodwork results, explained in plain English." },
              { Icon: ClipboardList, text: "A clear answer on whether treatment fits your situation." },
              { Icon: FlaskConical,  text: "A personalized protocol you can start the same day, when medically appropriate." },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-4">
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="text-lg sm:text-xl text-panel-foreground leading-snug pt-1.5">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Video ── */}
        <section
          className="mt-8 overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card"
          aria-label="Video: What happens when you walk in"
        >
          <div className="relative aspect-video bg-background">
            {/* Video always visible — play button overlay until user starts */}
            <video
              src={videoSrc}
              poster="/images/video-poster.webp"
              controls={playing}
              playsInline
              preload="none"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              onEnded={() => setPlaying(false)}
            />
            {!playing && (
              <button
                type="button"
                data-testid="button-play-video"
                className="absolute inset-0 grid place-items-center group focus-visible:outline-none"
                aria-label="Play video: What happens when you walk in. 2 minutes."
                onClick={(e) => {
                  const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
                  if (video) { video.play().catch(() => {}); }
                  setPlaying(true);
                }}
              >
                <span className="grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-foreground group-hover:bg-primary-hover transition-colors shadow-cta">
                  <Play className="h-10 w-10 ml-1" fill="currentColor" aria-hidden />
                </span>
              </button>
            )}

          </div>
          <div className="bg-panel px-6 py-5 border-t border-panel-divider">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-panel-foreground">
              What happens when you walk in
            </p>
            <p className="mt-1 text-base text-panel-muted font-semibold">60 second video</p>
          </div>
        </section>

        {/* ── Before You Arrive ── */}
        <section className="mt-8 rounded-2xl bg-panel text-panel-foreground shadow-card p-6">
          <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-panel-muted">
            Before You Arrive
          </p>
          <ol className="mt-5 space-y-5" aria-label="Before You Arrive">
            {["Bring a photo ID. Required at check-in.", "Wear loose sleeves. Labs are drawn on-site.", "Drink water. No need to fast.", "Plan for 60 minutes from arrival to checkout."].map((text, i) => (
              <li key={text} className="flex items-start gap-4">
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
                  <span className="font-display font-bold text-xl">{i + 1}</span>
                </span>
                <p className="text-lg sm:text-xl text-panel-foreground leading-snug pt-1.5">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Location ── */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card">
          <div className="p-6">
            <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-panel-muted">Location</p>
            <p className="mt-2 font-display text-2xl font-bold uppercase text-panel-foreground">{physicalCity}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-primary-hover">
              <MapPin className="h-5 w-5" aria-hidden /> {center.driveTime}
            </p>
            <address className="mt-4 not-italic text-lg leading-snug text-panel-foreground">
              <a
                className="underline underline-offset-4 hover:text-primary-hover font-semibold"
                href={mapsUrl} target="_blank" rel="noreferrer"
                data-testid="link-address"
              >
                {center.address}<br />{center.cityStateZip}
              </a>
            </address>
            <p className="mt-4 text-base text-panel-foreground leading-relaxed">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Clock className="h-5 w-5" aria-hidden /> Hours
              </span>
              <br />{center.hours}
            </p>
          </div>
          <div className="p-5 border-t border-panel-divider">
            <a
              href={mapsUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full rounded-xl font-display font-bold uppercase tracking-wide px-5 py-4 text-base min-h-[56px] bg-surface text-foreground hover:opacity-90"
            >
              <MapPin className="h-6 w-6" aria-hidden /> Get Directions
            </a>
          </div>
        </section>

        {/* ── Email Reminder ── */}
        <section className="mt-8 rounded-2xl bg-panel text-panel-foreground shadow-card p-6">
          <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-panel-muted">Email Reminder</p>
          <p className="mt-2 font-display text-2xl font-bold uppercase text-panel-foreground">Send my confirmation</p>
          <p className="mt-2 text-lg text-panel-foreground leading-snug">
            We'll send your appointment details now and a reminder 24 hours before your visit.
          </p>
          {sent ? (
            <p role="status" className="mt-5 inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 text-panel-foreground font-semibold text-base">
              <Check className="h-5 w-5 text-success" aria-hidden /> Confirmation email sent!
            </p>
          ) : (
            <BookingErrorBoundary>
              <EmailCapture
                contactId={identity?.ghlContactId}
                onComplete={() => setSent(true)}
              />
            </BookingErrorBoundary>
          )}
        </section>

        {/* ── Need to change ── */}
        <section
          className="mt-8 rounded-2xl bg-surface border-2 border-border-subtle p-6 text-center"
          aria-label="Need help"
        >
          <p className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
            Need to change your appointment?
          </p>
          <p className="mt-2 text-lg text-text-muted">We're happy to help. Please give us 24-hour notice so we can offer your slot to another member.</p>
          <a
            href={`tel:${center.phone.replace(/\D/g, "")}`}
            data-testid="link-call-help"
            className="mt-5 inline-flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover font-display font-bold uppercase tracking-wide px-6 py-5 text-lg shadow-cta min-h-[60px] w-full sm:w-auto"
          >
            <Phone className="h-6 w-6" aria-hidden /> Call {center.phone}
          </a>
          <p className="mt-4">
            <Link
              to="/book/schedule"
              data-testid="link-pick-different"
              className="inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wide text-foreground underline underline-offset-4 hover:text-primary px-3 py-2"
            >
              Or pick a different time
            </Link>
          </p>
        </section>

      </main>
    </div>
  );
}

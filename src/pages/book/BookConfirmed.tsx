/**
 * BookConfirmed — confirmed page wired to real booking store data.
 * UI structure matches mwclocked.pplx.app/#/confirmed exactly.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Check, MapPin, Clock, Phone, Play,
  Droplet, ClipboardList, FlaskConical,
} from "lucide-react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { LOCATIONS, getMapsSearchUrl, LOCATION_KEY_TO_SLUG, type Location } from "@/data/locations";
import { EmailCapture } from "@/components/book/EmailCapture";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { trackConversion } from "@/lib/capi";

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

const SERVICE_LABELS: Record<string, string> = { trt: "testosterone", ed: "ED care", wl: "weight loss", general: "men's health" };

function buildCalendarLinks(iso: string, address: string, service?: string | null) {
  const start = new Date(iso);
  const end   = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt   = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = "Men's Wellness Centers Appointment";
  const serviceLabel = SERVICE_LABELS[service ?? "general"] ?? "men's health";
  const desc  = `Your no-cost ${serviceLabel} consultation. Bring photo ID.`;
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(address)}&details=${encodeURIComponent(desc)}`;
  const ics    = ["BEGIN:VCALENDAR","VERSION:2.0","BEGIN:VEVENT",`DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,`SUMMARY:${title}`,`LOCATION:${address}`,`DESCRIPTION:${desc}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  return { google, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}

export default function BookConfirmed() {
  const appointmentTime = useBookingStore(s => s.appointmentTime);
  const location        = useBookingStore(s => s.location);
  const identity        = useBookingStore(s => s.identity);
  const lpSlug          = useBookingStore(s => s.lpSlug);
  const service         = useBookingStore(s => s.service);
  const patchAction     = useBookingStore(s => s.patch);

  const slug   = location ? LOCATION_KEY_TO_SLUG[location] : null;
  const center: Location = (slug && LOCATIONS.find(l => l.slug === slug)) || DEFAULT_CENTER;

  // Physical city from cityStateZip (e.g. "Glen Allen" not "Richmond")
  const physicalCity = center.cityStateZip.split(",")[0];
  const mapsUrl      = getMapsSearchUrl(center);

  const firstName = (identity?.firstName ?? "").trim().split(/\s+/)[0] || "";
  const appt      = formatAppt(appointmentTime);
  const calLinks  = appt ? buildCalendarLinks(appt.iso, center.fullAddress, service) : null;

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

    // MWC-002: Fire booking_complete exactly once on confirmed render.
    // booking_id = contactId+slot dedup key; guards against double-fire on re-render.
    const bookingId = [identity?.ghlContactId, appointmentTime].filter(Boolean).join("_") || crypto.randomUUID();
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "booking_complete",
        booking_id: bookingId,
        location: (location ?? "").replace("-", "_"),
        service: service ?? "general",
        appt_value: 150,
        currency: "USD",
      });
    }
    void trackConversion("Schedule", {
      event_id: bookingId,
      user_data: {
        phone: identity?.phone,
        email: identity?.email,
        first_name: identity?.firstName,
        last_name: identity?.lastName,
      },
      custom_data: { content_name: "booking_confirmed", value: 150, currency: "USD", lp_slug: lpSlug ?? undefined },
    });
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
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight text-foreground uppercase tracking-[0.01em]">
            {firstName ? `You're booked, ${firstName}.` : "You're booked."}
          </h1>
          <p className="mt-3 text-base text-text-muted leading-snug">
            Your provider is reserved. Here's everything you need.
          </p>
        </div>

        {/* ── Appointment card ── */}
        <section
          className="mt-8 rounded-2xl bg-panel text-panel-foreground p-6 sm:p-8 shadow-card border-2 border-panel-divider"
          aria-label="Appointment details"
        >
          {appt ? (
            <div className="mt-4 space-y-3">
              {/* Date + time row */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-center min-w-[64px] shadow-cta">
                  <p className="font-display text-xs font-bold uppercase tracking-wider">{appt.month}</p>
                  <p className="font-display text-3xl font-bold leading-none mt-0.5">{appt.day}</p>
                  <p className="font-display text-xs font-bold uppercase tracking-wider mt-0.5">{appt.weekday}</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-panel-foreground">{appt.time}</p>
                  <p className="mt-0.5 text-sm text-panel-muted">60 minutes &middot; In-person</p>
                  <p className="mt-0.5 text-sm font-semibold text-panel-foreground">{physicalCity} Men's Wellness Center</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-panel-muted text-base">
              Appointment time not found. Please check your confirmation email.
            </p>
          )}

          {/* Location + quick-confirm */}
          <div className="mt-5 pt-5 border-t border-panel-divider space-y-3">
            {/* Address row */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" aria-hidden />
              <div>
                <address className="not-italic">
                  <a
                    className="text-sm font-semibold text-panel-foreground underline underline-offset-4 hover:text-primary leading-snug"
                    href={mapsUrl} target="_blank" rel="noreferrer"
                    data-testid="link-address"
                  >
                    {center.address}, {center.cityStateZip}
                  </a>
                </address>
                <p className="text-xs text-panel-muted mt-0.5">{center.driveTime}</p>
              </div>
            </div>
            {/* Hours row */}
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 flex-shrink-0 mt-0.5 text-panel-muted" aria-hidden />
              <p className="text-xs text-panel-muted leading-snug">{center.hours}</p>
            </div>
            {/* Checklist */}
            <ul className="pt-2 border-t border-panel-divider grid sm:grid-cols-2 gap-2 text-sm font-sans font-medium text-panel-foreground">
              {["Labs drawn on-site", "Bring photo ID"].map(item => (
                <li key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-success" aria-hidden strokeWidth={3} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {/* Directions button */}
            <a
              href={mapsUrl} target="_blank" rel="noreferrer"
              className="mt-1 inline-flex items-center justify-center gap-2 w-full rounded-xl font-display font-bold uppercase tracking-wide px-4 py-3 text-sm min-h-[48px] bg-surface text-foreground hover:opacity-90"
            >
              <MapPin className="h-4 w-4" aria-hidden /> Get Directions
            </a>
          </div>
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
          <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-panel-muted">
            What You'll Leave With
          </p>
          <ul className="mt-4 space-y-4" aria-label="What You'll Leave With">
            {[
              { Icon: Droplet,       text: "Your bloodwork results, explained in plain English." },
              { Icon: ClipboardList, text: "A clear answer on whether treatment is right for you." },
              { Icon: FlaskConical,  text: "A personalized care plan, built around your labs." },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-base text-panel-foreground leading-snug pt-1">{text}</p>
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
          <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-panel-muted">
            Before You Arrive
          </p>
          <ol className="mt-4 space-y-4" aria-label="Before You Arrive">
            {["Bring your photo ID.", "Drink water. No need to fast.", "Plan for 60 minutes."].map((text, i) => (
              <li key={text} className="flex items-start gap-3">
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
                  <span className="font-display font-bold text-base">{i + 1}</span>
                </span>
                <p className="text-base text-panel-foreground leading-snug pt-1">{text}</p>
              </li>
            ))}
          </ol>
        </section>


        {/* ── Email Reminder ── */}
        <section className="mt-8 rounded-2xl bg-panel text-panel-foreground shadow-card p-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-panel-muted">Confirmation Email</p>
          <p className="mt-2 text-base text-panel-foreground leading-snug">
            Get your appointment details and a reminder the day before.
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
          <p className="mt-2 text-lg text-text-muted">Call us and we'll get it sorted.</p>
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

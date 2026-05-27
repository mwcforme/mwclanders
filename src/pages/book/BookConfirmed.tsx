/**
 * BookConfirmed — new Confirmed UI wired to real booking store data.
 * Design: /data/.openclaw/workspace/mwc-book-upload/client/src/pages/Confirmed.tsx
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar, Check, MapPin, Clock, IdCard, FlaskConical,
  ClipboardList, Droplet, Send, Phone, ChevronRight, Play,
} from "lucide-react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { LOCATIONS, getMapsSearchUrl, LOCATION_KEY_TO_SLUG, type Location } from "@/data/locations";

const DEFAULT_CENTER = LOCATIONS[0];
const TIMEZONE = "America/New_York";

function formatAppt(raw?: string) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return {
    monthShort: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: TIMEZONE }).format(d).toUpperCase(),
    day: new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: TIMEZONE }).format(d),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: TIMEZONE }).format(d).toUpperCase(),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE }).format(d).replace(/\u202f/g, " "),
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
  const routerLoc = useLocation();
  const navState  = (routerLoc.state || {}) as { appointmentTime?: string };

  const appointmentTime = useBookingStore(s => s.appointmentTime);
  const location        = useBookingStore(s => s.location);
  const identity        = useBookingStore(s => s.identity);
  const patchAction     = useBookingStore(s => s.patch);

  const effectiveAppt = appointmentTime || navState.appointmentTime;

  const slug   = location ? LOCATION_KEY_TO_SLUG[location] : null;
  const center: Location = (slug && LOCATIONS.find(l => l.slug === slug)) || DEFAULT_CENTER;
  const mapsUrl     = getMapsSearchUrl(center);
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(center.mapsQuery)}&output=embed`;

  const firstName = (identity?.firstName ?? "").trim().split(/\s+/)[0] || "";
  const appt      = formatAppt(effectiveAppt);
  const calLinks  = appt ? buildCalendarLinks(appt.iso, center.fullAddress) : null;

  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (identity && !identity.phone && !identity.email) patchAction({ identity: undefined });
    document.title = "Confirmed | Men's Wellness Centers";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 pt-5 sm:pt-8 pb-24">

        {/* Location + status row */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-primary-hover flex-shrink-0" aria-hidden />
            <p className="font-display text-sm font-bold uppercase tracking-[0.22em] truncate" style={{ color: 'var(--c-text-on-light-muted)' }}>
              {center.city}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-success">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> Confirmed
          </span>
        </div>

        {/* Hero */}
        <div className="mt-4">
          <h1 className="font-display text-[26px] sm:text-4xl font-bold leading-[1.1] text-foreground uppercase">
            {firstName ? `You're booked, ${firstName}.` : "You're booked."}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-text-muted leading-snug">
            Your provider at Men's Wellness Centers is reserved. Here's everything you need.
          </p>
        </div>

        {/* Appointment hero card */}
        <section className="mt-5 rounded-2xl bg-panel text-panel-foreground p-5 sm:p-7 shadow-card border-2 border-panel-divider"
          aria-label="Appointment details">
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-2 py-1 inline-block mb-1">
            Your Appointment
          </p>

          {appt ? (
            <div className="mt-4 flex flex-row items-center gap-4 sm:gap-6">
              {/* Date block */}
              <div className="flex-shrink-0 rounded-xl bg-primary text-white px-4 py-3 sm:px-6 sm:py-4 text-center w-[88px] sm:w-auto shadow-cta">
                <p className="font-display text-xs sm:text-base font-bold uppercase tracking-[0.18em]">{appt.monthShort}</p>
                <p className="font-display text-4xl sm:text-5xl font-bold leading-none mt-0.5">{appt.day}</p>
                <p className="font-display text-xs sm:text-base font-bold uppercase tracking-[0.18em] mt-1">{appt.weekday}</p>
              </div>
              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className="inline-flex items-center gap-2 sm:gap-3 font-display text-2xl sm:text-4xl font-bold text-panel-foreground">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" aria-hidden /> {appt.time}
                </p>
                <p className="mt-2 text-sm sm:text-lg font-semibold text-panel-foreground">60 minutes · In-person</p>
                <p className="inline-flex items-center gap-2 text-sm sm:text-lg font-semibold mt-1 text-panel-foreground">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden /> {center.city}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-panel-muted text-base">Appointment time not found. Please check your confirmation email.</p>
          )}

          {/* Checklist */}
          <ul className="mt-5 pt-5 border-t-2 border-panel-divider grid sm:grid-cols-3 gap-3 text-sm sm:text-base font-semibold text-panel-foreground">
            {["No-cost consultation","Your provider reserved","Bring photo ID"].map(item => (
              <li key={item} className="inline-flex items-start gap-2">
                <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-success" aria-hidden strokeWidth={3} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Calendar buttons */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <a href={calLinks?.google ?? "#"} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary text-white hover:bg-primary-hover font-display font-bold uppercase tracking-wide px-5 py-5 text-base shadow-cta min-h-[60px]">
            <Calendar className="h-6 w-6" aria-hidden /> Add to Google Calendar
          </a>
          <a href={calLinks?.ics ?? "#"} download="appointment.ics"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-surface text-white hover:opacity-90 font-display font-bold uppercase tracking-wide px-5 py-5 text-base min-h-[60px]">
            <Calendar className="h-6 w-6" aria-hidden /> Apple or Outlook
          </a>
        </div>

        {/* What you'll leave with */}
        <SectionCard eyebrow="What You'll Leave With" items={[
          { icon: <Droplet className="h-6 w-6" />, text: "Your bloodwork results, explained in plain English." },
          { icon: <ClipboardList className="h-6 w-6" />, text: "A clear answer on whether treatment fits your situation." },
          { icon: <FlaskConical className="h-6 w-6" />, text: "A personalized protocol you can start the same day, when medically appropriate." },
        ]} />

        {/* Video */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card"
          aria-label="Video: What happens when you walk in">
          <div className="relative aspect-video bg-background">
            {!playing ? (
              <button type="button"
                className="absolute inset-0 grid place-items-center group focus-visible:outline-none"
                aria-label="Play video: What happens when you walk in. 2 minutes."
                onClick={() => setPlaying(true)}>
                <span className="grid h-24 w-24 place-items-center rounded-full bg-primary text-white group-hover:bg-primary-hover transition-colors shadow-cta">
                  <Play className="h-10 w-10 ml-1" fill="currentColor" aria-hidden />
                </span>
              </button>
            ) : (
              <video src="/videos/what-to-expect.mp4" poster="/images/video-poster.webp"
                autoPlay controls playsInline
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div className="bg-panel px-6 py-5 border-t border-panel-divider">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-panel-foreground">
              What happens when you walk in
            </p>
            <p className="mt-1 text-base font-semibold" style={{ color: 'var(--c-text-on-light-muted)' }}>2 minute video</p>
          </div>
        </section>

        {/* Before you arrive */}
        <SectionCard eyebrow="Before You Arrive" ordered items={[
          { icon: <IdCard className="h-6 w-6" />, text: "Bring your photo ID." },
          { icon: <Droplet className="h-6 w-6" />, text: "Drink water. No need to fast." },
          { icon: <Clock className="h-6 w-6" />, text: "Plan for 60 minutes." },
        ]} />

        {/* Location */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card">
          <div className="p-6">
            <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-2 py-1 inline-block mb-1">Location</p>
            <p className="mt-2 font-display text-2xl font-bold uppercase text-panel-foreground">{center.city}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-primary-hover">
              <MapPin className="h-5 w-5" aria-hidden /> {center.driveTime}
            </p>
            <address className="mt-4 not-italic text-lg leading-snug text-panel-foreground">
              <a className="underline underline-offset-4 hover:text-primary font-semibold"
                href={mapsUrl} target="_blank" rel="noreferrer">
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
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full rounded-xl font-display font-bold uppercase tracking-wide px-5 py-4 text-base min-h-[56px] text-white hover:opacity-90" style={{ background: 'var(--brand-navy-deep)' }}>
              <MapPin className="h-6 w-6" aria-hidden /> Get Directions
              <ChevronRight className="h-5 w-5" aria-hidden />
            </a>
          </div>
        </section>

        {/* Email reminder */}
        <section className="mt-8 rounded-2xl bg-panel text-panel-foreground shadow-card p-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-2 py-1 inline-block mb-1">Email Reminder</p>
          <p className="mt-2 font-display text-2xl font-bold uppercase text-panel-foreground">Send my confirmation</p>
          <p className="mt-2 text-lg text-panel-foreground leading-snug">
            We'll email your appointment details and a reminder the day before.
          </p>
          <form onSubmit={e => { e.preventDefault(); setSent(true); }}
            className="mt-5 flex flex-col gap-3" aria-label="Send confirmation by email">
            <label htmlFor="conf-email" className="font-display text-base font-semibold text-panel-foreground">
              Your email address
            </label>
            <input id="conf-email" type="email" required placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="rounded-xl border-2 border-panel-border bg-panel text-panel-foreground placeholder:text-panel-muted px-5 py-4 text-lg focus-visible:border-primary min-h-[56px]" />
            <button type="submit"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary text-white hover:bg-primary-hover font-display font-bold uppercase tracking-wide px-5 py-4 text-base shadow-cta min-h-[56px]">
              <Send className="h-6 w-6" aria-hidden /> {sent ? "Sent!" : "Send to my email"}
            </button>
          </form>
          {sent && (
            <p role="status" className="mt-4 inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-success/15 text-panel-foreground font-semibold text-base">
              <Check className="h-5 w-5 text-success" aria-hidden /> Confirmation sent to {email}
            </p>
          )}
        </section>

        {/* Need to change */}
        <section className="mt-8 rounded-2xl bg-surface p-6 text-center">
          <p className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Need to change your appointment?
          </p>
          <p className="mt-2 text-lg text-white/75">We're happy to help. 24-hour notice is appreciated.</p>
          <a href={`tel:${center.phone.replace(/\D/g,"")}`}
            className="mt-5 inline-flex items-center justify-center gap-3 rounded-xl bg-primary text-white hover:bg-primary-hover font-display font-bold uppercase tracking-wide px-6 py-5 text-lg shadow-cta min-h-[60px] w-full sm:w-auto">
            <Phone className="h-6 w-6" aria-hidden /> Call {center.phone}
          </a>
          <p className="mt-4">
            <Link to="/book/schedule"
              className="inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wide text-white/80 underline underline-offset-4 hover:text-white px-3 py-2">
              Or pick a different time
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

function SectionCard({ eyebrow, items, ordered }: {
  eyebrow: string;
  items: { icon: React.ReactNode; text: string }[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <section className="mt-8 rounded-2xl bg-panel text-panel-foreground shadow-card p-6">
      <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-2 py-1 inline-block mb-1">{eyebrow}</p>
      <Tag className="mt-5 space-y-5" aria-label={eyebrow}>
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary text-white" aria-hidden>
              {ordered ? <span className="font-display font-bold text-xl">{i + 1}</span> : item.icon}
            </span>
            <p className="text-lg sm:text-xl text-panel-foreground leading-snug pt-1.5">{item.text}</p>
          </li>
        ))}
      </Tag>
    </section>
  );
}

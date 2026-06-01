/**
 * /product/trt/success — Thank you / all set
 * Step 7 (final) of the 10-step TRT funnel.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { contactUpdater } from "@/services/contactUpdater";

const ORANGE = "var(--brand-cta)";
const NAVY   = "var(--brand-navy-deep)";

function formatApptTime(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      weekday: "long", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
      timeZone: "America/New_York",
    });
  } catch {
    return iso;
  }
}

function buildGoogleCalendarUrl(title: string, startIso: string | undefined, location: string | undefined): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  if (!startIso) return base;
  const start = new Date(startIso);
  const end   = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return `${base}&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(location ?? "Men's Wellness Centers")}`;
}

function buildIcsContent(startIso: string | undefined, location: string | undefined): string {
  const start = startIso ? new Date(startIso) : new Date();
  const end   = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt   = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MensWellnessCenters//TRT//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Men's Wellness Centers Appointment`,
    `LOCATION:${location ?? "Men's Wellness Centers"}`,
    `DESCRIPTION:Your no-cost testosterone visit`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

const NEXT_STEPS = [
  "Check your phone for a confirmation text",
  "Your provider reviews your intake",
  "Complete labs if required",
];

const LOCATION_LABELS: Record<string, string> = {
  "richmond":       "Richmond, VA",
  "virginia-beach": "Virginia Beach, VA",
  "newport-news":   "Newport News, VA",
};

export default function TRTSuccess() {
  const navigate     = useNavigate();
  const location     = useBookingStore((s) => s.location);
  const apptTime     = useBookingStore((s) => s.appointmentTime);
  const identity     = useBookingStore((s) => s.identity);

  const locationLabel = location ? (LOCATION_LABELS[location] ?? location) : "Men's Wellness Centers";
  const apptLabel     = formatApptTime(apptTime);
  const calTitle      = "Men's Wellness Centers Appointment";

  // On mount: confetti, GHL tag, analytics event
  useEffect(() => {
    // Confetti celebration
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ["var(--brand-cta)", "#F97316", "#FCD9B4", "var(--c-text-on-dark)"],
      });
    }).catch(() => {});

    // GHL tag — fire-and-forget
    const contactId = identity?.ghlContactId;
    if (contactId) contactUpdater.addTag(contactId, "funnel-complete").catch(() => {});

    // Analytics event — no PHI
    (window as Window & { dataLayer?: unknown[] }).dataLayer?.push({
      event: "product_trt_funnel_complete",
      location: location ?? undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIcsDownload = () => {
    const content = buildIcsContent(apptTime, locationLabel);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "trt-appointment.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="You're All Set! | Men's Wellness Centers"
        description="Your TRT visit request has been received. Your provider will be in touch shortly."
      />
      <TRTHeader minimal />

      <main className="flex-1 flex items-center justify-center" style={{ padding: "80px 16px 48px" }}>
        <div className="w-full text-center" style={{ maxWidth: 560 }}>

          {/* Animated check circle */}
          <div style={{ marginBottom: 28 }}>
            <svg
              width={96}
              height={96}
              viewBox="0 0 96 96"
              fill="none"
              aria-hidden="true"
              style={{ display: "inline-block" }}
            >
              <circle cx={48} cy={48} r={44} stroke="#16A34A" strokeWidth={4} fill="rgba(22,163,74,0.10)" />
              <style>{`
                @keyframes drawCheck {
                  from { stroke-dashoffset: 60; }
                  to   { stroke-dashoffset: 0; }
                }
                .check-path {
                  stroke-dasharray: 60;
                  stroke-dashoffset: 60;
                  animation: drawCheck 0.5s 0.3s ease forwards;
                }
              `}</style>
              <polyline
                className="check-path"
                points="28,50 42,64 68,34"
                stroke="#16A34A"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="font-display font-bold text-panel-foreground uppercase leading-tight mb-3" style={{ fontSize: "clamp(28px, 6vw, 40px)" }}>
            You're All Set!
          </h1>
          <p className="text-base mb-9 leading-relaxed" style={{ color: "var(--c-text-on-light-muted)" }}>
            We've received everything we need. Your provider will be in touch shortly to confirm your appointment.
          </p>

          {/* Appointment summary card */}
          <div className="bg-panel shadow-card rounded-2xl p-6 mb-8 text-left">
            <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-2 py-1 inline-block mb-3">
              Appointment Summary
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="text-sm text-panel-muted">Location</span>
                <span className="text-sm font-semibold text-panel-foreground">{locationLabel}</span>
              </div>
              <div style={{ height: 1, background: "#F3F4F6" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span className="text-sm text-panel-muted flex-shrink-0">Appointment</span>
                <span className="text-sm font-semibold text-panel-foreground text-right">{apptLabel}</span>
              </div>
            </div>

            {/* Calendar buttons */}
            <div className="flex gap-2.5 flex-wrap">
              <a
                href={buildGoogleCalendarUrl(calTitle, apptTime, locationLabel)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] h-11 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center no-underline shadow-cta hover:bg-primary-hover transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Google Calendar
              </a>
              <button
                type="button"
                onClick={handleIcsDownload}
                className="flex-1 min-w-[120px] h-11 rounded-full bg-surface text-white font-bold text-sm flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Add .ics File
              </button>
            </div>
          </div>

          {/* Next steps */}
          <div className="text-left mb-8 space-y-4">
            {NEXT_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="h-8 w-8 rounded-full flex-shrink-0 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <span className="font-display font-bold text-sm text-primary">{i + 1}</span>
                </div>
                <span className="text-[15px] text-panel-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Return home CTA */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full h-14 rounded-full bg-primary text-white font-display font-bold text-lg uppercase tracking-[0.04em] shadow-cta cursor-pointer hover:bg-primary-hover transition-colors"
          >
            Return to Home
          </button>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}

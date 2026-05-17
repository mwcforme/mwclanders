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

const ORANGE = "#E8670A";
const NAVY   = "#0B1029";

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
    `DESCRIPTION:Your no-cost testosterone consultation`,
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
        colors: ["#E8670A", "#F97316", "#FCD9B4", "#FFFFFF"],
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
    a.href = url; a.download = "trt-consultation.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: NAVY }}>
      <SEO
        title="You're All Set! | Men's Wellness Centers"
        description="Your TRT consultation request has been received. Your provider will be in touch shortly."
      />
      <TRTHeader minimal />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>

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
          <h1 style={{
            fontFamily: "Oswald, sans-serif", fontWeight: 700,
            fontSize: "clamp(28px, 6vw, 40px)", color: "#FFFFFF",
            marginBottom: 12, lineHeight: 1.1,
          }}>
            You're All Set!
          </h1>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 16, marginBottom: 36, lineHeight: 1.5 }}>
            We've received everything we need. Your provider will be in touch shortly to confirm your appointment.
          </p>

          {/* Appointment summary card */}
          <div style={{
            background: "#FFFFFF", borderRadius: 14, padding: "24px 24px",
            marginBottom: 32, textAlign: "left",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "#9CA3AF",
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: 12, fontFamily: "Inter, sans-serif",
            }}>
              Appointment Summary
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#6B7280", fontFamily: "Inter, sans-serif" }}>Location</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: NAVY, fontFamily: "Inter, sans-serif" }}>{locationLabel}</span>
              </div>
              <div style={{ height: 1, background: "#F3F4F6" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, color: "#6B7280", fontFamily: "Inter, sans-serif", flexShrink: 0 }}>Appointment</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: NAVY, fontFamily: "Inter, sans-serif", textAlign: "right" }}>{apptLabel}</span>
              </div>
            </div>

            {/* Calendar buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={buildGoogleCalendarUrl(calTitle, apptTime, locationLabel)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, minWidth: 120, height: 44, borderRadius: 999,
                  background: ORANGE, color: "#FFFFFF", border: "none",
                  fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", cursor: "pointer",
                }}
              >
                Google Calendar
              </a>
              <button
                type="button"
                onClick={handleIcsDownload}
                style={{
                  flex: 1, minWidth: 120, height: 44, borderRadius: 999,
                  background: "transparent", border: `2px solid ${NAVY}`,
                  color: NAVY, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                Add .ics File
              </button>
            </div>
          </div>

          {/* Next steps */}
          <div style={{ textAlign: "left", marginBottom: 32 }}>
            {NEXT_STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  marginBottom: i < NEXT_STEPS.length - 1 ? 16 : 0,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(255,255,255,0.10)",
                  border: `1.5px solid rgba(255,255,255,0.20)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: "Oswald, sans-serif", fontWeight: 700,
                    fontSize: 14, color: ORANGE,
                  }}>
                    {i + 1}
                  </span>
                </div>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.80)", fontFamily: "Inter, sans-serif" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Return home CTA */}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              width: "100%", height: 56, borderRadius: 999,
              background: ORANGE, color: "#FFFFFF", border: "none",
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,103,10,0.35)",
            }}
          >
            Return to Home
          </button>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}

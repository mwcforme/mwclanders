import { useEffect } from "react";
import { Phone, MessageSquareText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { supabase } from "@/integrations/supabase/client";

const PHONE_DISPLAY = "(866) 344-4955";
const PHONE_TEL = "tel:8663444955";
const SMS_HREF = "sms:8663444955";

// Business hours: Mon–Fri 8:00 AM – 6:00 PM ET, Sat 8:00 AM – 4:00 PM ET
const isTeamAvailable = (): boolean => {
  const now = new Date();
  const et = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
    hour12: false,
  }).formatToParts(now);
  const day = et.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(et.find((p) => p.type === "hour")?.value ?? "0", 10);
  const isSat = day === "Sat";
  const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
  if (isSat) return hour >= 8 && hour < 16;
  return isWeekday && hour >= 8 && hour < 18;
};

/**
 * /book/lets-talk — Termination page for the "Something else" symptom path.
 *
 * Goal: phone conversion. These are still leads — they just don't fit our
 * three primary service buckets, so we want a human to triage. NOT a
 * disqualifier or a dead-end. Tag in GHL as lead_quality: needs_qualifying.
 *
 * Design follows the same AMD playbook as the schedule page:
 *   - 22px+ body, 32px+ headlines, sentence case
 *   - 3px slate borders on cards (visible boundaries)
 *   - 64px+ primary CTAs (call) and 64px+ secondary CTAs (text)
 *   - Sticky mobile tap-to-call bar
 *   - Two contact methods so the user picks whichever they're comfortable with
 */
const BookLetsTalk = () => {
  const identity = useBookingStore((s) => s.identity);

  // CRO: tag lead as booking_failed in GHL so coordinator can call within 5 min
  useEffect(() => {
    if (!identity?.ghlContactId) return;
    supabase.functions.invoke("ghl-proxy", {
      body: {
        path: `/contacts/${identity.ghlContactId}/tags`,
        method: "POST",
        body: { tags: ["booking_failed"] },
        __env: import.meta.env.VITE_APP_ENV ?? "stage",
      },
    }).catch(() => { /* non-blocking — never break the UX */ });
  }, [identity?.ghlContactId]);

  const trackCallClick = () => {
    const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    if (typeof window !== "undefined" && dl) {
      dl.push({ event: "phone_click", page: "lets-talk" });
    }
  };
  const trackSmsClick = () => {
    const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    if (typeof window !== "undefined" && dl) {
      dl.push({ event: "sms_click", page: "lets-talk" });
    }
  };

  return (
    <BookLayout page="lets-talk" title="Let's talk it through | Men's Wellness Centers">
      <div className="px-4 md:px-6 pt-8 md:pt-14 pb-28 md:pb-16">
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            {isTeamAvailable() && (
              <div
                className="inline-flex items-center gap-2 mb-4 md:mb-5"
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(232,103,10,0.12)",
                  border: "1px solid rgba(232,103,10,0.35)",
                  color: "#FFB07A",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22C55E" }} />
                Team available now
              </div>
            )}
            <h1
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(28px, 5vw, 44px)",
                color: "#FFFFFF",
                lineHeight: 1.1,
                letterSpacing: "0.01em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Let's find the right visit for you.
            </h1>
            <p
              className="text-base md:text-lg"
              style={{
                color: "rgba(255,255,255,0.72)",
                fontWeight: 400,
                lineHeight: 1.5,
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              Call or text us. A real person will match you with the right visit. No phone tree, no runaround.
            </p>
          </div>

          {/* Contact cards — side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* PRIMARY: Call */}
            <section
              style={{
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 40, height: 40, borderRadius: 10, background: "#E8670A" }}
                >
                  <Phone size={20} strokeWidth={2.25} style={{ color: "#FFFFFF" }} />
                </span>
                <div>
                  <h2
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#0B1029",
                      lineHeight: 1.2,
                    }}
                  >
                    Call us
                  </h2>
                  <p style={{ color: "#5A6478", fontSize: 14, fontWeight: 500, lineHeight: 1.35, marginTop: 2 }}>
                    Mon–Fri 8am–6pm · Sat 8am–4pm. A real person picks up.
                  </p>
                </div>
              </div>

              <a
                href={PHONE_TEL}
                onClick={trackCallClick}
                className="flex items-center justify-center gap-2 transition-transform hover:-translate-y-[1px]"
                style={{
                  width: "100%",
                  minHeight: 60,
                  background: "#E8670A",
                  color: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  borderRadius: 10,
                  textDecoration: "none",
                  padding: "14px 20px",
                  boxShadow: "0 6px 16px rgba(232,103,10,0.35)",
                  marginTop: "auto",
                }}
              >
                <Phone size={20} strokeWidth={2.5} />
                <span>{PHONE_DISPLAY}</span>
              </a>

            </section>

            {/* SECONDARY: Text */}
            <section
              style={{
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 40, height: 40, borderRadius: 10, background: "#FFF5EE" }}
                >
                  <MessageSquareText size={20} strokeWidth={2.25} style={{ color: "#E8670A" }} />
                </span>
                <div>
                  <h2
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#0B1029",
                      lineHeight: 1.2,
                    }}
                  >
                    Prefer to text?
                  </h2>
                  <p style={{ color: "#5A6478", fontSize: 14, fontWeight: 500, lineHeight: 1.35, marginTop: 2 }}>
                    Same number. We reply same day.
                  </p>
                </div>
              </div>

              <a
                href={SMS_HREF}
                onClick={trackSmsClick}
                className="flex items-center justify-center gap-2 transition-transform hover:-translate-y-[1px]"
                style={{
                  width: "100%",
                  minHeight: 60,
                  background: "#FFFFFF",
                  color: "#0B1029",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  borderRadius: 10,
                  textDecoration: "none",
                  padding: "14px 20px",
                  border: "2px solid #0B1029",
                  marginTop: "auto",
                }}
              >
                <MessageSquareText size={20} strokeWidth={2.5} />
                <span>{PHONE_DISPLAY}</span>
              </a>

              <p style={{ color: "#6B7280", fontSize: 12, marginTop: 10, textAlign: "center" }}>
                Replies from (866) 344-4955. Standard messaging rates apply.
              </p>
            </section>
          </div>

          {/* Re-entry path for users who want to book online */}
          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", textDecoration: "none" }}
            >
              <ArrowLeft size={14} />
              Book online instead
            </Link>
          </div>

        </div>
      </div>

      {/* STICKY MOBILE TAP-TO-CALL BAR */}
      <a
        href={PHONE_TEL}
        onClick={trackCallClick}
        aria-label={`Call ${PHONE_DISPLAY}`}
        className="md:hidden fixed inset-x-0 bottom-0 flex items-center justify-center gap-3 z-50"
        style={{
          background: "#E8670A",
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          textDecoration: "none",
          minHeight: 72,
          padding: "16px 20px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.25)",
        }}
      >
        <Phone size={24} strokeWidth={2.5} />
        <span>CALL {PHONE_DISPLAY}</span>
      </a>
    </BookLayout>
  );
};

export default BookLetsTalk;

import { Phone, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { ContactCard } from "@/components/book/ContactCard";
import { PHONE } from "@/lib/constants";

const PHONE_DISPLAY = PHONE.display;
const PHONE_TEL = PHONE.tel;
const SMS_HREF = PHONE.sms;

function isTeamAvailable(): boolean {
  const now = new Date();
  const et = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", hour: "numeric", minute: "numeric",
    weekday: "short", hour12: false,
  }).formatToParts(now);
  const day = et.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(et.find((p) => p.type === "hour")?.value ?? "0", 10);
  const isSat = day === "Sat";
  const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
  if (isSat) return hour >= 8 && hour < 16;
  return isWeekday && hour >= 8 && hour < 18;
}

function trackEvent(event: string, page: string) {
  const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (typeof window !== "undefined" && dl) dl.push({ event, page });
}

/**
 * /book/lets-talk — Termination page for the "Something else" symptom path.
 * Goal: phone conversion via call or text. Not a disqualifier.
 */
const BookLetsTalk = () => {
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
                  padding: "6px 12px", borderRadius: 999,
                  // hardcoded-color-allow-next-line
                  background: "rgba(232,103,10,0.12)",
                  // hardcoded-color-allow-next-line
                  border: "1px solid rgba(232,103,10,0.35)",
                  // hardcoded-color-allow-next-line
                  color: "#FFB07A",
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22C55E" }} />
                Team available now
              </div>
            )}
            <h1
              style={{
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: "clamp(28px, 5vw, 44px)", color: "var(--c-text-on-dark)",
                lineHeight: 1.1, letterSpacing: "0.01em", textTransform: "uppercase", marginBottom: 12,
              }}
            >
              Let's find the right visit for you.
            </h1>
            <p
              className="text-base md:text-lg"
              style={{ color: "rgba(255,255,255,0.72)", fontWeight: 400, lineHeight: 1.5, maxWidth: 520, margin: "0 auto" }}
            >
              Call or text us. A real person will match you with the right visit. No phone tree, no runaround.
            </p>
          </div>

          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <ContactCard
              type="call"
              phoneDisplay={PHONE_DISPLAY}
              phoneTel={PHONE_TEL}
              smsHref={SMS_HREF}
              onCallClick={() => trackEvent("phone_click", "lets-talk")}
              onSmsClick={() => trackEvent("sms_click", "lets-talk")}
            />
            <ContactCard
              type="text"
              phoneDisplay={PHONE_DISPLAY}
              phoneTel={PHONE_TEL}
              smsHref={SMS_HREF}
              onCallClick={() => trackEvent("phone_click", "lets-talk")}
              onSmsClick={() => trackEvent("sms_click", "lets-talk")}
            />
          </div>

          {/* Back link */}
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

      {/* Sticky mobile tap-to-call bar */}
      <a
        href={PHONE_TEL}
        onClick={() => trackEvent("phone_click", "lets-talk")}
        aria-label={`Call ${PHONE_DISPLAY}`}
        className="md:hidden fixed inset-x-0 bottom-0 flex items-center justify-center gap-3 z-50"
        style={{
          background: "var(--brand-cta)", color: "var(--c-text-on-dark)",
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 22,
          textDecoration: "none", minHeight: 72, padding: "16px 20px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          // hardcoded-color-allow-next-line
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

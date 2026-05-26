import { useRef } from "react";
import { Calendar, MapPin, ChevronRight, Clock, ClipboardList, FlaskConical, Stethoscope } from "lucide-react";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { EmailCapture } from "@/components/book/EmailCapture";
import type { Location } from "@/data/locations";
import { COLORS, FONTS, CAL_BUTTON_BASE } from "@/lib/bookingTokens";

// ─── Exact computed px values from mwclocked.pplx.app/#/confirmed ────────────
// All sizes are browser-rendered, not design-spec approximations.

// hardcoded-color-allow-next-line
const INK          = "#0A0F29";   // rgb(10,15,41)
// hardcoded-color-allow-next-line
const INK_MUTED    = "#485666";   // rgb(72,86,106) — eyebrows + "2 minute video"
// hardcoded-color-allow-next-line
const ORANGE_DRIVE = "#C34A09";   // rgb(195,74,9)  — drive time
// hardcoded-color-allow-next-line
const DARK_CARD    = "#1A203D";   // rgb(26,32,61)  — reschedule card
// hardcoded-color-allow-next-line
const MUTED_BLUE   = "#CBD5E1";   // rgb(203,213,225) — reschedule copy

const WHITE_CARD: React.CSSProperties = {
  background: "#FFFFFF",
  // hardcoded-color-allow-next-line
  border: "1px solid rgba(10,15,41,0.08)",
  borderRadius: 16, overflow: "hidden",
  // hardcoded-color-allow-next-line
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};
const WHITE_CARD_PAD: React.CSSProperties = { ...WHITE_CARD, padding: "20px" };
// hardcoded-color-allow-next-line
const DIVIDER = "1px solid rgba(10,15,41,0.08)";

// Eyebrow: 14.875px weight 700 uppercase rgb(72,86,106)
const EYEBROW: React.CSSProperties = {
  fontFamily: FONTS.ui, fontSize: 14.875, fontWeight: 700,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: INK_MUTED, margin: 0,
};

// Body text: 19.125px weight 400 rgb(10,15,41)
const BODY: React.CSSProperties = {
  fontSize: 19.125, fontWeight: 400, color: INK, lineHeight: 1.55, margin: 0,
};

// ─── Static data ──────────────────────────────────────────────────────────────

const OUTCOME_ITEMS = [
  { icon: <FlaskConical size={22} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "Your bloodwork results, explained in plain English." },
  { icon: <Stethoscope size={22} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "A clear answer on whether treatment fits your situation." },
  { icon: <ClipboardList size={22} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "A personalized protocol you can start the same day, when medically appropriate." },
] as const;

const PREP_STEPS = [
  { n: "1", text: "Bring your photo ID." },
  { n: "2", text: "Drink water. No need to fast." },
  { n: "3", text: "Plan for 60 minutes." },
] as const;

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

// ─── Sub-components ───────────────────────────────────────────────────────────

function OutcomeCard() {
  return (
    <div style={WHITE_CARD}>
      <div style={{ padding: "16px 20px 12px", borderBottom: DIVIDER }}>
        <p style={EYEBROW}>What You'll Leave With</p>
      </div>
      {OUTCOME_ITEMS.map(({ icon, text }, idx, arr) => (
        <div key={text} style={{
          display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
          borderBottom: idx < arr.length - 1 ? DIVIDER : "none",
        }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.orangeHex, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {icon}
          </div>
          <span style={{ ...BODY }}>{text}</span>
        </div>
      ))}
    </div>
  );
}

function VideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div style={WHITE_CARD}>
      <div style={{ padding: "18px 20px 14px" }}>
        {/* 19.125px weight 700 uppercase */}
        <p style={{ fontFamily: FONTS.body, fontSize: 19.125, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
          What happens when you walk in
        </p>
        {/* 17px weight 600 rgb(72,86,106) */}
        <p style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 600, color: INK_MUTED, margin: 0 }}>
          2 minute video
        </p>
      </div>
      <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000", borderTop: DIVIDER }}>
        <video
          ref={videoRef}
          src={EXPECT_VIDEO_SRC}
          poster="/images/video-poster.webp"
          muted loop={false} playsInline controls preload="none"
          aria-label="What to expect at your visit — 2 minute overview"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", border: 0 }}
        />
      </div>
    </div>
  );
}

function PrepCard() {
  return (
    <div style={WHITE_CARD_PAD}>
      <p style={{ ...EYEBROW, marginBottom: 18 }}>Before You Arrive</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {PREP_STEPS.map(({ n, text }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: COLORS.orangeHex, color: "#FFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, flexShrink: 0,
            }}>
              {n}
            </div>
            <p style={{ ...BODY }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationCard({ center, mapsSearchUrl, mapsEmbedUrl }: { center: Location; mapsSearchUrl: string; mapsEmbedUrl: string }) {
  return (
    <div style={WHITE_CARD}>
      <div style={{ padding: "20px 20px 16px" }}>
        <p style={{ ...EYEBROW, marginBottom: 10 }}>Location</p>
        {/* City: 25.5px weight 700 uppercase */}
        <h2 style={{ fontFamily: FONTS.ui, fontWeight: 700, fontSize: 25.5, color: INK, textTransform: "uppercase", marginBottom: 16, letterSpacing: "0.04em" }}>
          {center.city}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={16} strokeWidth={2} style={{ color: ORANGE_DRIVE, flexShrink: 0 }} />
            {/* Drive time: 17px weight 600 rgb(195,74,9) */}
            <span style={{ fontSize: 17, fontWeight: 600, color: ORANGE_DRIVE }}>{center.driveTime}</span>
          </div>
          {/* Address: 19.125px weight 600 */}
          <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 19.125, fontWeight: 600, color: INK, textDecoration: "underline", textUnderlineOffset: 3, lineHeight: 1.5 }}>
            {center.address}<br />{center.cityStateZip}
          </a>
          <div>
            {/* "Hours": 17px weight 600 */}
            <p style={{ fontSize: 17, fontWeight: 600, color: INK, margin: "0 0 4px" }}>Hours</p>
            {/* Hours lines: 17px weight 400 */}
            <p style={{ fontSize: 17, fontWeight: 400, color: INK, margin: 0, lineHeight: 1.6 }}>
              Mon &amp; Fri: 8am to 6pm<br />
              Tue, Wed, Thu: 9am to 5pm<br />
              Sat: 8am to 3pm
            </p>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", height: 200, borderTop: DIVIDER }}>
        <iframe
          title={`Map showing directions to ${center.name}`}
          aria-label={`Map to ${center.name} at ${center.address}`}
          src={mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0, width: "100%", height: "100%", display: "block" }}
          allowFullScreen
        />
      </div>

      {/* "Get Directions": 17px weight 700 uppercase dark ink */}
      <a
        href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
        aria-label={`Get directions to ${center.name} (opens in new tab)`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "16px 20px", minHeight: 56, borderTop: DIVIDER,
          color: INK, fontFamily: FONTS.ui, fontWeight: 700, fontSize: 17,
          letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
        }}
      >
        Get Directions <ChevronRight size={18} strokeWidth={2.5} aria-hidden />
      </a>
    </div>
  );
}

function EmailCard({ contactId, onComplete }: { contactId: string | undefined; onComplete: () => void }) {
  return (
    <div style={WHITE_CARD_PAD}>
      <p style={{ ...EYEBROW, marginBottom: 10 }}>Email Reminder</p>
      {/* "Send my confirmation": 25.5px weight 700 uppercase */}
      <p style={{ fontFamily: FONTS.ui, fontSize: 25.5, fontWeight: 700, color: INK, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.02em" }}>
        Send my confirmation
      </p>
      {/* Body: 19.125px weight 400 */}
      <p style={{ ...BODY, marginBottom: 16 }}>
        We'll email your appointment details and a reminder the day before.
      </p>
      <BookingErrorBoundary>
        <EmailCapture contactId={contactId} onComplete={onComplete} />
      </BookingErrorBoundary>
    </div>
  );
}

function RescheduleCard({ center }: { center: Location }) {
  return (
    <div style={{ background: DARK_CARD, borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
      {/* Heading: 19.125px weight 700 uppercase white */}
      <p style={{ fontFamily: FONTS.ui, fontSize: 19.125, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 10 }}>
        Need to change your appointment?
      </p>
      {/* Copy: 19.125px weight 400 rgb(203,213,225) */}
      <p style={{ fontFamily: FONTS.body, fontSize: 19.125, color: MUTED_BLUE, marginBottom: 24, fontWeight: 400 }}>
        We're happy to help. 24-hour notice is appreciated.
      </p>
      {/* Call btn: 19.125px weight 700 uppercase orange */}
      <a
        href={center.phoneHref}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: COLORS.orangeHex, color: "#FFFFFF",
          fontFamily: FONTS.ui, fontWeight: 700, fontSize: 19.125,
          letterSpacing: "0.06em", textTransform: "uppercase",
          padding: "16px 20px", borderRadius: 12, textDecoration: "none",
          minHeight: 56, width: "100%", marginBottom: 18, boxSizing: "border-box",
          // hardcoded-color-allow-next-line
          boxShadow: "0 8px 20px -6px rgba(232,103,10,0.45)",
        }}
      >
        Call {center.phone}
      </a>
      {/* "Or pick a different time": 17px weight 700 uppercase white underlined */}
      <a
        href="/book/schedule"
        style={{
          display: "block", textAlign: "center",
          color: "#FFFFFF", fontSize: 17, fontWeight: 700,
          fontFamily: FONTS.ui, letterSpacing: "0.06em", textTransform: "uppercase",
          textDecoration: "underline", textUnderlineOffset: 3,
        }}
      >
        Or pick a different time
      </a>
    </div>
  );
}

// ─── Props + Component ────────────────────────────────────────────────────────

// hardcoded-color-allow-next-line
const APPLE_BTN = "#1A203D";

interface CalLinks { google: string; ics: string; }

function CalendarButtons({ calLinks }: { calLinks: CalLinks }) {
  return (
    <div className="mwc-cal-buttons" style={{ marginBottom: 0 }}>
      <a
        href={calLinks.google} target="_blank" rel="noopener noreferrer"
        aria-label="Add to Google Calendar (opens in new tab)"
        style={{ ...CAL_BUTTON_BASE, flex: 1, background: COLORS.orange, boxShadow: COLORS.orangeShadow, color: "#FFFFFF", fontSize: 17 }}
      >
        <Calendar size={18} strokeWidth={2} aria-hidden /> Add to Google Calendar
      </a>
      <a
        href={calLinks.ics} download="mwc-appointment.ics"
        style={{ ...CAL_BUTTON_BASE, flex: 1, background: APPLE_BTN, color: "#FFFFFF", fontSize: 17 }}
      >
        <Calendar size={18} strokeWidth={2} aria-hidden /> Apple or Outlook
      </a>
    </div>
  );
}

interface Props {
  center: Location;
  mapsSearchUrl: string;
  mapsEmbedUrl: string;
  emailCaptured: boolean;
  onEmailCaptured: () => void;
  contactId: string | undefined;
  calLinks: CalLinks | null;
}

export function BookConfirmedContent({ center, mapsSearchUrl, mapsEmbedUrl, emailCaptured, onEmailCaptured, contactId, calLinks }: Props) {
  return (
    <div style={{ background: COLORS.pageBg, padding: "0 20px 48px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, paddingTop: 20, fontFamily: FONTS.body }}>
        {calLinks && <CalendarButtons calLinks={calLinks} />}
        <OutcomeCard />
        <VideoCard />
        <PrepCard />
        <LocationCard center={center} mapsSearchUrl={mapsSearchUrl} mapsEmbedUrl={mapsEmbedUrl} />
        {!emailCaptured && <EmailCard contactId={contactId} onComplete={onEmailCaptured} />}
        <RescheduleCard center={center} />
      </div>
    </div>
  );
}

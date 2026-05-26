import { useRef } from "react";
import { MapPin, ChevronRight, Clock, ClipboardList, FlaskConical, Stethoscope } from "lucide-react";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { EmailCapture } from "@/components/book/EmailCapture";
import type { Location } from "@/data/locations";
import { COLORS, FONTS } from "@/lib/bookingTokens";

// ─── Exact computed tokens from mwclocked.pplx.app/#/confirmed ───────────────

// hardcoded-color-allow-next-line
const INK          = "#0A0F29";   // rgb(10,15,41)   — body text on white cards
// hardcoded-color-allow-next-line
const INK_MUTED    = "#485666";   // rgb(72,86,106)  — section labels, "2 minute video"
// hardcoded-color-allow-next-line
const ORANGE_DRIVE = "#C34A09";   // rgb(195,74,9)   — "5 minutes from I-64"
// hardcoded-color-allow-next-line
const DARK_CARD_BG = "#1A203D";   // rgb(26,32,61)   — reschedule card
// hardcoded-color-allow-next-line
const RESCHEDULE_COPY = "#CBD5E1"; // rgb(203,213,225) — reschedule body copy

const WHITE_CARD: React.CSSProperties = {
  background: "#FFFFFF",
  // hardcoded-color-allow-next-line
  border: "1px solid rgba(10,15,41,0.08)",
  borderRadius: 16, overflow: "hidden",
  // hardcoded-color-allow-next-line
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};
const WHITE_CARD_PAD: React.CSSProperties = { ...WHITE_CARD, padding: "20px" };

// Section eyebrow — gray rgb(72,86,106), uppercase, weight 700, 11px
const EYEBROW: React.CSSProperties = {
  fontFamily: FONTS.ui, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: INK_MUTED, margin: 0,
};

// ─── Static data ──────────────────────────────────────────────────────────────

// Outcome icon circles: solid orange with white icons
const OUTCOME_ITEMS = [
  { icon: <FlaskConical size={20} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "Your bloodwork results, explained in plain English." },
  { icon: <Stethoscope size={20} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "A clear answer on whether treatment fits your situation." },
  { icon: <ClipboardList size={20} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "A personalized protocol you can start the same day, when medically appropriate." },
] as const;

// Exact text from mockup: "Bring your photo ID." (has "your")
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
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(10,15,41,0.08)" }}>
        <p style={EYEBROW}>What You'll Leave With</p>
      </div>
      {OUTCOME_ITEMS.map(({ icon, text }, idx, arr) => (
        <div key={text} style={{
          display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
          borderBottom: idx < arr.length - 1 ? "1px solid rgba(10,15,41,0.08)" : "none",
        }}>
          {/* Solid orange circle — rgb(229,91,11) */}
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.orangeHex, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {icon}
          </div>
          <span style={{ fontSize: 15, fontWeight: 400, color: INK, lineHeight: 1.5 }}>{text}</span>
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
        {/* "What happens when you walk in" — uppercase weight 700 19.125px */}
        <p style={{ fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
          What happens when you walk in
        </p>
        {/* "2 minute video" — gray, weight 600 */}
        <p style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: INK_MUTED, margin: 0 }}>
          2 minute video
        </p>
      </div>
      <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000", borderTop: "1px solid rgba(10,15,41,0.08)" }}>
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
      <p style={{ ...EYEBROW, marginBottom: 16 }}>Before You Arrive</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PREP_STEPS.map(({ n, text }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Orange circle number */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: COLORS.orangeHex, color: "#FFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, flexShrink: 0,
            }}>
              {n}
            </div>
            <p style={{ fontSize: 15, fontWeight: 400, color: INK, lineHeight: 1.4, margin: 0 }}>{text}</p>
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
        <p style={{ ...EYEBROW, marginBottom: 8 }}>Location</p>
        {/* "Glen Allen" — 25.5px weight 700 uppercase */}
        <h2 style={{ fontFamily: FONTS.ui, fontWeight: 700, fontSize: 20, color: INK, textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.04em" }}>
          {center.city}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={14} strokeWidth={2} style={{ color: ORANGE_DRIVE, flexShrink: 0 }} />
            {/* drive time — rgb(195,74,9) orange, weight 600 */}
            <span style={{ fontSize: 14, fontWeight: 600, color: ORANGE_DRIVE }}>{center.driveTime}</span>
          </div>
          <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 600, color: INK, textDecoration: "underline", textUnderlineOffset: 3, lineHeight: 1.5 }}>
            {center.address}<br />{center.cityStateZip}
          </a>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: "0 0 4px" }}>Hours</p>
            <p style={{ fontSize: 13, fontWeight: 400, color: INK, margin: 0, lineHeight: 1.6 }}>
              Mon &amp; Fri: 8am to 6pm<br />
              Tue, Wed, Thu: 9am to 5pm<br />
              Sat: 8am to 3pm
            </p>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", height: 200, borderTop: "1px solid rgba(10,15,41,0.08)" }}>
        <iframe
          title={`Map showing directions to ${center.name}`}
          aria-label={`Map to ${center.name} at ${center.address}`}
          src={mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0, width: "100%", height: "100%", display: "block" }}
          allowFullScreen
        />
      </div>

      {/* "Get Directions" — dark ink, uppercase, white bg — NOT orange tint */}
      <a
        href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
        aria-label={`Get directions to ${center.name} (opens in new tab)`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "16px 20px", minHeight: 52,
          borderTop: "1px solid rgba(10,15,41,0.08)",
          color: INK, fontFamily: FONTS.ui, fontWeight: 700, fontSize: 13,
          letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none",
        }}
      >
        Get Directions <ChevronRight size={16} strokeWidth={2.5} aria-hidden />
      </a>
    </div>
  );
}

function EmailCard({ contactId, onComplete }: { contactId: string | undefined; onComplete: () => void }) {
  return (
    <div style={WHITE_CARD_PAD}>
      <p style={{ ...EYEBROW, marginBottom: 8 }}>Email Reminder</p>
      {/* "Send my confirmation" — 25.5px weight 700 uppercase */}
      <p style={{ fontFamily: FONTS.ui, fontSize: 18, fontWeight: 700, color: INK, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.02em" }}>
        Send my confirmation
      </p>
      <p style={{ fontFamily: FONTS.body, fontSize: 15, color: INK, marginBottom: 14, fontWeight: 400 }}>
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
    /* Reschedule — rgb(26,32,61) dark navy */
    <div style={{ background: DARK_CARD_BG, borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
      {/* "Need to change your appointment?" — white uppercase weight 700 */}
      <p style={{ fontFamily: FONTS.ui, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 8 }}>
        Need to change your appointment?
      </p>
      {/* Copy — rgb(203,213,225) muted blue-gray */}
      <p style={{ fontFamily: FONTS.body, fontSize: 15, color: RESCHEDULE_COPY, marginBottom: 20, fontWeight: 400 }}>
        We're happy to help. 24-hour notice is appreciated.
      </p>
      {/* "CALL 866-344-4955" — orange full-width */}
      <a
        href={center.phoneHref}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          background: COLORS.orangeHex, color: "#FFFFFF",
          fontFamily: FONTS.ui, fontWeight: 700, fontSize: 15,
          letterSpacing: "0.06em", textTransform: "uppercase",
          padding: "15px 20px", borderRadius: 10, textDecoration: "none",
          minHeight: 52, width: "100%", marginBottom: 16, boxSizing: "border-box",
          // hardcoded-color-allow-next-line
          boxShadow: "0 8px 20px -6px rgba(232,103,10,0.45)",
        }}
      >
        Call {center.phone}
      </a>
      {/* "Or pick a different time" — white, uppercase, underlined */}
      <a
        href="/book/schedule"
        style={{
          display: "block", textAlign: "center",
          color: "#FFFFFF", fontSize: 13, fontWeight: 700,
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

interface Props {
  center: Location;
  mapsSearchUrl: string;
  mapsEmbedUrl: string;
  emailCaptured: boolean;
  onEmailCaptured: () => void;
  contactId: string | undefined;
}

export function BookConfirmedContent({ center, mapsSearchUrl, mapsEmbedUrl, emailCaptured, onEmailCaptured, contactId }: Props) {
  return (
    <div style={{ background: COLORS.pageBg, padding: "0 20px 48px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, paddingTop: 20, fontFamily: FONTS.body }}>
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

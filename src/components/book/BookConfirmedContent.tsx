import { useRef } from "react";
import { MapPin, ChevronRight, Clock, ClipboardList, FlaskConical, Stethoscope } from "lucide-react";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { EmailCapture } from "@/components/book/EmailCapture";
import type { Location } from "@/data/locations";
import { COLORS, FONTS } from "@/lib/bookingTokens";

// ─── White card tokens ────────────────────────────────────────────────────────

// hardcoded-color-allow-next-line
const WHITE_CARD: React.CSSProperties = {
  background: "#FFFFFF",
  // hardcoded-color-allow-next-line
  border: "1px solid rgba(11,16,41,0.10)",
  borderRadius: 16,
  overflow: "hidden",
  // hardcoded-color-allow-next-line
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
};

const WHITE_CARD_PAD: React.CSSProperties = {
  ...WHITE_CARD,
  padding: "20px 20px",
};

// hardcoded-color-allow-next-line
const INK        = "#0B1029";
// hardcoded-color-allow-next-line
const INK_MUTED  = "#4B5567";
// hardcoded-color-allow-next-line
const INK_DIVIDER = "1px solid rgba(11,16,41,0.08)";

// Teal eyebrow — same as hero
const TEAL_EYEBROW: React.CSSProperties = {
  fontFamily: FONTS.ui, fontSize: 11, fontWeight: 800,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: COLORS.teal, marginBottom: 12,
};

// ─── Static data ──────────────────────────────────────────────────────────────

const OUTCOME_ITEMS = [
  { icon: <FlaskConical size={20} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "Your bloodwork results, explained in plain English" },
  { icon: <Stethoscope size={20} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "A clear answer on whether treatment fits your situation" },
  { icon: <ClipboardList size={20} strokeWidth={1.75} style={{ color: "#FFFFFF" }} aria-hidden />, text: "A personalized protocol you can start the same day, when medically appropriate" },
] as const;

const PREP_STEPS = [
  { n: "1", text: "Bring photo ID." },
  { n: "2", text: "Drink water. No need to fast." },
  { n: "3", text: "Plan for 60 minutes." },
] as const;

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

// ─── Sub-components ───────────────────────────────────────────────────────────

function OutcomeCard() {
  return (
    <div style={WHITE_CARD}>
      <div style={{ padding: "16px 20px 12px", borderBottom: INK_DIVIDER }}>
        <p style={{ ...TEAL_EYEBROW, marginBottom: 0 }}>What you'll leave with</p>
      </div>
      {OUTCOME_ITEMS.map(({ icon, text }, idx, arr) => (
        <div
          key={text}
          style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
            borderBottom: idx < arr.length - 1 ? INK_DIVIDER : "none",
          }}
        >
          {/* Solid orange circle icon */}
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: COLORS.orangeHex,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {icon}
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: INK, lineHeight: 1.5 }}>{text}</span>
        </div>
      ))}
    </div>
  );
}

function VideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div style={WHITE_CARD}>
      <div style={{ padding: "18px 20px 16px" }}>
        <p style={{ fontFamily: FONTS.ui, fontSize: 16, fontWeight: 800, color: INK, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.02em" }}>
          What happens when you walk in
        </p>
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: INK_MUTED, marginBottom: 0 }}>
          2 minute video
        </p>
      </div>
      <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000", borderTop: INK_DIVIDER }}>
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
      <p style={TEAL_EYEBROW}>Before you arrive</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PREP_STEPS.map(({ n, text }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: COLORS.orangeHex, color: "#FFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, flexShrink: 0,
            }}>
              {n}
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: INK, lineHeight: 1.4, margin: 0 }}>{text}</p>
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
        <p style={{ ...TEAL_EYEBROW, marginBottom: 6 }}>Location</p>
        <h2 style={{ fontFamily: FONTS.ui, fontWeight: 800, fontSize: 22, color: INK, textTransform: "uppercase", marginBottom: 16, letterSpacing: "0.02em" }}>
          {center.city}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={15} strokeWidth={2} style={{ color: COLORS.orangeHex, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.orangeHex }}>{center.driveTime}</span>
          </div>
          <div>
            <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 600, color: INK, textDecoration: "underline", textUnderlineOffset: 3, lineHeight: 1.6 }}>
              {center.address}<br />{center.cityStateZip}
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Clock size={15} strokeWidth={2} style={{ color: INK_MUTED, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: "0 0 2px" }}>Hours</p>
              <p style={{ fontSize: 13, color: INK_MUTED, margin: 0, lineHeight: 1.6 }}>
                Mon &amp; Fri: 8am to 6pm<br />
                Tue, Wed, Thu: 9am to 5pm<br />
                Sat: 8am to 3pm
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", height: 200, borderTop: INK_DIVIDER }}>
        <iframe
          title={`Map showing directions to ${center.name}`}
          aria-label={`Map to ${center.name} at ${center.address}`}
          src={mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0, width: "100%", height: "100%", display: "block" }}
          allowFullScreen
        />
      </div>

      <a
        href={mapsSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get directions to ${center.name} (opens in new tab)`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "16px 20px", minHeight: 52,
          borderTop: INK_DIVIDER,
          color: INK, fontFamily: FONTS.ui, fontWeight: 700, fontSize: 14,
          letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none",
        }}
      >
        <MapPin size={15} strokeWidth={2} style={{ color: COLORS.orangeHex }} aria-hidden />
        Get Directions
        <ChevronRight size={16} strokeWidth={2.5} style={{ marginLeft: 2 }} aria-hidden />
      </a>
    </div>
  );
}

function EmailCard({ contactId, onComplete }: { contactId: string | undefined; onComplete: () => void }) {
  return (
    <div style={WHITE_CARD_PAD}>
      <p style={{ ...TEAL_EYEBROW, marginBottom: 6 }}>Email reminder</p>
      <p style={{ fontFamily: FONTS.ui, fontSize: 18, fontWeight: 800, color: INK, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.02em" }}>
        Send my confirmation
      </p>
      <p style={{ fontFamily: FONTS.body, fontSize: 14, color: INK_MUTED, marginBottom: 14 }}>
        We'll email your appointment details and a reminder the day before.
      </p>
      <BookingErrorBoundary>
        <EmailCapture contactId={contactId} onComplete={onComplete} />
      </BookingErrorBoundary>
    </div>
  );
}

function RescheduleCard({ center }: { center: Location }) {
  // hardcoded-color-allow-next-line
  const DARK_CARD: React.CSSProperties = { background: "#111827", borderRadius: 16, padding: "24px 20px", textAlign: "center" };
  return (
    <div style={DARK_CARD}>
      <p style={{ fontFamily: FONTS.ui, fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 8 }}>
        Need to change your appointment?
      </p>
      <p style={{ fontFamily: FONTS.body, fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 20 }}>
        We're happy to help. 24-hour notice is appreciated.
      </p>
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
        📞 Call {center.phone}
      </a>
      <a
        href="/book/schedule"
        style={{
          display: "block", textAlign: "center",
          color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700,
          fontFamily: FONTS.ui, letterSpacing: "0.08em", textTransform: "uppercase",
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

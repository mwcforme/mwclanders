import { useRef } from "react";
import { Phone, MapPin, Navigation, ExternalLink, Clock, ClipboardList, FlaskConical, Stethoscope } from "lucide-react";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { EmailCapture } from "@/components/book/EmailCapture";
import type { Location } from "@/data/locations";
import { FONT_OSWALD } from "@/lib/styles";
import { COLORS, FONTS, GLASS_CARD, GLASS_CARD_PAD } from "@/lib/bookingTokens";

// ─── Static data ──────────────────────────────────────────────────────────────

const OUTCOME_ITEMS = [
  { icon: <FlaskConical size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "Your bloodwork results, explained in plain English" },
  { icon: <Stethoscope size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "A clear answer on whether treatment fits your situation" },
  { icon: <ClipboardList size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "A personalized protocol you can start the same day, when medically appropriate" },
] as const;

const PREP_STEPS = [
  { n: "1", text: "Bring photo ID." },
  { n: "2", text: "Drink water. No need to fast." },
  { n: "3", text: "Plan for 60 minutes." },
] as const;

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

// Section eyebrow — orange to match mockup
const EYEBROW: React.CSSProperties = {
  fontFamily: FONTS.ui, fontSize: 11, fontWeight: 800,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: COLORS.orangeHex, marginBottom: 14, margin: 0,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function OutcomeCard() {
  return (
    <div style={GLASS_CARD}>
      <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${COLORS.glassDivider}` }}>
        <p style={EYEBROW}>What you'll leave with</p>
      </div>
      {OUTCOME_ITEMS.map(({ icon, text }, idx, arr) => (
        <div
          key={text}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
            borderBottom: idx < arr.length - 1 ? `1px solid ${COLORS.glassDivider}` : "none",
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.orangeIconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {icon}
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: COLORS.textPrimary, lineHeight: 1.5 }}>{text}</span>
        </div>
      ))}
    </div>
  );
}

function VideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div style={GLASS_CARD}>
      <div style={{ position: "relative", width: "100%", paddingBottom: "56%", background: "#000" }}>
        <video
          ref={videoRef}
          src={EXPECT_VIDEO_SRC}
          poster="/images/video-poster.webp"
          muted loop={false} playsInline controls preload="none"
          aria-label="What to expect at your visit — 2 minute overview"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", border: 0 }}
        />
      </div>
      <div style={{ padding: "16px 20px 18px", borderTop: `1px solid ${COLORS.glassDivider}` }}>
        <p style={{ ...EYEBROW, marginBottom: 6 }}>2 minute video</p>
        <h2 style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 18, color: COLORS.textPrimary, marginBottom: 0, textTransform: "uppercase" }}>
          What happens when you walk in
        </h2>
      </div>
    </div>
  );
}

function PrepCard() {
  return (
    <div style={GLASS_CARD_PAD}>
      <p style={{ ...EYEBROW, marginBottom: 14 }}>Before you arrive</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PREP_STEPS.map(({ n, text }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--brand-cta)", color: "#FFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {n}
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: COLORS.textPrimary, lineHeight: 1.4, margin: 0 }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationCard({ center, mapsSearchUrl, mapsEmbedUrl }: { center: Location; mapsSearchUrl: string; mapsEmbedUrl: string }) {
  return (
    <div style={GLASS_CARD}>
      <div style={{ padding: "20px 20px 16px" }}>
        <p style={{ ...EYEBROW, marginBottom: 8 }}>Location</p>
        <h2 style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 22, color: COLORS.textPrimary, textTransform: "uppercase", marginBottom: 14 }}>
          {center.city}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Navigation size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-cta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{center.driveTime}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <MapPin size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
            <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 600, color: COLORS.textPrimary, textDecoration: "underline", textUnderlineOffset: 3, lineHeight: 1.5 }}>
              {center.address}<br />{center.cityStateZip}
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Clock size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.textSecondary, lineHeight: 1.5 }}>{center.hours}</span>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", height: 200, borderTop: `1px solid ${COLORS.glassDivider}` }}>
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
          background: "transparent",
          border: `1px solid ${COLORS.orangeHex}`,
          borderRadius: "0 0 16px 16px",
          color: COLORS.orangeHex,
          fontFamily: FONTS.ui, fontWeight: 700, fontSize: 14,
          letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
        }}
      >
        Get Directions <ExternalLink size={13} strokeWidth={2} style={{ marginLeft: 4 }} aria-hidden />
      </a>
    </div>
  );
}

function EmailCard({ contactId, onComplete }: { contactId: string | undefined; onComplete: () => void }) {
  return (
    <div style={GLASS_CARD_PAD}>
      <p style={{ ...EYEBROW, marginBottom: 8 }}>Email reminder</p>
      <p style={{ fontFamily: FONTS.ui, fontSize: 18, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.02em" }}>
        Send my confirmation
      </p>
      <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary, marginBottom: 14 }}>
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
    <div style={{ ...GLASS_CARD_PAD, textAlign: "center" }}>
      <p style={{ fontFamily: FONTS.ui, fontSize: 13, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: COLORS.textPrimary, marginBottom: 6 }}>
        Need to change your appointment?
      </p>
      <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 }}>
        We're happy to help. 24-hour notice is appreciated.
      </p>
      <a
        href={center.phoneHref}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: "var(--brand-cta)", color: "#FFFFFF",
          fontFamily: FONTS.ui, fontWeight: 700, fontSize: 15,
          letterSpacing: "0.06em", textTransform: "uppercase",
          padding: "14px 20px", borderRadius: 10, textDecoration: "none",
          minHeight: 52, width: "100%", marginBottom: 12,
          // hardcoded-color-allow-next-line
          boxShadow: "0 8px 20px -6px rgba(232,103,10,0.45)",
        }}
      >
        <Phone size={16} strokeWidth={2} aria-hidden /> Call {center.phone}
      </a>
      <a
        href="/book/schedule"
        style={{
          display: "block", textAlign: "center",
          color: COLORS.textSecondary, fontSize: 14, fontWeight: 600,
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

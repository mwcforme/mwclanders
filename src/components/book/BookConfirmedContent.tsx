import { useRef } from "react";
import { MapPin, Navigation, ExternalLink, Clock, ClipboardList, FlaskConical, Stethoscope } from "lucide-react";
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

// Teal eyebrow — matches mockup source exactly: color: rgb(46, 196, 165)
const TEAL_EYEBROW: React.CSSProperties = {
  fontFamily: FONTS.body,
  fontSize: 11, fontWeight: 800,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: COLORS.teal, marginBottom: 14,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function OutcomeCard() {
  return (
    <div style={GLASS_CARD}>
      <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${COLORS.glassDivider}` }}>
        {/* Mockup source: "You leave with" */}
        <p style={{ ...TEAL_EYEBROW, marginBottom: 0 }}>You leave with</p>
      </div>
      {OUTCOME_ITEMS.map(({ icon, text }, idx, arr) => (
        <div
          key={text}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
            borderBottom: idx < arr.length - 1 ? `1px solid ${COLORS.glassDivider}` : "none",
          }}
        >
          {/* Mockup source: width:36 height:36 border-radius:8px background:rgba(232,103,10,0.12) */}
          <div style={{ width: 36, height: 36, borderRadius: 8, background: COLORS.orangeIconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
      {/* Mockup: padding-bottom: 52% */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000" }}>
        <video
          ref={videoRef}
          src={EXPECT_VIDEO_SRC}
          poster="/images/video-poster.webp"
          muted loop={false} playsInline controls preload="none"
          aria-label="What to expect at your visit — 2 minute overview"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", border: 0 }}
        />
      </div>
      {/* Mockup: padding: 16px 20px 18px */}
      <div style={{ padding: "16px 20px 18px", borderTop: `1px solid ${COLORS.glassDivider}` }}>
        {/* Mockup: font-size:18px Oswald color:rgba(255,255,255,0.92) */}
        <h2 style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 18, color: COLORS.textPrimary, marginBottom: 0 }}>
          What happens when you walk in. 2 min.
        </h2>
      </div>
    </div>
  );
}

function PrepCard() {
  return (
    <div style={GLASS_CARD_PAD}>
      {/* Mockup: teal eyebrow "Before you arrive" */}
      <p style={TEAL_EYEBROW}>Before you arrive</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PREP_STEPS.map(({ n, text }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mockup: width:28 height:28 border-radius:50% background:var(--brand-cta) */}
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
        {/* Mockup: font-size:20px Oswald uppercase */}
        <h2 style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 20, color: COLORS.textPrimary, textTransform: "uppercase", marginBottom: 12 }}>
          {center.city}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 4 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 500, color: COLORS.textSecondary }}>{center.hours}</span>
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

      {/* Mockup: background:rgba(232,103,10,0.1) border-top:glass */}
      <a
        href={mapsSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get directions to ${center.name} (opens in new tab)`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "14px 20px", minHeight: 52,
          background: COLORS.orangeIconBg,
          borderTop: `1px solid ${COLORS.glassDivider}`,
          color: "var(--brand-cta)", fontFamily: FONTS.body, fontWeight: 700, fontSize: 15, textDecoration: "none",
        }}
      >
        <MapPin size={15} strokeWidth={2} style={{ color: "var(--brand-cta)" }} aria-hidden />
        Get Directions
        <ExternalLink size={13} strokeWidth={2} style={{ marginLeft: 2 }} aria-hidden />
      </a>
    </div>
  );
}

function EmailCard({ contactId, onComplete }: { contactId: string | undefined; onComplete: () => void }) {
  return (
    <div style={GLASS_CARD_PAD}>
      {/* Mockup: simple p font-size:16px font-weight:700 — no eyebrow, no uppercase */}
      <p style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4 }}>
        Send my confirmation
      </p>
      <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 }}>
        We'll email your appointment details and a reminder.
      </p>
      <BookingErrorBoundary>
        <EmailCapture contactId={contactId} onComplete={onComplete} />
      </BookingErrorBoundary>
    </div>
  );
}

function RescheduleSection({ center }: { center: Location }) {
  return (
    /* Mockup: plain flex column, no card wrapper */
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Mockup: glass ghost button "Pick a Different Time" */}
      <a
        href="/book/schedule"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          // hardcoded-color-allow-next-line
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
          color: COLORS.textPrimary, fontWeight: 600, fontSize: 15,
          padding: "12px 20px", borderRadius: 10, textDecoration: "none", minHeight: 52, width: "100%",
        }}
      >
        Pick a Different Time
      </a>
      {/* Mockup: "Or call us: (phone) · 24-hour notice appreciated" */}
      <p style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 2 }}>
        Or call us:{" "}
        <a href={center.phoneHref} style={{ color: "rgba(255,255,255,0.80)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
          {center.phone}
        </a>
        {" · 24-hour notice appreciated"}
      </p>
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
        <RescheduleSection center={center} />
      </div>
    </div>
  );
}

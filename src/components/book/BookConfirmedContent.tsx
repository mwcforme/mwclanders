/**
 * BookConfirmedContent — post-hero content sections for the confirmation page.
 * Renders: outcome cards, video, prep steps, location tile, email capture, reschedule.
 */
import { useRef } from "react";
import { MapPin, Navigation, ExternalLink, Clock, ClipboardList, FlaskConical, Stethoscope } from "lucide-react";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { EmailCapture } from "@/components/book/EmailCapture";
import type { Location } from "@/data/locations";
import { FONT_INTER, FONT_OSWALD } from "@/lib/styles";

// Dark glass card tokens — matches mwclocked mockup style guide
// hardcoded-color-allow-next-line
const GLASS_BG   = "rgba(255,255,255,0.05)";
// hardcoded-color-allow-next-line
const GLASS_BORDER = "1px solid rgba(255,255,255,0.10)";
// hardcoded-color-allow-next-line
const GLASS_DIVIDER = "1px solid rgba(255,255,255,0.08)";
const CARD_DARK: React.CSSProperties = { background: GLASS_BG, border: GLASS_BORDER, borderRadius: 16, overflow: "hidden" };
const CARD_DARK_PAD: React.CSSProperties = { ...CARD_DARK, padding: "20px 20px" };
// hardcoded-color-allow-next-line
const TEXT_PRIMARY   = "rgba(255,255,255,0.92)";
// hardcoded-color-allow-next-line
const TEXT_SECONDARY = "rgba(255,255,255,0.55)";
// hardcoded-color-allow-next-line
const TEAL = "#2EC4A5";

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

const OUTCOME_ITEMS = [
  { icon: <FlaskConical size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "Your bloodwork results, explained in plain English" },
  { icon: <Stethoscope size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "A clear answer on whether treatment fits your situation" },
  { icon: <ClipboardList size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "A personalized protocol you can start the same day, when medically appropriate" },
];

const PREP_STEPS = [
  { n: "1", text: "Bring photo ID." },
  { n: "2", text: "Drink water. No need to fast." },
  { n: "3", text: "Plan for 60 minutes." },
];

interface BookConfirmedContentProps {
  center: Location;
  mapsSearchUrl: string;
  mapsEmbedUrl: string;
  emailCaptured: boolean;
  onEmailCaptured: () => void;
  contactId: string | undefined;
}

export function BookConfirmedContent({ center, mapsSearchUrl, mapsEmbedUrl, emailCaptured, onEmailCaptured, contactId }: BookConfirmedContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div style={{
      // hardcoded-color-allow-next-line
      background: "#0D1B3E",
      padding: "0 20px 48px",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, paddingTop: 20, fontFamily: "Inter, sans-serif" }}>

        {/* ── Outcome cards ── */}
        <div style={CARD_DARK}>
          <div style={{ padding: "14px 20px 12px", borderBottom: GLASS_DIVIDER }}>
            <p style={{ fontFamily: FONT_INTER, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: TEAL, margin: 0 }}>You leave with</p>
          </div>
          {OUTCOME_ITEMS.map(({ icon, text }, idx, arr) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: idx < arr.length - 1 ? GLASS_DIVIDER : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8,
                // hardcoded-color-allow-next-line
                background: "rgba(232,103,10,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
              <span style={{ fontSize: 15, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* ── Video ── */}
        <div style={CARD_DARK}>
          <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000" }}>
            <video ref={videoRef} src={EXPECT_VIDEO_SRC} poster="/images/video-poster.webp" muted loop={false} playsInline controls preload="none"
              aria-label="What to expect at your visit — 2 minute overview"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", border: 0 }} />
          </div>
          <div style={{ padding: "16px 20px 18px", borderTop: GLASS_DIVIDER }}>
            <h2 style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 18, color: TEXT_PRIMARY, marginBottom: 0 }}>What happens when you walk in. 2 min.</h2>
          </div>
        </div>

        {/* ── Prep steps ── */}
        <div style={CARD_DARK_PAD}>
          <p style={{ fontFamily: FONT_INTER, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: TEAL, marginBottom: 14 }}>Before you arrive</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {PREP_STEPS.map(({ n, text }) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--brand-cta)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{n}</div>
                <p style={{ fontSize: 15, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: 1.4, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Location tile ── */}
        <div style={CARD_DARK}>
          <div style={{ padding: "20px 20px 16px" }}>
            <h2 style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 20, color: TEXT_PRIMARY, textTransform: "uppercase", marginBottom: 12 }}>{center.city}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Navigation size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-cta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{center.driveTime}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <MapPin size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
                <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY, textDecoration: "underline", textUnderlineOffset: 3, lineHeight: 1.5 }}>
                  {center.address}<br />{center.cityStateZip}
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 500, color: TEXT_SECONDARY }}>{center.hours}</span>
              </div>
            </div>
          </div>
          <div style={{ position: "relative", height: 200, borderTop: GLASS_DIVIDER }}>
            <iframe
              title={`Map showing directions to ${center.name}`}
              aria-label={`Map to ${center.name} at ${center.address}`}
              src={mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, width: "100%", height: "100%", display: "block" }} allowFullScreen />
          </div>
          <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
            aria-label={`Get directions to ${center.name} (opens in new tab)`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", minHeight: 52,
              // hardcoded-color-allow-next-line
              background: "rgba(232,103,10,0.10)",
              borderTop: GLASS_DIVIDER,
              color: "var(--brand-cta)", fontFamily: FONT_INTER, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            <MapPin size={15} strokeWidth={2} style={{ color: "var(--brand-cta)" }} aria-hidden />
            Get Directions
            <ExternalLink size={13} strokeWidth={2} style={{ marginLeft: 2 }} aria-hidden />
          </a>
        </div>

        {/* ── Email capture ── */}
        {!emailCaptured && (
          <div style={CARD_DARK_PAD}>
            <p style={{ fontFamily: FONT_INTER, fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 4 }}>
              Send my confirmation
            </p>
            <p style={{ fontFamily: FONT_INTER, fontSize: 14, color: TEXT_SECONDARY, marginBottom: 12 }}>
              We’ll email your appointment details and a reminder.
            </p>
            <BookingErrorBoundary>
              <EmailCapture contactId={contactId} onComplete={onEmailCaptured} />
            </BookingErrorBoundary>
          </div>
        )}

        {/* ── Reschedule ── */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="/book/schedule"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              // hardcoded-color-allow-next-line
              background: "rgba(255,255,255,0.07)",
              // hardcoded-color-allow-next-line
              border: "1px solid rgba(255,255,255,0.12)",
              color: TEXT_PRIMARY, fontWeight: 600, fontSize: 15,
              padding: "12px 20px", borderRadius: 10, textDecoration: "none", minHeight: 52, width: "100%" }}>
            Pick a Different Time
          </a>
          <p style={{ color: TEXT_SECONDARY, fontSize: 14, marginTop: 2 }}>
            Or call us: <a href={center.phoneHref} style={{ color: "rgba(255,255,255,0.80)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>{center.phone}</a>
            {" · 24-hour notice appreciated"}
          </p>
        </div>
      </div>
    </div>
  );
}

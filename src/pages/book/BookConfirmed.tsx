import { useEffect } from "react";
import { MapPin, ExternalLink, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import BookedCelebrationCard from "@/components/book/BookedCelebrationCard";
import { LOCATIONS, getMapsSearchUrl, type Location } from "@/data/locations";

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

/** Map booking store location keys to locations.ts slugs */
const SLUG_MAP: Record<string, string> = {
  "newport-news": "newport-news-va",
  "virginia-beach": "virginia-beach-va",
  "richmond": "richmond-va",
};

const DEFAULT_CENTER = LOCATIONS[1]; // Newport News


const formatAppointment = (raw?: string): string => {
  if (!raw) return "Time to be confirmed";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "Time to be confirmed";
  const datePart = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(d);
  return `${datePart}  ·  ${timePart}`;
};

const BookConfirmed = () => {
  const appointmentTime = useBookingStore((s) => s.appointmentTime);
  const routerLocation = useLocation();
  const navState = (routerLocation.state || {}) as { appointmentTime?: string };
  const effectiveAppt = appointmentTime || navState.appointmentTime;
  const location = useBookingStore((s) => s.location);
  const identity = useBookingStore((s) => s.identity);
  const apptTime = formatAppointment(effectiveAppt);
  const slug = location ? SLUG_MAP[location] : null;
  const center: Location = (slug && LOCATIONS.find((l) => l.slug === slug)) || DEFAULT_CENTER;
  const mapsSearchUrl = getMapsSearchUrl(center);
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(center.mapsQuery)}&output=embed`;
  const PHONE_DISPLAY = center.phone;
  const PHONE_TEL = center.phoneHref;
  const rawFirst = (identity?.firstName ?? "").trim();
  const rawLast = (identity?.lastName ?? "").trim();
  const firstName = rawFirst.split(/\s+/)[0] || "";
  void rawLast;

  // One-time cleanup: clear corrupt persisted identity (no phone AND no email).
  useEffect(() => {
    if (identity && !identity.phone && !identity.email) {
      useBookingStore.setState({ identity: undefined });
    }
  }, [identity]);

  return (
    <BookLayout page="confirmed" variant="confirmation" title="You're booked | Men's Wellness Centers">
      <div
        className="px-4 md:px-8 py-6 md:py-10 pb-12"
        style={{ background: "#000814" }}
      >
        <div className="mx-auto flex flex-col gap-8 md:gap-10" style={{ maxWidth: 1100, fontFamily: "Inter, sans-serif" }}>

          {/* Celebration Hero Card */}
          <BookedCelebrationCard
            firstName={firstName}
            apptTime={apptTime}
            apptIso={effectiveAppt}
            locationCity={center.city}
            locationAddress={`${center.address}, ${center.cityStateZip}`}
          />

          {/* Video — full-width, directly below celebration card for max emotional impact */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #E5E7EB",
              boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
            }}
          >
            {/* Autoplay muted — draws the eye, no audio surprise */}
            <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000" }}>
              <video
                src={EXPECT_VIDEO_SRC}
                autoPlay
                muted
                loop={false}
                playsInline
                controls
                preload="metadata"
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover", border: 0,
                }}
              />
            </div>
            <div style={{ padding: "24px 28px 28px" }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "#E8670A", marginBottom: 8,
              }}>
                2-min watch · Before you arrive
              </p>
              <h2 style={{
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: "clamp(20px, 2.8vw, 26px)", color: "#0B1029",
                letterSpacing: "0.01em", marginBottom: 8, textTransform: "none",
              }}>
                Here's exactly what happens when you walk in.
              </h2>
              <p style={{ fontSize: 15, color: "#5B6478", lineHeight: 1.55, fontWeight: 400 }}>
                No waiting room anxiety. Labs, a quick exam, and a real conversation with your provider. All in under an hour.
              </p>
            </div>
          </div>

          {/* Location Tile — full width */}
          <div
            className="relative flex flex-col overflow-hidden"
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "32px 28px",
              border: "1px solid rgba(11,16,41,0.10)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          >
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(26px, 3vw, 34px)",
                  color: "#0B1029",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  lineHeight: 1.05,
                  marginBottom: 8,
                }}
              >
                {center.city}
              </h2>
              <p
                style={{
                  color: "#5B6478",
                  fontSize: 15,
                  fontWeight: 500,
                  marginBottom: 18,
                }}
              >
                {center.name}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} strokeWidth={2.5} style={{ color: "#E8670A", flexShrink: 0, marginTop: 2 }} />
                  <span
                    style={{
                      color: "#E8670A",
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {center.driveTime}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} strokeWidth={2.5} style={{ color: "#E8670A", flexShrink: 0, marginTop: 3 }} />
                  <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#0B1029",
                      fontWeight: 600,
                      fontSize: 16,
                      lineHeight: 1.4,
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {center.address}<br />
                    {center.cityStateZip}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} strokeWidth={2.5} style={{ color: "#E8670A", flexShrink: 0, marginTop: 3 }} />
                  <span style={{ color: "#0B1029", fontSize: 16, fontWeight: 500 }}>
                    {center.hours}
                  </span>
                </div>
              </div>

              <div
                className="relative mt-6 w-full overflow-hidden"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(11,16,41,0.12)",
                  height: 320,
                }}
              >
                <iframe
                  title={`Map to ${center.name}`}
                  src={mapsEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0, width: "100%", height: "100%", display: "block" }}
                  allowFullScreen
                />
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inline-flex items-center gap-2"
                  style={{
                    top: 12,
                    left: 12,
                    background: "#FFFFFF",
                    color: "#0B1029",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                  }}
                >
                  Open in Maps
                  <ExternalLink size={14} strokeWidth={2.5} />
                </a>
              </div>
          </div>

          {/* Footer */}
          <p
            className="text-center text-sm md:text-base"
            style={{ color: "rgba(255,255,255,0.72)", fontFamily: "Inter, sans-serif" }}
          >
            Need to reschedule or running late? Call or text{" "}
            <a
              href={PHONE_TEL}
              style={{ color: "#FFFFFF", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 4 }}
            >
              {PHONE_DISPLAY}
            </a>
            .
          </p>
        </div>
      </div>

    </BookLayout>
  );
};

export default BookConfirmed;

/**
 * /book/location — Step 2 of the new booking funnel.
 *
 * Three large tap-target cards (Richmond / Virginia Beach / Newport News).
 * Tapping a card sets location in the store and auto-advances to /book/schedule.
 * Updates GHL contact with selected location tag.
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { contactUpdater } from "@/services/contactUpdater";
import type { LocationKey } from "@/lib/ghlCalendars";
import { trackFunnelEvent } from "@/hooks/useAnalytics";

const ORANGE = "var(--brand-cta)";

interface LocationOption {
  key: LocationKey;
  label: string;
  address: string;
}

const OPTIONS: LocationOption[] = [
  {
    key: "richmond",
    label: "Richmond",
    address: "Glen Allen, VA",
  },
  {
    key: "virginia-beach",
    label: "Virginia Beach",
    address: "Virginia Beach, VA",
  },
  {
    key: "newport-news",
    label: "Newport News",
    address: "Newport News, VA",
  },
];

const BookLocation = () => {
  const navigate = useNavigate();
  const setLocation = useBookingStore((s) => s.setLocation);
  const identity = useBookingStore((s) => s.identity);
  const existingLocation = useBookingStore((s) => s.location) as LocationKey | undefined;
  const [selected, setSelected] = useState<LocationKey | null>(existingLocation ?? null);
  const [advancing, setAdvancing] = useState(false);

  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimerRef.current !== null) clearTimeout(advanceTimerRef.current);
  }, []);

  // Cleanup on unmount — prevent navigating after component is gone
  // (e.g. user hits browser back before the 300ms delay fires)
  const handleSelect = async (key: LocationKey) => {
    if (advancing) return;
    setSelected(key);
    setAdvancing(true);
    setLocation(key);

    // Fire-and-forget: update GHL contact with location tag
    if (identity?.ghlContactId) {
      contactUpdater.addTag(identity.ghlContactId, `location-${key}`).catch(() => { /* non-blocking */ });
    }

    // Track conversion event (no PII — only the location key, not contact info)
    trackFunnelEvent("location_selected", { location: key });

    // Brief visual confirmation then advance
    if (advanceTimerRef.current !== null) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(() => { navigate("/book/schedule"); }, 300);
  };

  const firstName = identity?.firstName;

  return (
    <BookLayout page="location" title="Choose Your Location | Men's Wellness Centers">
      <div className="px-4 md:px-8 py-6 md:py-10 flex flex-col items-center" style={{ minHeight: "70vh" }}>
        <div className="w-full" style={{ maxWidth: 480 }}>

          {/* Back + Progress */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 mb-4"
            style={{
              background: "transparent", border: 0, color: "var(--c-text-on-dark)",
              fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600,
              opacity: 0.75, cursor: "pointer", minHeight: 44, padding: "10px 0",
            }}
            aria-label="Back to contact info"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex gap-1 mb-2" role="progressbar" aria-label="Step 1 of 2" aria-valuemin={0} aria-valuemax={2} aria-valuenow={1}>
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex-1"
                style={{ height: 3, borderRadius: 2, background: i === 0 ? ORANGE : "rgba(255,255,255,0.15)" }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>
            Step 1 of 2
          </p>

          {/* Heading */}
          <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "clamp(22px, 4vw, 30px)", color: "var(--c-text-on-dark)", marginBottom: 8, lineHeight: 1.2 }}>
            {firstName ? `${firstName}, which location works for you?` : "Which location works for you?"}
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 32, lineHeight: 1.5 }}>
            Pick the clinic closest to you.
          </p>

          {/* Location Cards */}
          <div className="flex flex-col gap-3">
            {OPTIONS.map((opt) => {
              const isSelected = selected === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelect(opt.key)}
                  disabled={advancing}
                  aria-pressed={isSelected}
                  style={{
                    width: "100%",
                    padding: "20px 20px",
                    borderRadius: 12,
                    // hardcoded-color-allow-next-line
                    border: `2px solid ${isSelected ? ORANGE : "rgba(255,255,255,0.35)"}`,
                    background: isSelected
                      // hardcoded-color-allow-next-line
                      ? "rgba(232,103,10,0.12)"
                      // hardcoded-color-allow-next-line
                      : "rgba(255,255,255,0.04)",
                    color: "var(--c-text-on-dark)",
                    fontFamily: "Inter, sans-serif",
                    textAlign: "left",
                    cursor: advancing ? "not-allowed" : "pointer",
                    transition: "border-color var(--transition-base, 200ms ease), background var(--transition-base, 200ms ease), transform 180ms ease, box-shadow 180ms ease",
                    transform: isSelected ? "scale(1.015)" : "scale(1)",
                    boxShadow: isSelected ? "0 4px 16px rgba(232,103,10,0.25)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !advancing)
                      e.currentTarget.style.borderColor = "rgba(232,103,10,0.50)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                  }}
                >
                  {/* Pin icon — always Lucide MapPin */}
                  <MapPin
                    size={18}
                    strokeWidth={2}
                    aria-hidden
                    style={{ color: isSelected ? ORANGE : "rgba(255,255,255,0.55)", flexShrink: 0 }}
                  />

                  {/* Text */}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 400, marginTop: 2 }}>
                      {opt.address}
                    </div>
                  </div>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: ORANGE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--c-text-on-dark)",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BookLayout>
  );
};

export default BookLocation;

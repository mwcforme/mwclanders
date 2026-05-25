/**
 * /book/location — Step 2 of the new booking funnel.
 *
 * Three large tap-target rows (Richmond / Virginia Beach / Newport News).
 * Tapping a row sets location in the store and auto-advances to /book/schedule.
 * Updates GHL contact with selected location tag.
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { contactUpdater } from "@/services/contactUpdater";
import type { LocationKey } from "@/lib/ghlCalendars";
import { trackFunnelEvent } from "@/hooks/useAnalytics";

interface LocationOption {
  key: LocationKey;
  label: string;
  address: string;
  driveTime: string;
}

const OPTIONS: LocationOption[] = [
  {
    key: "richmond",
    label: "Richmond",
    address: "Glen Allen, VA",
    driveTime: "5 min from I-64",
  },
  {
    key: "virginia-beach",
    label: "Virginia Beach",
    address: "Virginia Beach, VA",
    driveTime: "5 min from I-264",
  },
  {
    key: "newport-news",
    label: "Newport News",
    address: "Newport News, VA",
    driveTime: "3 min from I-64, Exit 258A",
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
      <div style={{ minHeight: "100dvh", background: "var(--brand-navy-deep)", display: "flex", flexDirection: "column" }}>
        {/* Back */}
        <div style={{ padding: "16px 20px 0" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Back to contact info"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 0", minHeight: 44 }}
          >
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        </div>

        {/* Heading */}
        <div style={{ padding: "28px 20px 24px" }}>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 7vw, 40px)", color: "var(--brand-cream)", textTransform: "uppercase", lineHeight: 1.05, letterSpacing: "0.01em" }}>
            {firstName ? `${firstName}, choose` : "Choose"} your location.
          </h1>
        </div>

        {/* Location options */}
        <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
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
                  minHeight: 80,
                  textAlign: "left",
                  cursor: advancing ? "not-allowed" : "pointer",
                  background: isSelected ? "rgba(232,103,10,0.08)" : "rgba(255,255,255,0.04)",
                  border: isSelected ? "1px solid var(--brand-cta)" : "1px solid rgba(255,255,255,0.10)",
                  borderLeft: isSelected ? "4px solid var(--brand-cta)" : "4px solid transparent",
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 150ms ease-out",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--brand-cream)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {opt.label}
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                    {opt.address}
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "var(--brand-cta)", marginTop: 4, fontWeight: 600 }}>
                    {opt.driveTime}
                  </div>
                </div>
                {isSelected && <Check size={18} color="var(--brand-cta)" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    </BookLayout>
  );
};

export default BookLocation;

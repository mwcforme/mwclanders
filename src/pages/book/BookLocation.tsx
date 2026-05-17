/**
 * /book/location — Step 2 of the new booking funnel.
 *
 * Three large tap-target cards (Richmond / Virginia Beach / Newport News).
 * Tapping a card sets location in the store and auto-advances to /book/schedule.
 * Updates GHL contact with selected location tag.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import type { LocationKey } from "@/lib/ghlCalendars";

const ORANGE = "#E8670A";

interface LocationOption {
  key: LocationKey;
  label: string;
  sublabel: string;
  emoji: string;
}

const OPTIONS: LocationOption[] = [
  {
    key: "richmond",
    label: "Richmond",
    sublabel: "Midlothian Turnpike · Short Pump area",
    emoji: "🏙️",
  },
  {
    key: "virginia-beach",
    label: "Virginia Beach",
    sublabel: "Serving VB, Norfolk & Chesapeake",
    emoji: "🌊",
  },
  {
    key: "newport-news",
    label: "Newport News",
    sublabel: "Serving the Peninsula & Williamsburg",
    emoji: "⚓",
  },
];

const BookLocation = () => {
  const navigate = useNavigate();
  const setLocation = useBookingStore((s) => s.setLocation);
  const identity = useBookingStore((s) => s.identity);
  const existingLocation = useBookingStore((s) => s.location) as LocationKey | undefined;
  const [selected, setSelected] = useState<LocationKey | null>(existingLocation ?? null);
  const [advancing, setAdvancing] = useState(false);

  const handleSelect = async (key: LocationKey) => {
    if (advancing) return;
    setSelected(key);
    setAdvancing(true);
    setLocation(key);

    // Fire-and-forget: update GHL contact with location tag
    if (identity?.ghlContactId) {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        supabase.functions.invoke("ghl-proxy", {
          body: {
            path: `/contacts/${identity.ghlContactId}/tags`,
            method: "POST",
            body: { tags: [`location-${key}`] },
            __env: import.meta.env.VITE_APP_ENV ?? "stage",
          },
        }).catch(() => { /* non-blocking */ });
      } catch {
        /* never block UX */
      }
    }

    // Brief visual confirmation then advance
    setTimeout(() => navigate("/book/schedule"), 300);
  };

  const firstName = identity?.firstName;

  return (
    <BookLayout page="location" title="Choose Your Location | Men's Wellness Centers">
      <div className="px-4 md:px-8 py-6 md:py-10 flex flex-col items-center" style={{ minHeight: "70vh" }}>
        <div className="w-full" style={{ maxWidth: 480 }}>

          {/* Back + Progress */}
          <button
            type="button"
            onClick={() => navigate("/book/contact")}
            className="inline-flex items-center gap-1 mb-4"
            style={{
              background: "transparent", border: 0, color: "#FFFFFF",
              fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600,
              opacity: 0.75, cursor: "pointer", minHeight: 44, padding: "10px 0",
            }}
            aria-label="Back to contact info"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex gap-1 mb-2" role="progressbar" aria-label="Step 2 of 3" aria-valuemin={0} aria-valuemax={3} aria-valuenow={2}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1"
                style={{ height: 3, borderRadius: 2, background: i <= 1 ? ORANGE : "rgba(255,255,255,0.15)" }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter, sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>
            Step 2 of 3
          </p>

          {/* Heading */}
          <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "clamp(22px, 4vw, 30px)", color: "#FFFFFF", marginBottom: 8, lineHeight: 1.2 }}>
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
                    border: `2px solid ${isSelected ? ORANGE : "rgba(255,255,255,0.12)"}`,
                    background: isSelected
                      ? "rgba(232,103,10,0.12)"
                      : "rgba(255,255,255,0.04)",
                    color: "#FFFFFF",
                    fontFamily: "Inter, sans-serif",
                    textAlign: "left",
                    cursor: advancing ? "not-allowed" : "pointer",
                    transition: "border-color 0.15s, background 0.15s, transform 0.1s",
                    transform: isSelected ? "scale(0.99)" : "scale(1)",
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
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: isSelected ? "rgba(232,103,10,0.20)" : "rgba(255,255,255,0.07)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 22,
                    }}
                  >
                    {isSelected
                      ? <MapPin size={20} style={{ color: ORANGE }} />
                      : <span>{opt.emoji}</span>
                    }
                  </div>

                  {/* Text */}
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, marginBottom: 3 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", fontWeight: 400 }}>
                      {opt.sublabel}
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
                        color: "#FFFFFF",
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

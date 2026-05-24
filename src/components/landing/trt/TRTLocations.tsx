/**
 * TRTLocations — PPC landing page location selector.
 *
 * CRO-optimised for paid traffic. Rules:
 * - No external links (no Maps, no tel:, no new tabs) — every tap stays in funnel
 * - No map thumbnails — page weight + exit intent
 * - No hours — reduces decision fatigue, gives no reason to wait
 * - No address — gives no reason to leave
 * - One action per card: scroll to final-cta with location pre-selected
 * - Drive time is the only geo proof needed
 * - Selected state is visually prominent — confirms choice before scroll
 */

import { useState } from "react";
import { MapPin, ArrowRight, Check } from "lucide-react";
import { LOCATIONS } from "@/data/locations";
import { trackCro } from "@/hooks/useAnalytics";

const CARDS = [
  {
    slug:      "richmond",
    city:      "Glen Allen",
    region:    "Richmond Area",
    driveTime: "5 min from I-64",
    lat:       LOCATIONS.find(l => l.slug === "richmond-va")?.geo.latitude,
  },
  {
    slug:      "newport-news",
    city:      "Newport News",
    region:    "Peninsula",
    driveTime: "3 min from I-64, Exit 258A",
    lat:       LOCATIONS.find(l => l.slug === "newport-news-va")?.geo.latitude,
  },
  {
    slug:      "virginia-beach",
    city:      "Virginia Beach",
    region:    "Coastal Virginia",
    driveTime: "5 min from I-264",
    lat:       LOCATIONS.find(l => l.slug === "virginia-beach-va")?.geo.latitude,
  },
] as const;

type Slug = typeof CARDS[number]["slug"];

export const TRTLocations = () => {
  const [selected, setSelected] = useState<Slug | null>(null);

  const handleSelect = (slug: Slug) => {
    setSelected(slug);
    trackCro("location_tile_select", { location: slug });

    // Dispatch event so hero form + booking funnel can pre-select location
    window.dispatchEvent(
      new CustomEvent("lp_trt_cta_click", { detail: { location: "locations", clinic: slug } })
    );

    // Small delay so selected state is visible before scroll
    setTimeout(() => {
      const el = document.getElementById("final-cta") ?? document.getElementById("hero-form");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  };

  return (
    <section
      id="locations"
      aria-labelledby="mwc-loc-heading"
      style={{ background: "var(--bg-white)", scrollMarginTop: 64 }}
    >
      <div className="max-w-[1200px] mx-auto px-5 py-14 md:py-20">

        {/* Section header */}
        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--brand-cta-accessible)",
          textAlign: "center",
          marginBottom: 10,
        }}>
          3 Virginia Centers
        </p>
        <h2
          id="mwc-loc-heading"
          className="font-bold uppercase text-center"
          style={{
            fontFamily: "Oswald, sans-serif",
            color: "var(--brand-navy)",
            fontSize: "clamp(26px, 3vw, 38px)",
            letterSpacing: "0.02em",
            marginBottom: 10,
          }}
        >
          Pick Your Location
        </h2>
        <p
          className="text-center"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 16,
            color: "var(--c-text-on-light-muted)",
            marginBottom: 36,
            lineHeight: 1.5,
          }}
        >
          Same-day appointments available. Select the center closest to you.
        </p>

        {/* Location cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {CARDS.map((card) => {
            const isSelected = selected === card.slug;
            return (
              <button
                key={card.slug}
                type="button"
                onClick={() => handleSelect(card.slug)}
                aria-pressed={isSelected}
                aria-label={`Select ${card.city} — ${card.driveTime}`}
                style={{
                  background: isSelected ? "var(--brand-navy)" : "var(--bg-white)",
                  border: isSelected
                    ? "2px solid var(--brand-cta)"
                    // hardcoded-color-allow-next-line
                    : "2px solid rgba(11,16,41,0.12)",
                  borderRadius: 16,
                  padding: "24px 24px 20px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  transition: "border-color 150ms ease, background 150ms ease, box-shadow 150ms ease",
                  // hardcoded-color-allow-next-line
                  boxShadow: isSelected
                    ? "0 0 0 4px rgba(232,103,10,0.15), 0 8px 32px rgba(11,16,41,0.14)"
                    // hardcoded-color-allow-next-line
                    : "0 2px 8px rgba(11,16,41,0.06)",
                  position: "relative",
                  minHeight: 160,
                }}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--brand-cta)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Check size={14} strokeWidth={3} color="#fff" aria-hidden />
                  </div>
                )}

                {/* Region eyebrow */}
                <span style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: isSelected ? "rgba(232,103,10,0.90)" : "var(--c-text-on-light-muted)",
                  marginBottom: 6,
                  display: "block",
                }}>
                  {card.region}
                </span>

                {/* City name */}
                <span style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(22px, 3vw, 28px)",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  color: isSelected ? "var(--brand-cream)" : "var(--brand-navy)",
                  lineHeight: 1.1,
                  display: "block",
                  marginBottom: 12,
                }}>
                  {card.city}
                </span>

                {/* Drive time */}
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: isSelected ? "var(--brand-cta)" : "var(--brand-cta-accessible)",
                  marginBottom: 16,
                }}>
                  <MapPin
                    size={13}
                    strokeWidth={2}
                    aria-hidden
                    style={{ flexShrink: 0, color: "var(--brand-cta)" }}
                  />
                  {card.driveTime}
                </span>

                {/* CTA label */}
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginTop: "auto",
                  paddingTop: 14,
                  borderTop: isSelected
                    // hardcoded-color-allow-next-line
                    ? "1px solid rgba(232,103,10,0.30)"
                    // hardcoded-color-allow-next-line
                    : "1px solid rgba(11,16,41,0.08)",
                }}>
                  <span style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: isSelected ? "var(--brand-cta)" : "var(--brand-navy)",
                    letterSpacing: "0.01em",
                  }}>
                    {isSelected ? "Booking here" : "Book here"}
                  </span>
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: isSelected ? "var(--brand-cta)" : "var(--brand-navy)",
                    flexShrink: 0,
                    transition: "background 150ms ease",
                  }}>
                    <ArrowRight size={14} strokeWidth={2.5} color="#fff" aria-hidden />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Subtle nudge if nothing selected yet */}
        {!selected && (
          <p style={{
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "var(--c-text-on-light-muted)",
            marginTop: 18,
            lineHeight: 1.5,
          }}>
            Not sure? Any center can run your labs the same day.
          </p>
        )}
        {selected && (
          <p style={{
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "var(--brand-cta-accessible)",
            fontWeight: 600,
            marginTop: 18,
            lineHeight: 1.5,
          }}>
            Great choice. Scroll up to confirm your time.
          </p>
        )}
      </div>
    </section>
  );
};

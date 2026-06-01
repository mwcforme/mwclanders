/**
 * TRTLocations — Highest-CRO location selector for PPC landing pages.
 *
 * Principles:
 * - Address as plain text (no link): proves real clinic, zero exit intent
 * - Phone visible always: trust signal; click-to-call on mobile only
 * - Hours as single line: removes "can I book today?" uncertainty
 * - One action per card: Book here → scrolls to final-cta
 * - No Maps links, no thumbnails, no new tabs, no external navigation
 */

import { useState } from "react";
import { MapPin, Phone, Clock, ArrowRight, Check } from "lucide-react";
import { LOCATIONS } from "@/data/locations";
import { trackCro } from "@/hooks/useAnalytics";

const CARDS = [
  {
    slug:      "richmond" as const,
    locSlug:   "richmond-va" as const,
    city:      "Richmond",
    region:    "Richmond Area",
    driveTime: "5 min from I-64",
  },
  {
    slug:      "newport-news" as const,
    locSlug:   "newport-news-va" as const,
    city:      "Newport News",
    region:    "Peninsula",
    driveTime: "3 min from I-64, Exit 258A",
  },
  {
    slug:      "virginia-beach" as const,
    locSlug:   "virginia-beach-va" as const,
    city:      "Virginia Beach",
    region:    "Coastal Virginia",
    driveTime: "5 min from I-264",
  },
];

type Slug = typeof CARDS[number]["slug"];

export const TRTLocations = () => {
  const [selected, setSelected] = useState<Slug | null>(null);

  const handleBook = (slug: Slug) => {
    setSelected(slug);
    trackCro("location_tile_select", { location: slug });
    window.dispatchEvent(
      new CustomEvent("lp_trt_cta_click", { detail: { location: "locations", clinic: slug } })
    );
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

        {/* Header */}
        <p style={{
          fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--brand-cta-accessible)", textAlign: "center", marginBottom: 10,
        }}>
          3 Virginia Centers
        </p>
        <h2
          id="mwc-loc-heading"
          className="font-bold uppercase text-center"
          style={{
            fontFamily: "Oswald, sans-serif", color: "var(--brand-navy)",
            fontSize: "clamp(26px, 3vw, 38px)", letterSpacing: "0.02em", marginBottom: 10,
          }}
        >
          Pick Your Location
        </h2>
        <p className="text-center" style={{
          fontFamily: "Inter, sans-serif", fontSize: 16,
          color: "var(--c-text-on-light-muted)", marginBottom: 36, lineHeight: 1.5,
        }}>
          Same-day appointments available at all three centers.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {CARDS.map((card) => {
            const loc = LOCATIONS.find(l => l.slug === card.locSlug)!;
            const isSelected = selected === card.slug;

            return (
              <article
                key={card.slug}
                aria-labelledby={`loc-city-${card.slug}`}
                style={{
                  background: isSelected ? "var(--brand-navy)" : "var(--bg-white)",
                  border: isSelected
                    ? "2px solid var(--brand-cta)"
                    // hardcoded-color-allow-next-line
                    : "2px solid rgba(11,16,41,0.10)",
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 150ms ease, background 150ms ease, box-shadow 150ms ease",
                  boxShadow: isSelected
                    // hardcoded-color-allow-next-line
                    ? "0 0 0 4px rgba(232,103,10,0.14), 0 8px 32px rgba(11,16,41,0.14)"
                    // hardcoded-color-allow-next-line
                    : "0 2px 8px rgba(11,16,41,0.06)",
                  position: "relative",
                }}
              >
                {/* Selected badge */}
                {isSelected && (
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--brand-cta)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={14} strokeWidth={3} color="#fff" aria-hidden />
                  </div>
                )}

                {/* Card body */}
                <div style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", flex: 1, gap: 0 }}>

                  {/* Region + city */}
                  <p style={{
                    fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: isSelected ? "var(--brand-cta)" : "var(--c-text-on-light-muted)",
                    marginBottom: 5,
                  }}>
                    {card.region}
                  </p>
                  <h3
                    id={`loc-city-${card.slug}`}
                    style={{
                      fontFamily: "Oswald, sans-serif", fontWeight: 700,
                      fontSize: "clamp(22px, 3vw, 28px)", letterSpacing: "0.02em",
                      textTransform: "uppercase",
                      color: isSelected ? "var(--brand-cream)" : "var(--brand-navy)",
                      lineHeight: 1.1, marginBottom: 16,
                    }}
                  >
                    {card.city}
                  </h3>

                  {/* Drive time */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                    color: "var(--brand-cta)", marginBottom: 10,
                  }}>
                    <MapPin size={13} strokeWidth={2} aria-hidden style={{ flexShrink: 0 }} />
                    {card.driveTime}
                  </div>

                  {/* Address — plain text, no link, zero exit intent */}
                  <div style={{
                    fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 400,
                    color: isSelected ? "rgba(245,240,235,0.75)" : "var(--c-text-on-light-muted)",
                    lineHeight: 1.5, marginBottom: 10,
                    userSelect: "text",
                  }}>
                    {loc.address}<br />{loc.cityStateZip}
                  </div>

                  {/* Hours — single line, no accordion */}
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 5,
                    fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 500,
                    color: isSelected ? "rgba(245,240,235,0.65)" : "var(--c-text-on-light-muted)",
                    lineHeight: 1.5, marginBottom: 20,
                  }}>
                    <Clock size={12} strokeWidth={2} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{loc.hours}</span>
                  </div>

                  {/* Phone — visible always, click-to-call mobile only */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600,
                    color: isSelected ? "rgba(245,240,235,0.85)" : "var(--brand-navy)",
                    marginBottom: 20,
                  }}>
                    <Phone size={13} strokeWidth={2} aria-hidden style={{ flexShrink: 0 }} />
                    {/* Mobile: tap-to-call. Desktop: plain text — no exit intent */}
                    <a
                      href={loc.phoneHref}
                      className="md:pointer-events-none"
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                      }}
                      aria-label={`Call ${loc.city} at ${loc.phone}`}
                    >
                      {loc.phone}
                    </a>
                  </div>

                  {/* CTA */}
                  <div style={{ marginTop: "auto" }}>
                    <button
                      type="button"
                      onClick={() => handleBook(card.slug)}
                      aria-label={`Book a no-cost visit at the ${card.city} center`}
                      style={{
                        width: "100%", minHeight: 52,
                        background: isSelected ? "var(--brand-cta)" : "var(--brand-navy)",
                        color: "#fff",
                        border: "none", borderRadius: 10, cursor: "pointer",
                        fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 700,
                        letterSpacing: "0.01em",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "background 150ms ease",
                        // hardcoded-color-allow-next-line
                        boxShadow: isSelected
                          ? "0 4px 16px rgba(232,103,10,0.40)"
                          // hardcoded-color-allow-next-line
                          : "0 4px 12px rgba(11,16,41,0.20)",
                      }}
                    >
                      {isSelected ? "Confirmed. Scroll to book" : "Book in-person visit online"}
                      {isSelected
                        ? <Check size={16} strokeWidth={2.5} aria-hidden />
                        : <ArrowRight size={16} strokeWidth={2.5} aria-hidden />
                      }
                    </button>

                    <p style={{
                      textAlign: "center",
                      fontFamily: "Inter, sans-serif", fontSize: 11,
                      color: isSelected ? "rgba(245,240,235,0.55)" : "var(--c-text-on-light-muted)",
                      marginTop: 10, lineHeight: 1.5,
                    }}>
                      60-minute in-person visit. No cost, no obligation.
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Below-grid nudge */}
        <p style={{
          textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 13,
          color: selected ? "var(--brand-cta-accessible)" : "var(--c-text-on-light-muted)",
          fontWeight: selected ? 600 : 400,
          marginTop: 20, lineHeight: 1.5,
          transition: "color 200ms ease",
        }}>
          {selected
            ? "Good choice. Scroll up and pick your time."
            : "Not sure? Any center can run your labs the same day."}
        </p>
      </div>
    </section>
  );
};

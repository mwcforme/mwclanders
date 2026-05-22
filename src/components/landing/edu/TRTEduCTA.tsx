import { Phone, MapPin } from "lucide-react";
import { trackCro } from "@/hooks/useAnalytics";

const LOCATIONS = [
  { name: "Richmond / Glen Allen", phone: "804-207-5399", href: "/book/location?location=richmond" },
  { name: "Virginia Beach", phone: "757-806-6263", href: "/book/location?location=virginia-beach" },
  { name: "Newport News", phone: "757-806-6263", href: "/book/location?location=newport-news" },
];

export const TRTEduCTA = () => (
  <section
    id="edu-cta"
    style={{
      background: "radial-gradient(ellipse at 50% 0%, rgba(232,103,10,0.22) 0%, rgba(10,10,10,0) 65%), #0A0A0A",
      padding: "96px 24px",
      scrollMarginTop: 64,
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <p style={{ color: "#E8670A", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
        Men's Wellness Centers — Virginia
      </p>
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(40px, 8vw, 72px)",
          color: "#FFFFFF",
          lineHeight: 1.0,
          margin: "0 auto 20px",
        }}
      >
        READY TO FIND OUT<br />
        <span style={{ color: "#E8670A" }}>WHERE YOU ACTUALLY STAND?</span>
      </h2>
      <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 17, lineHeight: 1.65, marginBottom: 48 }}>
        Stop guessing. A comprehensive hormone panel at Men's Wellness Centers gives you real data, reviewed by a real clinician, in one visit. Walk in — no referral needed.
      </p>

      {/* Primary CTA */}
      <a
        href="/book/location"
        onClick={() => trackCro("edu_cta_book")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 60,
          padding: "0 40px",
          background: "#E8670A",
          color: "#fff",
          fontWeight: 700,
          fontSize: 17,
          borderRadius: 8,
          textDecoration: "none",
          letterSpacing: "0.02em",
          marginBottom: 40,
        }}
      >
        Book My Hormone Panel →
      </a>

      {/* Location pills */}
      <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
        Or call your nearest location
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {LOCATIONS.map((loc) => (
          <a
            key={loc.name}
            href={`tel:${loc.phone.replace(/\D/g, "")}`}
            onClick={() => trackCro(`edu_cta_call_${loc.name.toLowerCase().replace(/\s+/g, "_")}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "14px 20px",
              textDecoration: "none",
              color: "#fff",
              minWidth: 220,
            }}
          >
            <MapPin size={16} color="#E8670A" style={{ flexShrink: 0 }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{loc.name}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.60)", display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={13} /> {loc.phone}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Trust note */}
      <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 13, marginTop: 36, lineHeight: 1.6 }}>
        LegitScript Certified · Provider-supervised · No subscription required · In-person Virginia clinics
      </p>
    </div>
  </section>
);


import { useState, useEffect } from "react";
import { Star, ChevronRight } from "lucide-react";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { TRTHeroForm } from "./TRTHeroForm";



// Rotating services for home route only
const ROTATING_SERVICES = ["TESTOSTERONE", "ED THERAPY", "WEIGHT LOSS", "MEN'S HEALTH"];

// Renders all words stacked — only active word visible via opacity.
// Container width locked to longest word. Zero layout shift.
const RotatingService = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ROTATING_SERVICES.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ display: "inline-block", position: "relative", whiteSpace: "nowrap" }}>
      <span aria-hidden="true" style={{ visibility: "hidden", whiteSpace: "nowrap" }}>TESTOSTERONE</span>
      {ROTATING_SERVICES.map((word, i) => (
        <span key={word} aria-hidden={i !== index} style={{
          position: "absolute", left: 0, top: 0, whiteSpace: "nowrap",
          opacity: i === index ? 1 : 0,
          transition: "opacity 300ms ease",
          willChange: "opacity",
        }}>{word}</span>
      ))}
    </span>
  );
};

const COLORS = {
  navyDeep: "var(--brand-navy-deep)",
  cream: "var(--brand-cream)",
  orange: "var(--brand-cta)",
};



interface TRTHeroProps {
  headline?: { line1: string; line2: string; line2Color?: string };
}

export const TRTHero = ({ headline }: TRTHeroProps = {}) => {
  // headline prop = static (TRT/ED/WL dedicated LPs)
  // no prop = home route with rotation
  const isStatic = !!headline;
  const h = headline ?? { line1: "VIRGINIA'S CHOICE", line2: "FOR MEN'S HEALTH", line2Color: COLORS.orange };
  return (
    <section
      id="hero"
      className="relative flex items-start lg:items-center"
      style={{
        background: COLORS.navyDeep,
        minHeight: 720,
      }}
    >
      <a
        href="#hero-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:text-black focus:rounded"
      >
        Skip to lead form
      </a>

      {/* Grain texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "220px 220px",
        }}
      />

      {/* Radial behind H1 - pushes navy slightly brighter under headline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            // hardcoded-color-allow-next-line
            "radial-gradient(ellipse 50% 50% at 28% 45%, rgba(27,43,75,0.55) 0%, rgba(11,16,41,0) 70%)",
        }}
      />

      {/* Subtle orange radial glow top-right */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            // hardcoded-color-allow-next-line
            "radial-gradient(ellipse 60% 50% at 85% 10%, rgba(232,103,10,0.18) 0%, rgba(11,16,41,0) 60%)",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            // hardcoded-color-allow-next-line
            "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 pt-24 pb-12 lg:pt-32 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 lg:gap-16 items-stretch">
        {/* LEFT */}
        <div className="flex flex-col">
          {/*
            H1 height is locked so rotating service never shifts the subtitle.
            Font is clamped small enough that the longest service
            (TESTOSTERONE THERAPY) stays within 4 lines on 375px mobile.
          */}
          <h1
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, 'Bebas Neue', Anton, sans-serif",
              fontSize: "clamp(36px, 9vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: COLORS.cream,
              fontWeight: 700,

            }}
          >
            <span style={{ display: "block", whiteSpace: "nowrap" }}>VIRGINIA&rsquo;S CHOICE</span>
            <span style={{ display: "block", color: COLORS.orange, whiteSpace: "nowrap" }}>
              {isStatic ? h.line2 : <>FOR <RotatingService /></>}
            </span>
          </h1>

          <p
            className="mt-6 w-full"
            style={{
              // hardcoded-color-allow-next-line
              color: "rgba(245,240,235,0.88)",
              fontFamily: "Inter, sans-serif",
              fontSize: 19,
              lineHeight: 1.6,
            }}
          >
You've been told your labs are normal. You don't feel normal. At Men's Wellness Centers, a licensed provider reviews your bloodwork and talks to you. Same visit. Same day. No referrals. No waiting rooms. No script.
          </p>

          {/* Google reviews */}
          <a
            href={GBP_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <span style={{ display: "flex", gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#C9A961" stroke="#C9A961" />
              ))}
            </span>
            {/* hardcoded-color-allow-next-line */}
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(245,240,235,0.80)", fontFamily: "Inter, sans-serif" }}>4.9 · 191 verified Google reviews</span>
          </a>

          {/* What we treat — bridges reviews to symptoms */}
          <div className="mt-8 flex flex-wrap gap-2">
            {["Testosterone (TRT)", "ED Treatment", "Weight Loss"].map(label => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center",
                padding: "6px 14px",
                borderRadius: 999,
                border: "1.5px solid rgba(232,103,10,0.50)",
                background: "rgba(232,103,10,0.10)",
                fontFamily: "Inter, sans-serif",
                fontSize: 13, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: "rgba(245,240,235,0.90)",
              }}>{label}</span>
            ))}
          </div>

          {/* Objection-handling chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "No insurance needed",
              "100% confidential",
              "Same- or next-day availability",
            ].map(label => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center",
                padding: "5px 12px",
                borderRadius: 999,
                border: "1.5px solid rgba(245,240,235,0.25)",
                background: "rgba(245,240,235,0.08)",
                fontFamily: "Inter, sans-serif",
                fontSize: 12, fontWeight: 600,
                letterSpacing: "0.04em",
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.80)",
              }}>{label}</span>
            ))}
          </div>

          {/* Symptom statements */}
          <div className="mt-8 flex flex-col gap-4">
            {[
              "Tired by noon. Coffee stopped working.",
              "Six months of training. Your body doesn't look like it.",
              "Sex drive is down. She\u2019s noticed too.",
              "Labs are fine. You\u2019re not.",
              "Forty-two years old and sleeping like you're eighty.",
            ].map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ChevronRight size={16} strokeWidth={1.75} aria-hidden style={{ color: COLORS.orange, flexShrink: 0 }} />
                {/* hardcoded-color-allow-next-line */}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "rgba(245,240,235,0.88)", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer moved inside form card via TRTHeroForm footer */}
        </div>

        {/* RIGHT - form. No decoration. DO NOT add borders, accents, or wrappers around the form. */}
        <div id="hero-form" className="w-full flex lg:justify-end">
          <div className="w-full">
            <TRTHeroForm formId="hero-trt" />
          </div>
        </div>


      </div>
    </section>
  );
};

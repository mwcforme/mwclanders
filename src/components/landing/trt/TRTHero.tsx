
import { useState, useEffect, useRef } from "react";
import { Star, ChevronRight } from "lucide-react";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { TRTHeroForm } from "./TRTHeroForm";



// Rotating services for home route only
const ROTATING_SERVICES = ["TESTOSTERONE", "ED THERAPY", "WEIGHT LOSS", "MEN'S HEALTH"];

/** Read + sanitize a keyword from URL params. Returns null if absent/unsafe. */
function readKeyword(): string | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const raw = p.get("utm_term") ?? p.get("keyword") ?? p.get("kw") ?? p.get("term");
  if (!raw) return null;
  const decoded = decodeURIComponent(raw)
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-zA-Z0-9 '\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  if (!decoded) return null;
  return decoded.replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  // no prop = home route with rotation (or dynamic keyword)
  const isStatic = !!headline;
  const h = headline ?? { line1: "VIRGINIA'S CHOICE", line2: "FOR MEN'S HEALTH", line2Color: COLORS.orange };

  const [keyword, setKeyword] = useState<string | null>(null);
  useEffect(() => {
    if (!isStatic) setKeyword(readKeyword());
  }, [isStatic]);

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
              fontFamily: "Oswald, 'Arial Narrow', sans-serif",
              fontSize: "clamp(36px, 9vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: COLORS.cream,
              fontWeight: 700,

            }}
          >
            <span style={{ display: "block", whiteSpace: "nowrap" }}>VIRGINIA&rsquo;S CHOICE</span>
            {isStatic ? (
              <span style={{ display: "block", color: COLORS.orange, whiteSpace: "nowrap" }}>{h.line2}</span>
            ) : keyword ? (
              // Dynamic H1: utm_term / keyword / kw / term param
              <span style={{
                display: "block", color: COLORS.orange,
                whiteSpace: "nowrap",
                fontSize: keyword.length > 22 ? "clamp(24px, 5vw, 64px)" : undefined,
              }}>FOR {keyword}</span>
            ) : (
              // Default rotating text
              <span style={{ display: "block", color: COLORS.orange, whiteSpace: "nowrap" }}>
                FOR <RotatingService />
              </span>
            )}
          </h1>

          {/* Photo — immediately under H1 */}
          <div className="mt-6 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", position: "relative", flexShrink: 0 }}>
            <img
              src="/assets/lp/exam-room-blood-draw.webp"
              alt="Licensed provider drawing labs on-site at Men's Wellness Centers Virginia"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }}
              width={720} height={405} loading="eager" decoding="async"
            />
            <div aria-hidden style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
              background: "linear-gradient(to top, rgba(11,16,41,0.70) 0%, transparent 100%)", pointerEvents: "none",
            }} />
          </div>

          {/* Stars — anchored to photo */}
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

          {/* Body copy */}
          <p
            className="mt-5 w-full"
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

          {/* Combined pill row — service + objection chips */}
          <div className="mt-5 flex flex-wrap gap-2">
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
            {["No insurance needed", "100% confidential", "Same- or next-day"].map(label => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center",
                padding: "5px 12px",
                borderRadius: 999,
                border: "1.5px solid rgba(245,240,235,0.22)",
                background: "rgba(245,240,235,0.07)",
                fontFamily: "Inter, sans-serif",
                fontSize: 12, fontWeight: 600,
                letterSpacing: "0.04em",
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.75)",
              }}>{label}</span>
            ))}
          </div>

          {/* Symptom statements — now visible without scrolling */}
          <div className="mt-6 flex flex-col gap-3">
            {[
              "Tired by noon. Coffee stopped working.",
              "Six months of training. Your body doesn't look like it.",
              "Sex drive is down. She\u2019s noticed too.",
              "Labs are fine. You\u2019re not.",
              "Forty-two years old and sleeping like you're eighty.",
            ].map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <ChevronRight size={16} strokeWidth={1.75} aria-hidden style={{ color: COLORS.orange, flexShrink: 0, marginTop: 3 }} />
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

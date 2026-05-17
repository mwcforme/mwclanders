import { useState, useEffect } from "react";
import { Check, Star } from "lucide-react";
import { TRTHeroForm } from "./TRTHeroForm";
import { SymptomChecklist } from "./SymptomChecklist";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { trackCro } from "@/hooks/useAnalytics";
import { COPY } from "@/data/copy";

const trustChecks = [
  "Licensed Virginia providers",
  "Labs drawn and reviewed in the same 60-minute visit",
  "3 Virginia locations, same-day availability",
  "Treatment starts the same day, when clinically appropriate",
];

const COLORS = {
  navyDeep: "var(--brand-navy-deep)",
  // hardcoded-color-allow-next-line
  navy: "#1B2B4B",
  cream: "var(--brand-cream)",
  orange: "var(--brand-cta)",
  // hardcoded-color-allow-next-line
  gold: "#C9A961",
};

const GoogleG = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    {/* hardcoded-color-allow-next-line */}
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.5 0 19.5-7.6 19.5-19.5 0-1.2-.1-2.4-.4-3.5z"/>
    {/* hardcoded-color-allow-next-line */}
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.4 4.5 9.8 8.7 6.3 14.7z"/>
    {/* hardcoded-color-allow-next-line */}
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5.1c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.7 39.2 16.3 43.5 24 43.5z"/>
    {/* hardcoded-color-allow-next-line */}
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.9 5l6 5.1c4.2-3.9 6.6-9.6 6.6-16 0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
);

const ROTATING_SERVICES = [
  "TESTOSTERONE",
  "ED THERAPY",
  "WEIGHT LOSS",
  "MEN'S HEALTH",
];

/** Rotating service word — only the service name animates, 'IN' stays static */
const RotatingService = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_SERVICES.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      style={{
        display: "inline-block",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 280ms ease, transform 280ms ease",
      }}
    >
      {ROTATING_SERVICES[index]}
    </span>
  );
};

interface TRTHeroProps {
  headline?: { line1: string; line2: string; line2Color?: string };
}

export const TRTHero = ({ headline }: TRTHeroProps = {}) => {
  const h = headline ?? {
    line1: "We Treat the Man's Symptoms.",
    line2: "Not Just the Numbers.",
    line2Color: COLORS.orange,
  };
  void h; // legacy prop — rotating headline is now default
  const scrollToForm = () => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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

      {/* Radial behind H1 — pushes navy slightly brighter under headline */}
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

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 pt-24 pb-12 lg:pt-32 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-start">
        {/* LEFT */}
        <div>
          {/*
            H1 height is locked so rotating service never shifts the subtitle.
            Font is clamped small enough that the longest service
            (TESTOSTERONE THERAPY) stays within 4 lines on 375px mobile.
          */}
          <h1
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, 'Bebas Neue', Anton, sans-serif",
              /* 8.5vw fits 'FOR TESTOSTERONE' on one line from 375px upward.
                 clamp floor prevents it going below 36px on tiny screens. */
              fontSize: "clamp(36px, 8.5vw, 88px)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: COLORS.cream,
              fontWeight: 700,
              /* Exactly 2 lines locked — subtitle never shifts */
              minHeight: "calc(clamp(36px, 8.5vw, 88px) * 2 * 1.05)",
            }}
          >
            {/* Line 1 — static, always one line */}
            <span style={{ display: "block", whiteSpace: "nowrap" }}>VIRGINIA&rsquo;S CHOICE</span>
            {/* Line 2 — FOR + service, forced to one line with nowrap */}
            <span style={{ display: "block", color: COLORS.orange, whiteSpace: "nowrap" }}>
              FOR <RotatingService />
            </span>
          </h1>

          <p
            className="mt-6 max-w-[540px]"
            style={{
              // hardcoded-color-allow-next-line
              color: "rgba(245,240,235,0.88)",
              fontFamily: "Inter, sans-serif",
              fontSize: 19,
              lineHeight: 1.6,
            }}
          >
            Sit down with a licensed Virginia provider. Labs drawn on-site and reviewed in the same visit. No-cost consultation. Virginia's men's health practice since 2015.
          </p>

          {/* Star rating row — clickable, links to GBP */}
          <a
            href={GBP_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-cro="hero_reviews_link"
            onClick={() => trackCro("hero_reviews_link")}
            className="mt-5 inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            style={{ color: COLORS.cream, fontFamily: "Inter, sans-serif", textDecoration: "none" }}
          >
            <GoogleG size={20} />
            <span className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-[18px] w-[18px]" fill={COLORS.gold} stroke={COLORS.gold} />
              ))}
            </span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>4.9</span>
            {/* hardcoded-color-allow-next-line */}
            <span style={{ fontSize: 15, color: "rgba(245,240,235,0.80)" }}>
              from 200+ verified Google reviews
            </span>
          </a>

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-[600px]">
            {trustChecks.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2.5"
                style={{ color: COLORS.cream, fontFamily: "Inter, sans-serif" }}
              >
                <Check className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={3} style={{ color: COLORS.orange }} />
                <span style={{ fontSize: 17, fontWeight: 500 }}>{t}</span>
              </li>
            ))}
          </ul>

          {/* Symptom self-id block — visible on both mobile and desktop in left column */}
          <div className="mt-7 max-w-[600px]">
            <SymptomChecklist formId="hero-form" />
          </div>



          {/* Mobile primary CTA — scrolls to hero-form below, keeps above-fold action visible on phones */}
          <button
            onClick={scrollToForm}
            className="lg:hidden mt-6 w-full font-bold cursor-pointer inline-flex items-center justify-center rounded-lg"
            style={{
              height: 56,
              background: "var(--brand-cta)",
              color: "var(--c-text-on-dark)",
              fontSize: 17,
              border: "none",
              letterSpacing: "0.06em",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
          >
            {COPY.cta.bookConsult}
          </button>

          <div
            className="mt-5"
            style={{
              // hardcoded-color-allow-next-line
              color: "rgba(245,240,235,0.65)",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
            }}
          >
            Treatment requires a clinical evaluation and is only provided when medically appropriate. Individual results vary.
          </div>
        </div>

        {/* RIGHT — form. No decoration. DO NOT add borders, accents, or wrappers around the form. */}
        <div id="hero-form" className="w-full flex lg:justify-end">
          <div className="w-full lg:max-w-[440px]">
            <TRTHeroForm />
          </div>
        </div>
      </div>
    </section>
  );
};

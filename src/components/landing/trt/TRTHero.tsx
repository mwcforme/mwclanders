

import { Check, Star } from "lucide-react";
import { TRTHeroForm } from "./TRTHeroForm";
import { SymptomChecklist } from "./SymptomChecklist";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { trackCro } from "@/hooks/useAnalytics";
import { COPY } from "@/data/copy";



const trustChecks = [
  "Licensed Virginia providers",
  "Labs drawn and reviewed in the same 60-minute visit",
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



interface TRTHeroProps {
  headline?: { line1: string; line2: string; line2Color?: string };
}

export const TRTHero = ({ headline }: TRTHeroProps = {}) => {
  const h = headline ?? {
    line1: "VIRGINIA'S CHOICE",
    line2: "FOR MEN'S HEALTH",
    line2Color: COLORS.orange,
  };
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

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 pt-24 pb-12 lg:pt-32 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-stretch">
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
            <span style={{ display: "block" }}>VIRGINIA&rsquo;S CHOICE</span>
            <span style={{ display: "block", color: COLORS.orange }}>
              {h.line2}
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
            Sit down with a licensed Virginia provider. Labs drawn on-site and reviewed in the same visit. No-cost consultation. Virginia's men's health practice since 2015.
          </p>

          {/* Symptom statements — pushed to bottom with auto top margin */}
          <div className="mt-auto pt-8 flex flex-col gap-4">
            {[
              "Tired by noon. Coffee stopped working.",
              "Same gym effort. Nothing to show.",
              "Sex drive is down. She\u2019s noticed too.",
              "Labs are fine. You\u2019re not.",
            ].map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.orange, flexShrink: 0 }} />
                {/* hardcoded-color-allow-next-line */}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "rgba(245,240,235,0.88)", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer moved inside form card via TRTHeroForm footer */}
        </div>

        {/* RIGHT - form. No decoration. DO NOT add borders, accents, or wrappers around the form. */}
        <div id="hero-form" className="w-full flex lg:justify-end">
          <div className="w-full lg:max-w-[440px]">
            <TRTHeroForm />
          </div>
        </div>


      </div>
    </section>
  );
};

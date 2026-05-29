/**
 * CROHeroSection — hero with rotating service words, symptom list, and inline form.
 *
 * Dynamic H1: if utm_term (or keyword) is present in the URL, the second line of
 * the H1 replaces the rotating service text with the sanitized keyword value.
 * Fallback: rotation continues as normal when no parameter is present.
 *
 * Supported params (checked in order): utm_term, keyword, kw, term
 * The value is decoded, stripped of HTML, title-cased, and capped at 60 chars.
 */
import { useState, useEffect } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { CROHeroForm } from "./CROHeroForm";
import { ROTATING_SERVICES, SYMPTOMS } from "@/data/croContent";

/** Read + sanitize a keyword from URL params. Returns null if absent/unsafe. */
function readKeyword(): string | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const raw = p.get("utm_term") ?? p.get("keyword") ?? p.get("kw") ?? p.get("term");
  if (!raw) return null;
  // Decode, strip tags, collapse whitespace, cap length
  const decoded = decodeURIComponent(raw).replace(/<[^>]*>/g, "").replace(/[^a-zA-Z0-9 '\-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  if (!decoded) return null;
  // Title-case
  return decoded.replace(/\b\w/g, (c) => c.toUpperCase());
}

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
          opacity: i === index ? 1 : 0, transition: "opacity 300ms ease", willChange: "opacity",
        }}>{word}</span>
      ))}
    </span>
  );
};

export const CROHeroSection = () => {
  const [keyword, setKeyword] = useState<string | null>(null);

  useEffect(() => {
    setKeyword(readKeyword());
  }, []);

  const scrollToForm = () => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <section id="hero" className="relative flex items-start lg:items-center"
      style={{ background: "var(--brand-navy-deep)", minHeight: 720 }}>
      <a href="#hero-form" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:text-black focus:rounded">
        Skip to lead form
      </a>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        opacity: 0.06,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        backgroundSize: "220px 220px",
      }} />
      {/* hardcoded-color-allow-next-line */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 50% at 28% 45%, rgba(27,43,75,0.55) 0%, rgba(11,16,41,0) 70%)" }} />
      {/* hardcoded-color-allow-next-line */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 85% 10%, rgba(232,103,10,0.18) 0%, rgba(11,16,41,0) 60%)" }} />
      {/* hardcoded-color-allow-next-line */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }} />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 pt-24 pb-12 lg:pt-28 lg:pb-20 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 lg:gap-12 items-start">
        <div className="flex flex-col">
          <h1 className="font-bold uppercase" style={{
            fontFamily: "Oswald, 'Bebas Neue', Anton, sans-serif",
            fontSize: "clamp(36px, 9vw, 96px)", lineHeight: 1.0, letterSpacing: "-0.01em",
            color: "var(--brand-cream)", fontWeight: 700,
          }}>
            <span style={{ display: "block", whiteSpace: "nowrap" }}>VIRGINIA&rsquo;S CHOICE</span>
            {keyword ? (
              // Dynamic: keyword from utm_term / keyword / kw / term param
              <span style={{ display: "block", color: "var(--brand-cta)", whiteSpace: "nowrap",
                fontSize: keyword.length > 20 ? "clamp(24px, 5vw, 64px)" : undefined }}>
                FOR {keyword}
              </span>
            ) : (
              // Default: rotating service
              <span style={{ display: "block", color: "var(--brand-cta)" }}>FOR <RotatingService /></span>
            )}
          </h1>
          {/* hardcoded-color-allow-next-line */}
          <p className="mt-6 w-full" style={{ color: "rgba(245,240,235,0.88)", fontFamily: "Inter, sans-serif", fontSize: 19, lineHeight: 1.6 }}>
            Your provider draws labs on-site and reads them with you. Same visit. Same day. No referrals. No waiting. No surprises.
          </p>
          <div className="mt-6 rounded-xl overflow-hidden" style={{ aspectRatio: "16/7", position: "relative", flexShrink: 0 }}>
            <img src="/images/clinic-lab-draw.webp"
              alt="Licensed provider reviewing lab results with a member at Men's Wellness Centers Virginia"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block" }}
              width={720} height={315} loading="eager" decoding="async" />
            <div aria-hidden style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to top, rgba(11,16,41,0.65) 0%, transparent 100%)", pointerEvents: "none",
            }} />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {SYMPTOMS.map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ChevronRight size={16} strokeWidth={1.75} aria-hidden style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                {/* hardcoded-color-allow-next-line */}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "rgba(245,240,235,0.88)", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
          <button type="button" onClick={scrollToForm}
            className="mt-6 inline-flex items-center gap-2 font-bold cursor-pointer border-none"
            style={{
              alignSelf: "flex-start", background: "transparent",
              // hardcoded-color-allow-next-line
              border: `1.5px solid rgba(232,103,10,0.55)`, borderRadius: 8, padding: "11px 20px",
              color: "var(--brand-cta)", fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 700,
              letterSpacing: "0.03em", transition: "border-color 150ms ease, background 150ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(232,103,10,0.10)"; e.currentTarget.style.borderColor = "var(--brand-cta)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(232,103,10,0.55)"; }}>
            Yes, this is me. Show me the fix. <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
        <div id="hero-form" className="w-full flex lg:justify-end md:sticky md:top-[72px]">
          <div className="w-full"><CROHeroForm /></div>
        </div>
      </div>
    </section>
  );
};

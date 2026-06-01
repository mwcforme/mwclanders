import { ChevronRight, Star } from "lucide-react";
import { TRTHeroForm } from "@/components/landing/trt/TRTHeroForm";
import { COPY } from "@/data/copy";
import { GBP_REVIEWS_URL } from "@/data/testimonials";

const SYMPTOMS = [
  "You've done the diets. The weight comes back.",
  "Your doctor says eat less, move more. That's not a plan.",
  "GLP-1 medications work. You want a provider who manages your dose.",
  "Not a chatbot. Not a pill in the mail. A real face-to-face visit.",
  "FSA and HSA accepted. No insurance needed.",
];

const COLORS = {
  navyDeep: "var(--brand-navy-deep)",
  cream: "#FFFFFF",       /* pure white — matches WP marketing site */
  orange: "var(--brand-accent)", /* #E8732A accent for line 2 */
  // hardcoded-color-allow-next-line
  gold: "#C9A961",
};

export const WLHero = () => {
  return (
    <section
      id="hero"
      className="relative flex items-start lg:items-center"
      style={{ background: COLORS.navyDeep, minHeight: 720 }}
    >
      <a
        href="#hero-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:text-black focus:rounded"
      >
        Skip to lead form
      </a>

      {/* Grain */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        opacity: 0.06,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        backgroundSize: "220px 220px",
      }} />

      {/* Radial behind H1 */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        // hardcoded-color-allow-next-line
        background: "radial-gradient(ellipse 50% 50% at 28% 45%, rgba(27,43,75,0.55) 0%, rgba(11,16,41,0) 70%)",
      }} />

      {/* Orange glow top-right */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        // hardcoded-color-allow-next-line
        background: "radial-gradient(ellipse 60% 50% at 85% 10%, rgba(232,103,10,0.18) 0%, rgba(11,16,41,0) 60%)",
      }} />

      {/* Vignette */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        // hardcoded-color-allow-next-line
        background: "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
      }} />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 pt-24 pb-12 lg:pt-32 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 lg:gap-16 items-stretch">

        {/* LEFT */}
        <div className="flex flex-col">
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
            <span style={{ display: "block", color: COLORS.orange, whiteSpace: "nowrap" }}>FOR WEIGHT LOSS</span>
          </h1>

          {/* Photo — immediately under H1, best aspect ratio for this image */}
          <div className="mt-6 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", position: "relative", flexShrink: 0 }}>
            <img
              src="/assets/lp/man-confident-gray-hair-earbuds.webp"
              alt="Licensed provider drawing labs on-site at Men's Wellness Centers Virginia"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }}
              width={720} height={405} loading="eager" decoding="async"
            />
            <div aria-hidden style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
              background: "linear-gradient(to top, rgba(11,16,41,0.70) 0%, transparent 100%)", pointerEvents: "none",
            }} />
          </div>

          {/* Stars — anchored to photo for social proof proximity */}
          <a
            href={GBP_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <span style={{ display: "flex", gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={COLORS.gold} stroke={COLORS.gold} />
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
            Provider-supervised weight loss medications with a clinician who adjusts your dose, watches your labs, and shows up for every visit. Not a chatbot. Not a pill in the mail.
          </p>

          {/* Single combined pill row — service + objection chips together */}
          <div className="mt-5 flex flex-wrap gap-2">
            {["GLP-1 Medications", "Provider-Supervised", "FSA + HSA Accepted"].map(label => (
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
            {["No insurance needed", "Same- or next-day"].map(label => (
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
            {SYMPTOMS.map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <ChevronRight size={16} strokeWidth={1.75} aria-hidden style={{ color: COLORS.orange, flexShrink: 0, marginTop: 3 }} />
                {/* hardcoded-color-allow-next-line */}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "rgba(245,240,235,0.88)", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — form, no outer wrapper */}
        <div id="hero-form" className="w-full flex lg:justify-end">
          <div className="w-full">
            <TRTHeroForm
              service="wl"
              heading="Diets don't fail you. The wrong approach does."
              subheading="Provider-supervised weight loss that treats the whole man. Same-day availability."
              ctaLabel={COPY.cta.seeIfIQualify}
              formId="hero-wl"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

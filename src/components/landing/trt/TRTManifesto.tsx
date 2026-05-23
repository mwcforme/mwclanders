const imgManifesto = "/assets/lp/provider-lab-notes.webp";
import { Quote } from "lucide-react";
import { COPY } from "@/data/copy";

interface TRTManifestoProps {
  ctaScrollTarget?: string;
}

export const TRTManifesto = ({ ctaScrollTarget = "final-cta" }: TRTManifestoProps = {}) => {
  return (
    <section className="py-12 md:py-16" style={{ background: "var(--brand-navy)" }}>
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        {/* Left: copy (mobile second) */}
        <div className="order-2 md:order-1">
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand-cta-accessible)", borderLeft: "3px solid var(--brand-cta)", paddingLeft: 10, lineHeight: 1, marginBottom: 12 }}>
            Why Men Choose Us
          </p>
          <h2
            className="font-bold uppercase"
            style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 40px)", color: "var(--c-text-on-dark)", fontWeight: 700, lineHeight: 1.1 }}
          >
            Your labs might be normal.<br />You still don't feel right.
          </h2>

          {/* hardcoded-color-allow-next-line */}
          <p className="text-base mt-5 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            Most men wait two years before saying something out loud. They get bloodwork. Their GP says everything looks fine. They go home. Nothing changes.
          </p>
          {/* hardcoded-color-allow-next-line */}
          <p className="text-base mt-4 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            We specialize in men's health. One licensed provider, your labs, and a real conversation. Not a telehealth chat. Not a coordinator reading from a tablet. A real conversation about how you actually feel. If treatment is right for you, you leave with a plan the same day.
          </p>

          <figure
            className="mt-7 rounded-xl p-6 relative"
            style={{
              // hardcoded-color-allow-next-line
              background: "rgba(255,255,255,0.07)",
              // hardcoded-color-allow-next-line
              border: "1px solid rgba(255,255,255,0.35)",
              // hardcoded-color-allow-next-line
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            <Quote
              className="h-10 w-10 absolute"
              style={{ color: "var(--brand-cta)", top: -14, left: 16, opacity: 0.9 }}
              aria-hidden="true"
            />
            <blockquote
              className="text-base leading-relaxed italic mt-2"
              style={{
                // hardcoded-color-allow-next-line
                color: "rgba(255,255,255,0.92)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              "Saw two GPs who told me my levels were fine. I knew they weren't. Three weeks after starting treatment I was sleeping through the night again. The difference in energy over the next few months was something no standard lab panel ever captured."
            </blockquote>
            {/* hardcoded-color-allow-next-line */}
            <figcaption className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Inter, sans-serif" }}>
              <span className="flex items-center gap-2">
                <span>James T., 48, Norfolk</span>
              </span>
              {/* hardcoded-color-allow-next-line */}
              <span className="block mt-1" style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontStyle: "normal" }}>Verified patient. Individual results vary.</span>
            </figcaption>
          </figure>

          <button
            onClick={() => document.getElementById(ctaScrollTarget)?.scrollIntoView({ behavior: "smooth" })}
            className="mt-7 w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer border-none"
            style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "var(--c-text-on-dark)", fontSize: "clamp(15px, 3.5vw, 19px)", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}
          >
            {COPY.cta.seeIfYouQualify}
          </button>
          {/* hardcoded-color-allow-next-line */}
          <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif" }}>
            {COPY.offer.manifestoTag}
          </p>
        </div>

        {/* Right: image (mobile first) */}
        <div className="order-1 md:order-2">
          <img
            src={imgManifesto}
            alt="Phlebotomist drawing labs for a Virginia man at a Men's Wellness Center"
            className="rounded-2xl w-full aspect-[4/3] md:aspect-auto md:h-[460px]"
            style={{
              objectFit: "cover", objectPosition: "center 35%",
              // hardcoded-color-allow-next-line
              boxShadow: "0 24px 64px rgba(0,0,0,0.40)",
            }}
            width={600}
            height={450}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
};

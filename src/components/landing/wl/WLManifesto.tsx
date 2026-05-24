import { Quote } from "lucide-react";
import { COPY } from "@/data/copy";

export const WLManifesto = () => (
  <section className="py-10 md:py-16" style={{ background: "var(--brand-navy)" }}>
    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
      <div className="order-2 md:order-1">
        <div className="uppercase mb-3" style={{ color: "var(--brand-cta-accessible)", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" }}>
          Why Men Choose Us
        </div>
        <h2 className="font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 40px)", color: "var(--c-text-on-dark)", fontWeight: 700, lineHeight: 1.1 }}>
          Real medicine.<br />Real follow-up.
        </h2>

        {/* hardcoded-color-allow-next-line */}
        <p className="text-base mt-5 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
          Prescription weight loss medications work. What changes the outcome is what wraps around them: a licensed provider who knows your labs, a plan that fits your life, and check-ins that catch the small things before they stall your progress.
        </p>
        {/* hardcoded-color-allow-next-line */}
        <p className="text-base mt-4 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
          That is what you get here. Not a script in the mail. Not a new clinician every visit. A licensed Virginia provider, your numbers, and a plan that adjusts as you do.
        </p>

        <figure className="mt-7 rounded-xl p-5" style={{
          // hardcoded-color-allow-next-line
          background: "rgba(255,255,255,0.07)",
          // hardcoded-color-allow-next-line
          border: "1px solid rgba(255,255,255,0.35)",
        }}>
          <Quote className="h-5 w-5 mb-2" style={{ color: "var(--brand-cta)" }} />
          {/* hardcoded-color-allow-next-line */}
          <blockquote className="text-base leading-relaxed italic" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}>
            "I lost 38 pounds in six months and, more importantly, I kept it off. The difference was the provider actually adjusting my dose and checking in. It was not a pill in a box."
          </blockquote>
          {/* hardcoded-color-allow-next-line */}
          <figcaption className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Inter, sans-serif" }}>
            David K., 54, Norfolk
            {/* hardcoded-color-allow-next-line */}
            <span className="block mt-1" style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontStyle: "normal" }}>Results not typical. Individual results vary.</span>
          </figcaption>
        </figure>

        <button
          onClick={() => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" })}
          className="mt-7 w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer border-none"
          style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "var(--c-text-on-dark)", fontSize: 15, letterSpacing: "0.08em", fontFamily: "Inter, sans-serif" }}
        >
          {COPY.cta.seeIfIQualify}
        </button>
        {/* hardcoded-color-allow-next-line */}
        <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif" }}>
          {COPY.offer.manifestoTag}
        </p>
      </div>

      <div className="order-1 md:order-2">
        <img
          src="/assets/lp/provider-consultation-wide.webp"
          alt="Provider reviewing weight loss protocol with patient at Men's Wellness Centers"
          className="rounded-2xl object-cover w-full aspect-[4/3] md:aspect-auto md:h-[460px]"
          width={600}
          height={450}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </section>
);

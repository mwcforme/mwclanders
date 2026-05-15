import imgManifesto from "@/assets/lp/man-bloodwork-clinic.png";
import { Quote } from "lucide-react";
import { COPY } from "@/data/copy";

export const TRTManifesto = () => {
  return (
    <section className="py-10 md:py-16" style={{ background: "#000033" }}>
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        {/* Left: copy (mobile second) */}
        <div className="order-2 md:order-1">
          <div
            className="uppercase mb-3"
            style={{ color: "#E8670A", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" }}
          >
            Why Men Choose Us
          </div>
          <h2
            className="font-bold uppercase"
            style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 40px)", color: "#FFFFFF", fontWeight: 700, lineHeight: 1.1 }}
          >
            This isn't about vanity.<br />It's about getting your edge back.
          </h2>

          <p className="text-base mt-5 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            Sharp. Confident. Performing at your level. That's the man your wife married, your team respects, and your kids look up to. When the energy goes, the rest follows.
          </p>
          <p className="text-base mt-4 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            We are men's health. Not a side service at a general practice. Not a faceless app. A Virginia physician, your numbers, and a plan that fits your life.
          </p>

          <figure
            className="mt-7 rounded-xl p-6 relative"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--c-border-on-dark)" }}
          >
            <Quote
              className="h-10 w-10 absolute"
              style={{ color: "#E8670A", top: -14, left: 16, opacity: 0.9 }}
              aria-hidden="true"
            />
            <blockquote
              className="text-base leading-relaxed italic mt-2"
              style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}
            >
              "I felt like I was running on fumes for two years. One visit, real labs, a real plan. Six weeks in I was sleeping again. Six months in I felt like myself."
            </blockquote>
            <figcaption className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Inter, sans-serif" }}>
              <span className="flex items-center gap-2">
                <span>Mark B., 52, Richmond</span>
              </span>
              <span className="block mt-1" style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", fontStyle: "normal" }}>Individual results vary.</span>
            </figcaption>
          </figure>

          <button
            onClick={() => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-7 inline-flex items-center justify-center rounded-full px-8 font-bold uppercase cursor-pointer border-none"
            style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "#FFFFFF", fontSize: 19, letterSpacing: "0.08em", fontFamily: "Inter, sans-serif" }}
          >
            {COPY.cta.seeIfYouQualify}
          </button>
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
            style={{ objectFit: "cover", objectPosition: "center 35%" }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

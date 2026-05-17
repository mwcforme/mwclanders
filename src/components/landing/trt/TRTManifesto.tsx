import imgManifesto from "@/assets/lp/man-bloodwork-clinic.webp";
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
            Your labs might be normal.<br />You still don't feel right.
          </h2>

          <p className="text-base mt-5 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            Most men wait two years before saying something out loud. They get bloodwork. Their GP says everything looks fine. They go home. Nothing changes.
          </p>
          <p className="text-base mt-4 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            We specialize in men's health. One physician, your labs, and a conversation — not a telehealth chat, not a coordinator reading from a script. If treatment is right for you, you leave with a plan the same day.
          </p>

          <figure
            className="mt-7 rounded-xl p-6 relative"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)" }}
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
              <span className="block mt-1" style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", fontStyle: "normal" }}>Verified patient. Individual results vary.</span>
            </figcaption>
          </figure>

          <button
            onClick={() => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-7 w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer border-none"
            style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "#FFFFFF", fontSize: "clamp(15px, 3.5vw, 19px)", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}
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
            style={{ objectFit: "cover", objectPosition: "center 35%", boxShadow: "0 24px 64px rgba(0,0,0,0.40)" }}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
};

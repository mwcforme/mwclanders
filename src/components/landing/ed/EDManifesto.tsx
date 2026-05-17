import { Quote } from "lucide-react";
import { COPY } from "@/data/copy";

export const EDManifesto = () => (
  <section className="py-10 md:py-16" style={{ background: "var(--brand-navy)" }}>
    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
      <div className="order-2 md:order-1">
        <div className="uppercase mb-3" style={{ color: "var(--brand-cta)", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" }}>
          Why Men Choose Us
        </div>
        <h2 className="font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 40px)", color: "var(--c-text-on-dark)", fontWeight: 700, lineHeight: 1.1 }}>
          Treat the cause.<br />Not just the symptom.
        </h2>

        <p className="text-base mt-5 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
          A blue pill in the mail does not ask why this is happening. We do. ED is often the first sign of a hormone issue, a vascular issue, or both. Treating it without that picture is a coin flip.
        </p>
        <p className="text-base mt-4 leading-[1.7]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
          You see the same licensed provider at the same center. Labs run on-site. Treatment options that go beyond what an app can offer, prescribed when clinically appropriate for your case.
        </p>

        <figure className="mt-7 rounded-xl p-5" style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}>
          <Quote className="h-5 w-5 mb-2" style={{ color: "var(--brand-cta)" }} />
          <blockquote className="text-base leading-relaxed italic" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}>
            "Pills from a website did nothing for two years. One real visit, real labs, the right protocol, and it works. I should have done this a long time ago."
          </blockquote>
          <figcaption className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Inter, sans-serif" }}>
            Steve P., 56, Chesapeake
          </figcaption>
        </figure>

        <button
          onClick={() => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" })}
          className="mt-7 w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer border-none"
          style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "var(--c-text-on-dark)", fontSize: 15, letterSpacing: "0.08em", fontFamily: "Inter, sans-serif" }}
        >
          {COPY.cta.bookDiscreetVisit}
        </button>
        <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif" }}>
          Private, in-person visit. Individual results vary.
        </p>
      </div>

      <div className="order-1 md:order-2">
        <img
          src="/assets/lp/man-bloodwork-clinic.webp"
          decoding="async"
          alt="Patient having labs reviewed with a provider at a Men's Wellness Center in Virginia"
          className="rounded-2xl object-cover w-full aspect-[4/3] md:aspect-auto md:h-[460px]"
          loading="lazy"
        />
      </div>
    </div>
  </section>
);

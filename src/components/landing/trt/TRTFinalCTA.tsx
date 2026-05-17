import { Check, MapPin } from "lucide-react";
import { TRTHeroForm } from "@/components/landing/trt/TRTHeroForm";
import { COPY } from "@/data/copy";

export const TRTFinalCTA = () => {
  return (
    <section id="final-cta" className="py-14 md:py-20" style={{ background: "#000033" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center">
          <h2
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              color: "#FFFFFF",
              fontWeight: 700,
            }}
          >
            Meet Your Virginia Provider.
          </h2>
          <p className="text-base mt-2" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            Same-day labs. Results reviewed in the same visit. No-cost consultation.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Left: proof copy */}
          <div className="order-2 md:order-1 md:pt-2">
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif" }}
            >
              Your first visit is 60 minutes. Labs drawn on-site. A licensed provider reviews every number with you before you leave, and builds a care plan if treatment is right for you. Individual results vary.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "100% private. Your employer or insurance is never notified.",
                COPY.offer.cancelReschedule,
                "If TRT isn't right for you, our providers will tell you. Treatment is only prescribed when clinically appropriate.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}>
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={3} style={{ color: "#2ECC71" }} />
                  <span className="text-base">{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <div
                className="text-xs font-semibold uppercase mb-3"
                style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", fontFamily: "Inter, sans-serif" }}
              >
                Center Locations
              </div>
              <ul className="space-y-2">
                {[
                  { label: "Richmond, VA", to: "#locations" },
                  { label: "Newport News, VA", to: "#locations" },
                  { label: "Virginia Beach, VA", to: "#locations" },
                ].map((l) => (
                  <li key={l.label} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: "#E8670A" }} />
                    <a
                      href={l.to}
                      className="text-base underline underline-offset-4 hover:text-white transition-colors"
                      style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: reuse the hero form - same GHL integration, same booking funnel */}
          <div className="order-1 md:order-2 flex lg:justify-center">
            <div className="w-full lg:max-w-[440px]">
              <TRTHeroForm
                heading="Your labs might be 'normal.' The man's symptoms say otherwise."
                subheading="We treat the man's symptoms, not just the numbers. Same-day availability."
                ctaLabel={COPY.cta.bookConsult}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

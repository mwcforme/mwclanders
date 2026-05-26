/**
 * ServiceFinalCTA — bottom-of-page CTA section for ED and WL landing pages.
 *
 * Refactored 2026-05-25: replaced DIY form with shared TRTHeroForm so all
 * landing pages use the same lead-capture + booking-funnel entry path.
 * Previous DIY form redirected to a static thank-you URL with no GHL
 * integration — that path is now removed.
 */
import { MapPin } from "lucide-react";
import { TRTHeroForm } from "@/components/landing/trt/TRTHeroForm";
import type { Service } from "@/domain/booking/bookingStore";
import { COPY } from "@/data/copy";

interface ServiceFinalCTAProps {
  service: "wl" | "ed";
  headline: string;
  subhead: string;
  /** @deprecated — form card title is now handled by TRTHeroForm */
  cardTitle?: string;
  /** @deprecated — CTA label is now handled by TRTHeroForm via COPY */
  ctaLabel?: string;
  bullets: string[];
  intro: string;
}

export const ServiceFinalCTA = ({
  service, headline, subhead, bullets, intro,
}: ServiceFinalCTAProps) => {
  return (
    <section id="final-cta" className="py-14 md:py-20" style={{ background: "var(--brand-navy)" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center">
          <h2
            className="font-bold uppercase"
            style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 40px)", color: "var(--c-text-on-dark)", fontWeight: 700 }}
          >
            {headline}
          </h2>
          {/* hardcoded-color-allow-next-line */}
          <p className="text-base mt-2" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            {subhead}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: "#9C7A0A", fontSize: "20px" }}>★</span>
            ))}
            {/* hardcoded-color-allow-next-line */}
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>200+ Reviews</span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Left: proof copy */}
          <div className="order-2 md:order-1 md:pt-2">
            {/* hardcoded-color-allow-next-line */}
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif" }}>
              {intro}
            </p>
            <ul className="mt-6 space-y-3">
              {bullets.map((t) => (
                <li key={t} className="flex items-start gap-3" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}>
                  {/* hardcoded-color-allow-next-line */}
                  <span className="mt-0.5 flex-shrink-0" style={{ color: "#2ECC71", fontSize: 18, lineHeight: 1 }}>✓</span>
                  <span className="text-base">{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {/* hardcoded-color-allow-next-line */}
              <div className="text-xs font-semibold uppercase mb-3" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", fontFamily: "Inter, sans-serif" }}>
                Center Locations
              </div>
              <ul className="space-y-2">
                {[
                  { label: "Richmond, VA", to: "#locations" },
                  { label: "Newport News, VA", to: "#locations" },
                  { label: "Virginia Beach, VA", to: "#locations" },
                ].map((l) => (
                  <li key={l.label} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: "var(--brand-cta)" }} />
                    {/* hardcoded-color-allow-next-line */}
                    <a href={l.to} className="text-base underline underline-offset-4 hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: shared hero form — same GHL integration + booking funnel as all other LPs */}
          <div className="order-1 md:order-2 flex lg:justify-center">
            <div className="w-full lg:max-w-[440px]">
              <TRTHeroForm
                service={service as Service}
                ctaLabel={COPY.cta.bookConsult}
                formId="footer-form"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * TRTThreeProblems — "Three Problems. One Clinic."
 *
 * Adapted from menswellnesscenters.com WP site section.
 * Three service cards with lifestyle imagery, brief copy, and CTA.
 * Cream/warm off-white background to break up the dark sections.
 */
import { COPY } from "@/data/copy";
import { ArrowRight } from "lucide-react";

const SERVICES = [
  {
    id: "trt",
    eyebrow: "TESTOSTERONE THERAPY (TRT)",
    headline: "Low T is more common than you think.",
    body: "Most men over 40 have it. Most are never told. A licensed Virginia provider reviews your labs on-site and builds a protocol specific to your numbers — not a generic template.",
    cta: COPY.cta.bookConsult,
    href: "/book/location",
    img: "/images/clinic-lab-draw.webp",
    imgFallback: "/images/clinic-lab-draw.jpg",
    imgAlt: "MWC provider drawing labs on-site at a Virginia clinic",
  },
  {
    id: "ed",
    eyebrow: "ED TREATMENT",
    headline: "A medical issue with medical solutions.",
    body: "ED is vascular. It responds to proper diagnosis and treatment — not a pill subscription. In-person evaluation, FDA-approved options, and a plan that actually works.",
    cta: COPY.cta.bookConsult,
    href: "/ed",
    img: "/images/couple-wellness.webp",
    imgFallback: "/images/couple-wellness.jpg",
    imgAlt: "Couple enjoying quality time after men's health care",
  },
  {
    id: "wl",
    eyebrow: "MEDICAL WEIGHT LOSS",
    headline: "The same effort used to work.",
    body: "Diet and exercise aren't the full story for most men. GLP-1 therapy, lab-guided protocols, and a provider who monitors your progress make the difference.",
    cta: COPY.cta.bookConsult,
    href: "/wl",
    img: "/images/man-gym-confident.webp",
    imgFallback: "/images/man-gym-confident.webp",
    imgAlt: "Man with improved physique after medical weight loss program",
  },
];

interface TRTThreeProblemsProps {
  onCta?: () => void;
  headlineOverride?: { line1: string; line2?: string };
}

export const TRTThreeProblems = ({ onCta, headlineOverride }: TRTThreeProblemsProps = {}) => {
  const handleCta = (href: string) => {
    if (onCta) { onCta(); return; }
    window.location.href = href;
  };

  return (
    <section
      id="services"
      style={{
        background: "var(--brand-cream)",
        scrollMarginTop: 64,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 14 }}>
            OUR SERVICES
          </p>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.5vw, 40px)",
              color: "var(--brand-navy)",
              lineHeight: 1.1,
            }}
          >
            {headlineOverride ? (
              <>
                {headlineOverride.line1}
                {headlineOverride.line2 && (
                  <><br /><span style={{ color: "var(--brand-cta)" }}>{headlineOverride.line2}</span></>
                )}
              </>
            ) : (
              <>
                THREE PROBLEMS.
                <br />
                <span style={{ color: "var(--brand-cta)" }}>ONE CLINIC.</span>
              </>
            )}
          </h2>
          <p
            className="mt-4 max-w-[560px] mx-auto"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 17,
              color: "var(--c-text-on-light-muted)",
              lineHeight: 1.6,
            }}
          >
            TRT, ED care, and medical weight loss under one roof. Virginia providers who specialize in men's health — not a side service.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(11,16,41,0.08)",
                boxShadow: "0 4px 24px rgba(11,16,41,0.06), 0 1px 4px rgba(11,16,41,0.04)",
              }}
            >
              {/* Image */}
              <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
                <picture>
                  <source srcSet={s.img} type="image/webp" />
                  <img
                    src={s.imgFallback}
                    alt={s.imgAlt}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                {/* Service eyebrow */}
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    background: "rgba(11,16,41,0.85)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 600,
                    fontSize: 10,
                    letterSpacing: "0.10em",
                    color: "var(--brand-cta)",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {s.eyebrow}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6 md:p-7">
                <h3
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "var(--brand-navy)",
                    lineHeight: 1.2,
                    marginBottom: 12,
                  }}
                >
                  {s.headline}
                </h3>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 15,
                    color: "var(--c-text-on-light-muted)",
                    lineHeight: 1.6,
                    flex: 1,
                    marginBottom: 20,
                  }}
                >
                  {s.body}
                </p>
                <button
                  type="button"
                  onClick={() => handleCta(s.href)}
                  className="inline-flex items-center gap-2 font-bold cursor-pointer"
                  style={{
                    background: "var(--brand-cta)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 20px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    transition: "background 150ms ease",
                    alignSelf: "flex-start",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-cta-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-cta)")}
                >
                  {s.cta} <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

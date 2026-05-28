/**
 * TRTThreeProblems — "Three Problems. One Clinic."
 *
 * Adapted from menswellnesscenters.com WP site section.
 * Three service cards with lifestyle imagery, brief copy, and CTA.
 * Cream/warm off-white background to break up the dark sections.
 */
import { COPY } from "@/data/copy";
import { ArrowRight, Droplet, HeartPulse, TrendingDown } from "lucide-react";
import { Eyebrow, SectionHeading, SectionSubhead } from "@/components/landing/shared/primitives";

const SERVICES = [
  {
    id: "trt",
    eyebrow: "TESTOSTERONE THERAPY (TRT)",
    headline: "Your labs, reviewed by your provider.",
    body: "A Virginia-licensed provider reviews your bloodwork on-site and builds a protocol around your numbers. Seen this week. No referrals. No template protocols.",
    cta: COPY.cta.bookConsult,
    href: "/book/location",
    Icon: Droplet,
    iconAriaLabel: "Lab-guided testosterone protocol",
  },
  {
    id: "ed",
    eyebrow: "ED TREATMENT",
    headline: "In-person evaluation. Clinical answers.",
    body: "ED has a physiological cause and a medical solution. An in-person evaluation with a Virginia-licensed provider, same-day, with FDA-approved options reviewed on site.",
    cta: COPY.cta.bookConsult,
    href: "/ed",
    Icon: HeartPulse,
    iconAriaLabel: "Cardiovascular evaluation for ED",
  },
  {
    id: "wl",
    eyebrow: "MEDICAL WEIGHT LOSS",
    headline: "Lab-guided protocol. Ongoing care.",
    body: "GLP-1 therapy prescribed and monitored by a Virginia provider, not a call-center intake. Labs reviewed at every visit. One provider, one plan, adjusted as you progress.",
    cta: COPY.cta.bookConsult,
    href: "/wl",
    Icon: TrendingDown,
    iconAriaLabel: "Monitored weight-loss protocol",
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
          <Eyebrow>Integrated Care</Eyebrow>
          <SectionHeading
            center
            line1={headlineOverride?.line1 ?? "ONE PROVIDER."}
            line2={headlineOverride?.line2 ?? "THREE CONCERNS."}
          />
          <div className="mt-4">
            <SectionSubhead center maxWidth={720}>
              Most men treat these separately. We handle all three in a single in-person visit. Same provider. Same day. One plan built around your labs.
            </SectionSubhead>
          </div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(11,16,41,0.10)",
                boxShadow: "0 4px 24px rgba(11,16,41,0.06), 0 1px 4px rgba(11,16,41,0.04)",
              }}
            >
              {/* Service title header — above image */}
              <div
                style={{
                  padding: "14px 20px 12px",
                  borderBottom: "1px solid rgba(11,16,41,0.08)",
                  background: "#FFFFFF",
                }}
              >
                <p
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    color: "var(--brand-navy)",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {s.eyebrow}
                </p>
              </div>

              {/* Icon panel */}
              <div
                style={{
                  height: 200,
                  background: "var(--brand-navy)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle radial glow behind icon */}
                <div style={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(232,103,10,0.18) 0%, transparent 70%)",
                }} />
                <s.Icon
                  size={80}
                  strokeWidth={1.25}
                  style={{ color: "var(--brand-cta)", position: "relative" }}
                  aria-label={s.iconAriaLabel}
                  role="img"
                />
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
                    fontSize: 16,
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
                    fontSize: 16,
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

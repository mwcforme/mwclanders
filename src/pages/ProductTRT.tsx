import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, FlaskConical, Stethoscope, ClipboardList,
  ArrowRight,
} from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { OrangeCTA, Eyebrow } from "@/components/landing/trt/TRTProductHelpers";
import { TRTProductFAQ } from "@/components/landing/trt/TRTProductFAQ";
import { TRTFinalCTASection } from "@/components/landing/trt/TRTFinalCTASection";
import { TRTBenefitsSection } from "@/components/landing/trt/TRTBenefitsSection";
import { TRTSignsSection } from "@/components/landing/trt/TRTSignsSection";
import { TRTProcessSection } from "@/components/landing/trt/TRTProcessSection";
import { TRTTreatmentOptionsSection } from "@/components/landing/trt/TRTTreatmentOptionsSection";

/* ─── CSS keyframe animations ─────────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes shimmerLR {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Announcement shimmer */
  .ann-shimmer {
    background: linear-gradient(
      90deg,
      #0B1029 0%,
      #0B1029 30%,
      #1e2f5e 50%,
      #0B1029 70%,
      #0B1029 100%
    );
    background-size: 200% auto;
    animation: shimmerLR 3.5s linear infinite;
  }


  /* Media pill hover */
  .media-pill {
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .media-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.14) !important;
  }

  /* Treatment card hover lift */
  .treatment-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .treatment-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.18);
  }

  /* Signs tile hover */
  .sign-tile {
    transition: transform 0.18s ease, background 0.18s ease;
  }
  .sign-tile:hover {
    transform: translateY(-3px);
    background: rgba(255,255,255,0.11) !important;
  }

  /* FAQ item hover */
  .faq-question:hover {
    background: #f0f2f8 !important;
  }

  /* Quiz answer grid — single-col on very small screens */
  @media (max-width: 520px) {
    .quiz-grid { grid-template-columns: 1fr !important; }
  }

  /* Step connecting line — shown only on desktop */
  .steps-wrapper { position: relative; }
  .steps-connector {
    position: absolute;
    top: 38px;
    left: calc(16.66% + 14px);
    right: calc(16.66% + 14px);
    height: 2px;
    background: linear-gradient(90deg, #E8670A 0%, #F07820 100%);
    pointer-events: none;
    z-index: 0;
  }

  /* Mobile overrides */
  @media (max-width: 768px) {
    .hero-grid     { grid-template-columns: 1fr !important; gap: 28px !important; }
    .benefits-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .steps-grid    { grid-template-columns: 1fr !important; }
    .treatment-grid{ grid-template-columns: 1fr !important; }
    .steps-connector { display: none; }
  }
  @media (max-width: 600px) {
    .signs-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

/* ─── TRT Quiz ─────────────────────────────────────────────────────────────── */

const QUIZ_QUESTIONS: { q: string; options: string[] }[] = [
  {
    q: "Have you noticed a drop in your energy levels?",
    options: ["Yes, significantly", "Somewhat", "Only occasionally", "No, not really"],
  },
  {
    q: "Have you experienced changes in muscle mass or strength?",
    options: ["Noticeable loss", "Some decline", "Hard to tell", "No changes"],
  },
  {
    q: "How would you describe your current libido?",
    options: ["Much lower than before", "Slightly decreased", "About the same", "No changes"],
  },
  {
    q: "How is your sleep quality?",
    options: [
      "Poor - I struggle most nights",
      "Fair - some good, some bad",
      "Good - occasional issues",
      "Great - no problems",
    ],
  },
  {
    q: "How often do you experience brain fog or difficulty concentrating?",
    options: ["Daily", "A few times a week", "Occasionally", "Rarely or never"],
  },
];

const TRTQuiz = ({ onNavigateSchedule }: { onNavigateSchedule: () => void }) => {
  const [current, setCurrent] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const isDone = current >= total;
  const progress = isDone ? 100 : (current / total) * 100;

  const handleAnswer = (idx: number) => {
    if (advancing) return;
    setSelected(idx);
    setAdvancing(true);
    setTimeout(() => {
      setCurrent((c) => {
        const next = c + 1;
        return next;
      });
      setSelected(null);
      setAdvancing(false);
    }, 300);
  };

  const scrollToFaq = () => {
    document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section style={{ background: "#FDF6F0", padding: "64px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Progress bar track */}
        <div
          style={{
            height: 6,
            background: "#E8D5C4",
            borderRadius: 999,
            width: 200,
            margin: "0 auto 32px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 6,
              background: "#E8670A",
              borderRadius: 999,
              width: `${progress}%`,
              transition: "width 300ms ease",
            }}
          />
        </div>

        {!isDone ? (
          <>
            {/* Question */}
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 3.5vw, 36px)",
                color: "var(--c-text-on-light)",
                textAlign: "center",
                maxWidth: 600,
                margin: "0 auto 32px",
                lineHeight: 1.25,
              }}
            >
              {QUIZ_QUESTIONS[current].q}
            </h2>

            {/* 2×2 answer grid */}
            <div
              className="quiz-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 14,
              }}
            >
              {QUIZ_QUESTIONS[current].options.map((opt, i) => {
                const isSelected = selected === i;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(i)}
                    style={{
                      background: isSelected ? "rgba(232,103,10,0.04)" : "var(--bg-white)",
                      border: `1.5px solid ${isSelected ? "#E8670A" : "#E8E8E8"}`,
                      borderRadius: 16,
                      padding: "20px 16px",
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--c-text-on-light)",
                      cursor: advancing ? "default" : "pointer",
                      minHeight: 64,
                      fontFamily: "Inter, sans-serif",
                      transition: "border-color 150ms ease, background 150ms ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !advancing) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8670A";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,103,10,0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8E8E8";
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-white)";
                      }
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Completion screen */
          <div style={{ textAlign: "center" }}>
            {/* Orange divider line */}
            <div
              style={{
                width: 80,
                height: 2,
                background: "#E8670A",
                borderRadius: 999,
                margin: "0 auto 32px",
              }}
            />
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 4vw, 38px)",
                color: "var(--c-text-on-light)",
                marginBottom: 20,
              }}
            >
              You&apos;re In Good Hands.
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--c-text-on-light-muted)",
                lineHeight: 1.7,
                maxWidth: 560,
                margin: "0 auto 36px",
              }}
            >
              Our licensed Virginia providers will review your symptoms, run labs, and build a treatment plan based on your results. Individual results vary.
            </p>
            {/* Primary CTA */}
            <button
              type="button"
              onClick={onNavigateSchedule}
              style={{
                background: "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "16px 28px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                width: "100%",
                maxWidth: 500,
                display: "block",
                margin: "0 auto 16px",
                boxShadow: "0 6px 28px rgba(232,103,10,0.45)",
                letterSpacing: "0.02em",
              }}
            >
              Get Started Now
            </button>
            {/* Secondary link */}
            <button
              type="button"
              onClick={scrollToFaq}
              style={{
                background: "none",
                border: "none",
                color: "#1a1a2e",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Not sure yet →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Main component ────────────────────────────────────────────────────────── */

const ProductTRT = () => {
  const navigate = useNavigate();
  const goSchedule = () => navigate("/product/trt/schedule");


  return (
    <div
      style={{
        background: "#fff",
        fontFamily: "Inter, sans-serif",
        overflowX: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SEO
        title="Testosterone Replacement Therapy | Men's Wellness Centers"
        description="In-person TRT at Virginia's physician-led men's health practice. On-site labs, same-day results, and personalized protocols. No-cost consultation."
      />

      {/* ── Global styles + keyframes ──────────────────────────────────────── */}
      <style>{GLOBAL_STYLES}</style>

      {/* ── ANNOUNCEMENT BAR ──────────────────────────────────────────────── */}
      <div
        className="ann-shimmer"
        style={{ padding: "10px 16px", textAlign: "center" }}
      >
        <p
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: "0.06em",
            color: "var(--brand-cream)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "#E8670A", fontSize: 10 }}>●</span>
          No-cost provider visits for new members · Same-day labs
        </p>
      </div>

      <TRTHeader minimal />

      <main style={{ flex: 1 }}>
        {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
        <section
          id="hero"
          style={{
            background:
              "linear-gradient(135deg, #0B1029 0%, #0D1535 40%, #111B3A 100%)",
            paddingTop: 64,
            paddingBottom: 72,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dot-pattern texture overlay */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              pointerEvents: "none",
            }}
          />
          {/* Orange glow — top-right */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 50% 40% at 90% 0%, rgba(232,103,10,0.18) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="hero-grid"
            style={{
              maxWidth: 1140,
              margin: "0 auto",
              padding: "0 24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 48,
              alignItems: "start",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* LEFT — vial image */}
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                background: "rgba(232,240,252,0.92)",
                minHeight: 520,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 24px 80px rgba(0,0,0,0.40)",
              }}
            >
              <img
                src="/images/trt-vial.png"
                alt="Men's Wellness Centers Testosterone Protocol"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  minHeight: 480,
                  padding: "32px",
                }}
              />
              {/* Virginia's Choice pill */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  background: "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
                  color: "#fff",
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  borderRadius: 999,
                  padding: "8px 18px",
                  boxShadow: "0 4px 16px rgba(232,103,10,0.45)",
                }}
              >
                Virginia's Choice
              </div>
            </div>

            {/* RIGHT — headline + order summary card */}
            <div style={{ paddingTop: 8 }}>
              {/* Headline */}
              <h1
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(40px, 5vw, 64px)",
                  fontWeight: 700,
                  lineHeight: 1.02,
                  letterSpacing: "-0.01em",
                  marginBottom: 28,
                }}
              >
                <span style={{ color: "#fff", display: "block" }}>Be the Man</span>
                <span style={{ color: "#E8670A", display: "block" }}>
                  You Used to Be
                </span>
              </h1>

              {/* Glass-morphism order-summary card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 18,
                  overflow: "hidden",
                  marginBottom: 24,
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(11,16,41,0.60)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#fff",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    What's Included
                  </span>
                </div>

                {(
                  [
                    {
                      icon: <FlaskConical size={18} strokeWidth={1.75} color="#fff" />,
                      title: "Comprehensive Lab Panel",
                      sub: "Full hormone panel drawn on-site",
                      note: "Typically $100–$300 at a lab",
                      value: "Included",
                    },
                    {
                      icon: <Stethoscope size={18} strokeWidth={1.75} color="#fff" />,
                      title: "Provider Consultation",
                      sub: "Private 1-on-1 with a licensed Virginia provider",
                      note: "Typically $150–$300",
                      value: "Included",
                    },
                    {
                      icon: <ClipboardList size={18} strokeWidth={1.75} color="#fff" />,
                      title: "Personalized Treatment Plan",
                      sub: "Results reviewed same-day · Custom protocol",
                      note: "If clinically appropriate",
                      value: "Included",
                    },
                  ] as const
                ).map(({ icon, title, sub, note, value }) => (
                  <div
                    key={title}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "16px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Orange-gradient icon circle */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 4px 12px rgba(232,103,10,0.35)",
                      }}
                    >
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#fff",
                          margin: 0,
                        }}
                      >
                        {title}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.60)",
                          margin: "2px 0 0",
                        }}
                      >
                        {sub}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.38)",
                          margin: "2px 0 0",
                        }}
                      >
                        {note}
                      </p>
                    </div>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--c-success-on-dark)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Check size={13} strokeWidth={3} color="var(--c-success-on-dark)" aria-hidden />
                      {value}
                    </span>
                  </div>
                ))}

                {/* Total row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    background: "rgba(11,16,41,0.80)",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "rgba(255,255,255,0.70)",
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      fontSize: 22,
                      color: "#E8670A",
                    }}
                  >
                    $0 No-cost consultation
                  </span>
                </div>
              </div>

              {/* CTA button */}
              <OrangeCTA
                onClick={goSchedule}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  borderRadius: 999,
                  fontSize: 18,
                  height: 60,
                }}
              >
                Get Started Now <ArrowRight size={18} strokeWidth={2.5} />
              </OrangeCTA>

              {/* Trust badges */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  marginTop: 18,
                  flexWrap: "wrap",
                  opacity: 0.72,
                }}
              >
                <a
                  href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Verify LegitScript Certification"
                >
                  <img
                    src="/images/badges/legitscript-color.png"
                    alt="LegitScript Certified"
                    style={{ height: 44, width: "auto" }}
                    loading="lazy"
                  />
                </a>
                <img
                  src="/images/badges/hipaa-color.webp"
                  alt="HIPAA Compliant"
                  style={{ height: 36, width: "auto" }}
                  loading="lazy"
                />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
                  HIPAA Compliant
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. MEDIA STRIP ───────────────────────────────────────────────── */}
        <section style={{ background: "#fff", padding: "20px 24px", borderBottom: "1px solid #eee" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#E8670A",
                marginRight: 8,
              }}
            >
              As featured in:
            </span>
            {["MEN'S HEALTH", "WEBMD", "SPORTS ILLUSTRATED", "PEOPLE"].map(
              (pub) => (
                <span
                  key={pub}
                  className="media-pill"
                  style={{
                    background: "#fff",
                    border: "1px solid #dde3ef",
                    borderRadius: 999,
                    padding: "8px 18px",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    color: "var(--c-text-on-light)",
                    textTransform: "uppercase" as const,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  }}
                >
                  {pub}
                </span>
              )
            )}
          </div>
        </section>

        {/* ── 3. SYMPTOM HOOK ──────────────────────────────────────────────── */}
        <section
          style={{
            background: "linear-gradient(135deg, #0B1029 0%, #0D1535 50%, #111B3A 100%)",
            padding: "80px 24px",
          }}
        >
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
            <div style={{ marginBottom: 20 }}>
              <Eyebrow pill>SOUND FAMILIAR?</Eyebrow>
            </div>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 12,
                lineHeight: 1.15,
              }}
            >
              Have you noticed a drop in your energy levels?
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 40,
                lineHeight: 1.6,
              }}
            >
              These are the most common signs men come to us with.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 14,
                marginBottom: 40,
                textAlign: "left",
              }}
            >
              {[
                "Tired even after a full night's sleep",
                "Loss of muscle despite consistent workouts",
                "Low sex drive or performance changes",
                "Brain fog or difficulty concentrating",
              ].map((symptom) => (
                <div
                  key={symptom}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: "18px 20px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: "3px solid #E8670A",
                  }}
                >
                  <span style={{ fontSize: 15, color: "rgba(255,255,255,0.88)", fontWeight: 500, lineHeight: 1.5 }}>
                    {symptom}
                  </span>
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: 16,
                color: "rgba(240,220,200,0.60)",
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              If any of these apply, testosterone levels may be the reason.
            </p>
          </div>
        </section>

        {/* ── 3.5 MINI QUIZ ────────────────────────────────────────────────── */}
        <TRTQuiz onNavigateSchedule={goSchedule} />

                <TRTProcessSection onSchedule={goSchedule} />

        <TRTTreatmentOptionsSection onSchedule={goSchedule} />

                <TRTBenefitsSection />

        <TRTSignsSection onSchedule={goSchedule} />

        <TRTProductFAQ />

        <TRTFinalCTASection onSchedule={goSchedule} />
      </main>

      <TRTFooter />
    </div>
  );
};

export default ProductTRT;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, FlaskConical, Stethoscope, ClipboardList,
  Zap, Heart, Smile, Moon, Dumbbell, Scale,
  ChevronDown, ArrowRight,
} from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";

/* ─── CSS keyframe animations ─────────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes shimmerLR {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes floatVial {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
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

  /* Hero vial float */
  .vial-float {
    animation: floatVial 3.5s ease-in-out infinite;
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

/* ─── helpers ──────────────────────────────────────────────────────────────── */

const OrangeCTA = ({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 999,
      padding: "14px 36px",
      fontSize: 16,
      fontWeight: 700,
      fontFamily: "Inter, sans-serif",
      letterSpacing: "0.04em",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 6px 28px rgba(232,103,10,0.45)",
      transition: "box-shadow 0.2s, transform 0.15s",
      ...style,
    }}
    onMouseEnter={(e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      btn.style.boxShadow = "0 10px 36px rgba(232,103,10,0.60)";
      btn.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={(e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      btn.style.boxShadow = "0 6px 28px rgba(232,103,10,0.45)";
      btn.style.transform = "translateY(0)";
    }}
  >
    {children}
  </button>
);

/* Orange-circle Check bullet — used in benefits + treatment cards */
const OrangeBullet = ({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) => (
  <li
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 14,
      fontSize: 15,
      color: light ? "rgba(255,255,255,0.88)" : "#333",
      lineHeight: 1.55,
    }}
  >
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 1,
        boxShadow: "0 2px 8px rgba(232,103,10,0.30)",
      }}
    >
      <Check size={13} strokeWidth={3} color="#fff" aria-hidden />
    </span>
    {children}
  </li>
);

const Eyebrow = ({
  children,
  pill = false,
}: {
  children: React.ReactNode;
  pill?: boolean;
}) =>
  pill ? (
    <span
      style={{
        display: "inline-block",
        background: "rgba(232,103,10,0.18)",
        border: "1px solid rgba(232,103,10,0.40)",
        borderRadius: 999,
        padding: "5px 16px",
        fontFamily: "Oswald, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color: "#E8670A",
        marginBottom: 16,
      }}
    >
      {children}
    </span>
  ) : (
    <p
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color: "var(--brand-cta)",
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );

/* ─── FAQ data ──────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "What is included in the no-cost consultation?",
    a: "Your no-cost consultation includes a face-to-face visit with a licensed Virginia provider, a complete review of your symptoms and health history, and on-site lab work. You'll get your results and a personalized recommendation during the same visit — no waiting, no runaround.",
  },
  {
    q: "What is testosterone replacement therapy (TRT)?",
    a: "Testosterone Replacement Therapy (TRT) is a clinician-supervised treatment that restores testosterone to healthy levels. It's prescribed after lab testing confirms low T and a provider determines you're a good candidate. Common delivery options include injections and topical formulations.",
  },
  {
    q: "Who is a good candidate for TRT?",
    a: "TRT may be appropriate for men experiencing persistent fatigue, reduced sex drive, loss of muscle mass, mood changes, or poor sleep — especially when bloodwork confirms low testosterone. A licensed provider reviews your labs and symptoms before recommending any treatment.",
  },
  {
    q: "Do I need a prescription for testosterone?",
    a: "Yes. Testosterone is a controlled substance and requires a prescription from a licensed provider. At Men's Wellness Centers, your prescribing provider reviews your labs and health history in person before any treatment is considered.",
  },
  {
    q: "What results can I expect from TRT?",
    a: "Men on clinician-supervised TRT commonly report increased energy, improved body composition, better sexual health, sharper mental focus, and improved sleep quality. Individual results vary and depend on your baseline levels and overall health.",
  },
  {
    q: "How soon will I notice improvement?",
    a: "Most patients begin to notice changes within 4–8 weeks. Energy and mood often improve first, followed by body composition and libido over the following months. Your provider monitors your labs regularly and adjusts your protocol as needed.",
  },
];

/* ─── Main component ────────────────────────────────────────────────────────── */

const ProductTRT = () => {
  const navigate = useNavigate();
  const goSchedule = () => navigate("/product/trt/schedule");

  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            color: "#f5f0e8",
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
                className="vial-float"
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
                  padding: "7px 18px",
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
                        color: "#4ade80",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Check size={13} strokeWidth={3} color="#4ade80" aria-hidden />
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
                    padding: "7px 18px",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    color: "#3a4463",
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
                color: "rgba(255,255,255,0.45)",
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

        {/* ── 4. 3-STEP PROCESS ────────────────────────────────────────────── */}
        <section style={{ background: "#fff", padding: "80px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Eyebrow>HOW IT WORKS</Eyebrow>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 700,
                  color: "var(--brand-navy)",
                  lineHeight: 1.15,
                }}
              >
                Simple. In-person. Same Day.
              </h2>
            </div>

            <div
              className="steps-wrapper"
              style={{ position: "relative", marginBottom: 52 }}
            >
              {/* Connecting line — desktop only */}
              <div className="steps-connector" aria-hidden />

              <div
                className="steps-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 24,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {[
                  {
                    num: "1",
                    title: "Medical Intake",
                    desc: "Complete a brief health form online before your visit.",
                  },
                  {
                    num: "2",
                    title: "Meet Your Provider",
                    desc: "Face-to-face with a licensed Virginia provider. Labs drawn on-site.",
                  },
                  {
                    num: "3",
                    title: "Start Treatment",
                    desc: "Results reviewed the same visit. Protocol begins if appropriate.",
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    style={{
                      background: "#fff",
                      borderRadius: 18,
                      padding: "32px 28px 28px",
                      border: "1px solid #e4e9f4",
                      boxShadow: "0 4px 24px rgba(11,16,41,0.07)",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Step number */}
                    <span
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        fontSize: 52,
                        fontWeight: 700,
                        color: "#E8670A",
                        lineHeight: 1,
                        marginBottom: 16,
                        display: "block",
                      }}
                    >
                      {step.num}
                    </span>
                    <h3
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--brand-navy)",
                        marginBottom: 10,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#555",
                        lineHeight: 1.6,
                        margin: "0 0 auto",
                      }}
                    >
                      {step.desc}
                    </p>
                    {/* Bottom orange accent bar */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background:
                          "linear-gradient(90deg, #E8670A 0%, #F07820 100%)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <OrangeCTA onClick={goSchedule} style={{ fontSize: 17, padding: "15px 44px" }}>
                Get Started Now <ArrowRight size={17} strokeWidth={2.5} />
              </OrangeCTA>
            </div>
          </div>
        </section>

        {/* ── 5. TREATMENT OPTIONS ─────────────────────────────────────────── */}
        <section style={{ background: "#F4F6FA", padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 700,
                  color: "var(--brand-navy)",
                  marginBottom: 12,
                }}
              >
                Your Treatment, Personalized
              </h2>
              <p style={{ fontSize: 16, color: "#666", maxWidth: 540, margin: "0 auto" }}>
                Our providers prescribe based on your labs and symptoms — not a
                one-size protocol.
              </p>
            </div>

            <div
              className="treatment-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 28,
              }}
            >
              {/* Card 1: Most Popular — dark navy */}
              <div
                className="treatment-card"
                style={{
                  background:
                    "linear-gradient(145deg, #0B1029 0%, #0e1840 60%, #111B3A 100%)",
                  borderRadius: 20,
                  padding: "36px 32px",
                  borderTop: "3px solid #E8670A",
                  position: "relative",
                  boxShadow: "0 8px 40px rgba(11,16,41,0.28)",
                }}
              >
                {/* Most Popular badge */}
                <span
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    background: "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                    borderRadius: 999,
                    padding: "5px 14px",
                    boxShadow: "0 3px 10px rgba(232,103,10,0.40)",
                  }}
                >
                  MOST POPULAR
                </span>
                <h3
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 24,
                  }}
                >
                  Testosterone Therapy
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
                  {[
                    "Clinician-prescribed, monitored with regular labs",
                    "Multiple delivery options available",
                    "Most patients notice improvements within weeks",
                    "Protocol adjusted based on ongoing labs",
                  ].map((item) => (
                    <OrangeBullet key={item} light>{item}</OrangeBullet>
                  ))}
                </ul>
                <OrangeCTA
                  onClick={goSchedule}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Get Started
                </OrangeCTA>
              </div>

              {/* Card 2: ED Treatment — white */}
              <div
                className="treatment-card"
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: "36px 32px",
                  border: "1px solid #dde3ef",
                  boxShadow: "0 4px 20px rgba(11,16,41,0.06)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--brand-navy)",
                    marginBottom: 24,
                  }}
                >
                  ED Treatment
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
                  {[
                    "FDA-approved oral and injectable options",
                    "Personalized based on labs and history",
                    "Options beyond what online clinics offer",
                    "Private, in-person visit at Virginia locations",
                  ].map((item) => (
                    <OrangeBullet key={item}>{item}</OrangeBullet>
                  ))}
                </ul>
                <OrangeCTA
                  onClick={goSchedule}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    background: "var(--brand-navy)",
                    boxShadow: "0 6px 24px rgba(11,16,41,0.28)",
                  }}
                >
                  Get Started
                </OrangeCTA>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. BENEFITS ──────────────────────────────────────────────────── */}
        <section
          style={{
            background:
              "linear-gradient(135deg, #0B1029 0%, #0D1535 40%, #111B3A 100%)",
            padding: "80px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dot texture */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              pointerEvents: "none",
            }}
          />
          <div
            className="benefits-grid"
            style={{
              maxWidth: 1140,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Left: image with orange glow ring */}
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                minHeight: 460,
                position: "relative",
                boxShadow:
                  "0 0 0 6px rgba(232,103,10,0.20), 0 0 60px rgba(232,103,10,0.15), 0 24px 60px rgba(0,0,0,0.40)",
              }}
            >
              <img
                src="/src/assets/lp/man-athletic-smiling.webp"
                alt="Athletic man smiling, energetic"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  minHeight: 460,
                  display: "block",
                }}
                loading="lazy"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  const parent = el.parentElement;
                  if (parent) {
                    parent.style.background =
                      "linear-gradient(135deg, #1a2448 0%, #0d1535 100%)";
                  }
                }}
              />
            </div>

            {/* Right: benefits */}
            <div>
              <Eyebrow>WHY TRT</Eyebrow>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(28px, 4vw, 46px)",
                  fontWeight: 700,
                  lineHeight: 1.08,
                  marginBottom: 36,
                }}
              >
                <span style={{ color: "#fff", display: "block" }}>
                  Benefits of
                </span>
                <span style={{ color: "#E8670A", display: "block" }}>
                  Testosterone Therapy
                </span>
              </h2>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
                {[
                  "Increased energy and vitality throughout the day",
                  "Improved body composition and muscle retention",
                  "Enhanced sexual health and performance",
                  "Sharper mental clarity and focus",
                  "Better quality sleep",
                  "Improved mood and motivation",
                ].map((benefit) => (
                  <li
                    key={benefit}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 10,
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 2px 8px rgba(232,103,10,0.35)",
                        }}
                      >
                        <Check size={12} strokeWidth={3} color="#fff" aria-hidden />
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          color: "rgba(255,255,255,0.88)",
                          lineHeight: 1.45,
                        }}
                      >
                        {benefit}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 7. SIGNS SECTION ─────────────────────────────────────────────── */}
        <section
          style={{
            background: "var(--brand-navy)",
            padding: "80px 24px",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
            <Eyebrow color="var(--brand-cta)">RECOGNIZE THE SIGNS</Eyebrow>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 12,
                lineHeight: 1.12,
              }}
            >
              You Don't Have to Feel This Way
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 52,
                maxWidth: 480,
                margin: "0 auto 52px",
              }}
            >
              Low testosterone affects more men than you think.
            </p>

            <div
              className="signs-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 52,
                maxWidth: 820,
                margin: "0 auto 52px",
              }}
            >
              {[
                { icon: <Zap size={28} strokeWidth={1.75} color="#E8670A" />, label: "Fatigue" },
                { icon: <Heart size={28} strokeWidth={1.75} color="#E8670A" />, label: "Low Libido" },
                { icon: <Smile size={28} strokeWidth={1.75} color="#E8670A" />, label: "Mood Changes" },
                { icon: <Moon size={28} strokeWidth={1.75} color="#E8670A" />, label: "Poor Sleep" },
                { icon: <Dumbbell size={28} strokeWidth={1.75} color="#E8670A" />, label: "Reduced Strength" },
                { icon: <Scale size={28} strokeWidth={1.75} color="#E8670A" />, label: "Weight Gain" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="sign-tile"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
                    borderRadius: 14,
                    padding: "30px 16px 24px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: 12 }} aria-hidden="true">
                    {icon}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "0.04em",
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Stat callout card */}
            <div
              style={{
                display: "inline-block",
                background: "rgba(232,103,10,0.10)",
                border: "1px solid rgba(232,103,10,0.30)",
                borderRadius: 16,
                padding: "24px 48px",
                marginBottom: 44,
              }}
            >
              <p
                style={{
                  fontSize: 17,
                  color: "rgba(255,255,255,0.85)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Around{" "}
                <span
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 52,
                    fontWeight: 800,
                    color: "#E8670A",
                    display: "block",
                    lineHeight: 1,
                    margin: "4px 0",
                  }}
                >
                  40%
                </span>{" "}
                of men over 45 experience low testosterone symptoms
              </p>
            </div>

            {/* Full-width CTA */}
            <div>
              <OrangeCTA
                onClick={goSchedule}
                style={{
                  fontSize: 18,
                  padding: "17px 64px",
                  width: "100%",
                  maxWidth: 500,
                  justifyContent: "center",
                  boxShadow: "0 8px 36px rgba(232,103,10,0.50)",
                }}
              >
                Get Started Now <ArrowRight size={18} strokeWidth={2.5} />
              </OrangeCTA>
            </div>
          </div>
        </section>

        {/* ── 8. FAQ ───────────────────────────────────────────────────────── */}
        <section style={{ background: "#F4F6FA", padding: "80px 24px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 700,
                color: "var(--brand-navy)",
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              Frequently Asked Questions
            </h2>

            {/* Accordion container card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 4px 30px rgba(11,16,41,0.09)",
                overflow: "hidden",
                border: "1px solid #e4e9f4",
              }}
            >
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = openFaq === i;
                const isLast = i === FAQ_ITEMS.length - 1;
                return (
                  <div
                    key={i}
                    style={{
                      borderBottom: isLast ? "none" : "1px solid #edf0f8",
                    }}
                  >
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{
                        width: "100%",
                        background: isOpen ? "#f5f7ff" : "#fff",
                        border: "none",
                        padding: "22px 28px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        fontFamily: "Inter, sans-serif",
                        transition: "background 0.15s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "var(--brand-navy)",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          color: "#E8670A",
                          transition: "transform 0.22s",
                          transform: isOpen ? "rotate(180deg)" : "none",
                        }}
                      >
                        <ChevronDown size={20} strokeWidth={2} />
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "0 28px 22px 44px",
                          background: "#f5f7ff",
                          fontSize: 15,
                          color: "#444",
                          lineHeight: 1.75,
                          borderLeft: "3px solid #E8670A",
                          marginLeft: 28,
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 9. FINAL CTA BANNER ──────────────────────────────────────────── */}
        <section
          style={{
            background:
              "linear-gradient(135deg, #0B1029 0%, #1a1040 50%, #0B1029 100%)",
            padding: "96px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle star/dot noise texture */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              pointerEvents: "none",
            }}
          />
          {/* Orange corner glows */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 40% 35% at 10% 100%, rgba(232,103,10,0.14) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 90% 0%, rgba(232,103,10,0.14) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}
          >
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(40px, 6vw, 64px)",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 18,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              Start Your Health Journey Today
            </h2>
            <p
              style={{
                fontSize: 19,
                color: "rgba(255,255,255,0.72)",
                marginBottom: 44,
                lineHeight: 1.6,
                maxWidth: 520,
                margin: "0 auto 44px",
              }}
            >
              Virginia's physician-led men's health practice. Same-day labs.
              No-cost consultation.
            </p>
            <OrangeCTA
              onClick={goSchedule}
              style={{
                fontSize: 19,
                padding: "18px 56px",
                boxShadow: "0 8px 40px rgba(232,103,10,0.55)",
              }}
            >
              Get Started Now <ArrowRight size={19} strokeWidth={2.5} />
            </OrangeCTA>
          </div>
        </section>
      </main>

      <TRTFooter />
    </div>
  );
};

export default ProductTRT;

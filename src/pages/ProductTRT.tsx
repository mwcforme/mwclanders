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
      background: "var(--brand-cta)",
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
      transition: "background 0.2s",
      ...style,
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background =
        "var(--brand-cta-hover, #c85a08)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background =
        "var(--brand-cta)";
    }}
  >
    {children}
  </button>
);

const CheckBullet = ({ children }: { children: React.ReactNode }) => (
  <li
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 14,
      fontSize: 15,
      color: "#333",
      lineHeight: 1.55,
    }}
  >
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "var(--brand-cta)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 1,
      }}
    >
      <Check size={13} strokeWidth={3} color="#fff" aria-hidden />
    </span>
    {children}
  </li>
);

const Eyebrow = ({
  children,
  color = "var(--brand-cta)",
}: {
  children: React.ReactNode;
  color?: string;
}) => (
  <p
    style={{
      fontFamily: "Oswald, sans-serif",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase" as const,
      color,
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
        background: "#ffffff",
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

      {/* ── ANNOUNCEMENT BAR ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes shimmerLR {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .announcement-shimmer {
          background: linear-gradient(90deg, #0B1029 0%, #0B1029 35%, #1a2448 50%, #0B1029 65%, #0B1029 100%);
          background-size: 200% auto;
          animation: shimmerLR 3s linear infinite;
        }
        @keyframes floatVial {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .hero-vial-float {
          animation: floatVial 3s ease-in-out infinite;
        }
      `}</style>
      <div
        className="announcement-shimmer"
        style={{
          padding: "9px 16px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: "0.06em",
            color: "#f5f0e8",
            margin: 0,
          }}
        >
          No-cost provider visits for new members · Same-day labs
        </p>
      </div>

      <TRTHeader minimal />

      <main style={{ flex: 1 }}>
        {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
        <section
          id="hero"
          style={{ background: "#ffffff", paddingTop: 64, paddingBottom: 64 }}
        >
          <div
            style={{
              maxWidth: 1140,
              margin: "0 auto",
              padding: "0 24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 48,
              alignItems: "start",
            }}
            className="product-trt-hero-grid"
          >
            {/* LEFT — hero image with "Virginia's Choice" badge */}
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "#e8eef5",
                minHeight: 520,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <img
                src="/images/trt-vial.svg"
                alt="Men's Wellness Centers Testosterone Protocol"
                className="hero-vial-float"
                style={{ width: "100%", height: "100%", objectFit: "contain", minHeight: 480, padding: "32px" }}
              />
              {/* "Virginia's Choice" pill badge overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  background: "var(--brand-cta)",
                  color: "#fff",
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  borderRadius: 999,
                  padding: "7px 18px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
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
                <span style={{ color: "#111", display: "block" }}>Be the Man</span>
                <span style={{ color: "var(--brand-cta)", display: "block" }}>
                  You Were Built to Be
                </span>
              </h1>

              {/* "What's Included" order-summary card */}
              <div
                style={{
                  border: "1px solid #e8e8e8",
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 24,
                  background: "#fff",
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid #e8e8e8",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--brand-navy)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    What's Included
                  </span>
                </div>

                {[
                  {
                    icon: (
                      <FlaskConical
                        size={18}
                        strokeWidth={1.75}
                        color="#fff"
                      />
                    ),
                    title: "Comprehensive Lab Panel",
                    sub: "Full hormone panel drawn on-site",
                    note: "Typically $100–$300 at a lab",
                    value: "Included",
                  },
                  {
                    icon: (
                      <Stethoscope
                        size={18}
                        strokeWidth={1.75}
                        color="#fff"
                      />
                    ),
                    title: "Provider Consultation",
                    sub: "Private 1-on-1 with a licensed Virginia provider",
                    note: "Typically $150–$300",
                    value: "Included",
                  },
                  {
                    icon: (
                      <ClipboardList
                        size={18}
                        strokeWidth={1.75}
                        color="#fff"
                      />
                    ),
                    title: "Personalized Treatment Plan",
                    sub: "Results reviewed same-day · Custom protocol",
                    note: "If clinically appropriate",
                    value: "Included",
                  },
                ].map(({ icon, title, sub, note, value }) => (
                  <div
                    key={title}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "16px 20px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--brand-cta)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#111",
                          margin: 0,
                        }}
                      >
                        {title}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#555",
                          margin: "2px 0 0",
                        }}
                      >
                        {sub}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#999",
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
                        color: "#16a34a",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Check size={13} strokeWidth={3} color="#16a34a" aria-hidden />
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
                    background: "#f8f8f8",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      fontSize: 22,
                      color: "var(--brand-cta)",
                    }}
                  >
                    No-cost consultation
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
                  marginTop: 16,
                  flexWrap: "wrap",
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
                    style={{ height: 48, width: "auto" }}
                    loading="lazy"
                  />
                </a>
                <img
                  src="/images/badges/hipaa-color.webp"
                  alt="HIPAA Compliant"
                  style={{ height: 40, width: "auto" }}
                  loading="lazy"
                />
                <span
                  style={{ fontSize: 12, color: "#888", fontWeight: 600 }}
                >
                  HIPAA Compliant
                </span>
              </div>
            </div>
          </div>

          {/* Mobile-responsive style */}
          <style>{`
            @media (max-width: 768px) {
              .product-trt-hero-grid {
                grid-template-columns: 1fr !important;
                gap: 32px !important;
              }
            }
          `}</style>
        </section>

        {/* ── 2. MEDIA STRIP ───────────────────────────────────────────────── */}
        <section style={{ background: "#f4f4f4", padding: "20px 24px" }}>
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
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#888",
                marginRight: 8,
              }}
            >
              As featured in:
            </span>
            {["MEN'S HEALTH", "WEBMD", "SPORTS ILLUSTRATED", "PEOPLE"].map(
              (pub) => (
                <span
                  key={pub}
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 999,
                    padding: "6px 16px",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    color: "#444",
                    textTransform: "uppercase" as const,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  {pub}
                </span>
              )
            )}
          </div>
        </section>

        {/* ── 3. SYMPTOM HOOK ──────────────────────────────────────────────── */}
        <section style={{ background: "#ffffff", padding: "72px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <Eyebrow>SOUND FAMILIAR?</Eyebrow>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 700,
                color: "var(--brand-navy)",
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              Have you noticed a drop in your energy levels?
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#777",
                marginBottom: 36,
              }}
            >
              These are the most common signs men come to us with.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
                marginBottom: 36,
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
                    gap: 12,
                    background: "#fafafa",
                    borderRadius: 10,
                    padding: "14px 18px",
                    border: "1px solid #ebebeb",
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: "2px solid var(--brand-cta)",
                      flexShrink: 0,
                      marginTop: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(232,103,10,0.10)",
                    }}
                    aria-hidden="true"
                  >
                    <Check
                      size={11}
                      strokeWidth={3}
                      color="var(--brand-cta)"
                    />
                  </span>
                  <span style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>
                    {symptom}
                  </span>
                </div>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #ebebeb", marginBottom: 24 }} />
            <p
              style={{
                fontSize: 16,
                color: "#777",
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              If any of these apply, testosterone levels may be the reason.
            </p>
          </div>
        </section>

        {/* ── 4. 3-STEP PROCESS ────────────────────────────────────────────── */}
        <section style={{ background: "#f4f4f4", padding: "72px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Eyebrow>HOW IT WORKS</Eyebrow>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(26px, 4vw, 42px)",
                  fontWeight: 700,
                  color: "var(--brand-navy)",
                  lineHeight: 1.15,
                }}
              >
                Simple. In-person. Same Day.
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 24,
                marginBottom: 48,
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
                    borderRadius: 16,
                    padding: "32px 28px",
                    border: "1px solid #e4e4e4",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--brand-cta)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 800,
                      fontFamily: "Oswald, sans-serif",
                      marginBottom: 20,
                    }}
                  >
                    {step.num}
                  </div>
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
                  <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <OrangeCTA onClick={goSchedule} style={{ fontSize: 17, padding: "15px 40px" }}>
                Get Started Now <ArrowRight size={17} strokeWidth={2.5} />
              </OrangeCTA>
            </div>
          </div>
        </section>

        {/* ── 5. TREATMENT OPTIONS ─────────────────────────────────────────── */}
        <section style={{ background: "#ffffff", padding: "72px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(26px, 4vw, 42px)",
                  fontWeight: 700,
                  color: "var(--brand-navy)",
                  marginBottom: 12,
                }}
              >
                Your Treatment, Personalized
              </h2>
              <p style={{ fontSize: 16, color: "#666", maxWidth: 560, margin: "0 auto" }}>
                Our providers prescribe based on your labs and symptoms — not a
                one-size protocol.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {/* Card 1: Testosterone Therapy — "Most Popular" top-right */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "32px 28px",
                  border: "2px solid var(--brand-cta)",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    background: "var(--brand-cta)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    borderRadius: 999,
                    padding: "4px 12px",
                  }}
                >
                  Most Popular
                </span>
                <h3
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "var(--brand-navy)",
                    marginBottom: 20,
                  }}
                >
                  Testosterone Therapy
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                  {[
                    "Clinician-prescribed, monitored with regular labs",
                    "Multiple delivery options available",
                    "Most patients notice improvements within weeks",
                    "Protocol adjusted based on ongoing labs",
                  ].map((item) => (
                    <CheckBullet key={item}>{item}</CheckBullet>
                  ))}
                </ul>
                <OrangeCTA
                  onClick={goSchedule}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Get Started
                </OrangeCTA>
              </div>

              {/* Card 2: ED Treatment */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "32px 28px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "var(--brand-navy)",
                    marginBottom: 20,
                  }}
                >
                  ED Treatment
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                  {[
                    "FDA-approved oral and injectable options",
                    "Personalized based on labs and history",
                    "Options beyond what online clinics offer",
                    "Private, in-person visit at Virginia locations",
                  ].map((item) => (
                    <CheckBullet key={item}>{item}</CheckBullet>
                  ))}
                </ul>
                <OrangeCTA
                  onClick={goSchedule}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    background: "var(--brand-navy)",
                  }}
                >
                  Get Started
                </OrangeCTA>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. BENEFITS ──────────────────────────────────────────────────── */}
        <section style={{ background: "#ffffff", padding: "72px 24px", borderTop: "1px solid #f0f0f0" }}>
          <div
            style={{
              maxWidth: 1140,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 56,
              alignItems: "center",
            }}
            className="product-trt-benefits-grid"
          >
            {/* Left: image */}
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "#e8eef5",
                minHeight: 460,
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
                      "linear-gradient(135deg, #d0dae8 0%, #b0c0d4 100%)";
                  }
                }}
              />
            </div>

            {/* Right: benefits list */}
            <div>
              <Eyebrow>WHY TRT</Eyebrow>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(26px, 4vw, 42px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: 32,
                }}
              >
                <span style={{ color: "var(--brand-navy)", display: "block" }}>
                  Benefits of
                </span>
                <span style={{ color: "var(--brand-cta)", display: "block" }}>
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
                  <CheckBullet key={benefit}>{benefit}</CheckBullet>
                ))}
              </ul>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .product-trt-benefits-grid {
                grid-template-columns: 1fr !important;
                gap: 32px !important;
              }
            }
          `}</style>
        </section>

        {/* ── 7. SIGNS SECTION ─────────────────────────────────────────────── */}
        <section
          style={{
            background: "var(--brand-navy)",
            padding: "72px 24px",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
            <Eyebrow color="var(--brand-cta)">RECOGNIZE THE SIGNS</Eyebrow>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(26px, 4vw, 44px)",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 12,
                lineHeight: 1.15,
              }}
            >
              You Don't Have to Feel This Way
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 48,
                maxWidth: 520,
                margin: "0 auto 48px",
              }}
            >
              Low testosterone affects more men than you think.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 52,
                maxWidth: 780,
                margin: "0 auto 52px",
              }}
              className="product-trt-signs-grid"
            >
              {[
                { icon: <Zap size={26} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Fatigue" },
                { icon: <Heart size={26} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Low Libido" },
                { icon: <Smile size={26} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Mood Changes" },
                { icon: <Moon size={26} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Poor Sleep" },
                { icon: <Dumbbell size={26} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Reduced Strength" },
                { icon: <Scale size={26} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Weight Gain" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    padding: "28px 16px 22px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: 10 }} aria-hidden="true">
                    {icon}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "0.04em",
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Stat callout */}
            <p
              style={{
                fontSize: 17,
                color: "rgba(255,255,255,0.85)",
                marginBottom: 40,
                lineHeight: 1.6,
              }}
            >
              Around{" "}
              <span
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "var(--brand-cta)",
                }}
              >
                40%
              </span>{" "}
              of men over 45 experience low testosterone symptoms
            </p>

            <OrangeCTA
              onClick={goSchedule}
              style={{ fontSize: 17, padding: "15px 48px" }}
            >
              Get Started Now <ArrowRight size={17} strokeWidth={2.5} />
            </OrangeCTA>
          </div>

          <style>{`
            @media (max-width: 600px) {
              .product-trt-signs-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }
          `}</style>
        </section>

        {/* ── 8. FAQ ───────────────────────────────────────────────────────── */}
        <section style={{ background: "#ffffff", padding: "72px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 700,
                color: "var(--brand-navy)",
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              Frequently Asked Questions
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #e8e8e8",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{
                        width: "100%",
                        background: isOpen ? "#f8f8f8" : "#fff",
                        border: "none",
                        padding: "20px 24px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        fontFamily: "Inter, sans-serif",
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
                          color: "var(--brand-cta)",
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(180deg)" : "none",
                        }}
                      >
                        <ChevronDown size={20} strokeWidth={2} />
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "0 24px 20px",
                          background: "#f8f8f8",
                          fontSize: 15,
                          color: "#444",
                          lineHeight: 1.7,
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
            background: "var(--brand-navy)",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 16,
                lineHeight: 1.1,
              }}
            >
              Start Your Health Journey Today
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "rgba(255,255,255,0.65)",
                marginBottom: 36,
                lineHeight: 1.6,
              }}
            >
              Virginia's physician-led men's health practice. Same-day labs.
              No-cost consultation.
            </p>
            <OrangeCTA
              onClick={goSchedule}
              style={{ fontSize: 18, padding: "16px 48px" }}
            >
              Get Started Now <ArrowRight size={18} strokeWidth={2.5} />
            </OrangeCTA>
          </div>
        </section>
      </main>

      <TRTFooter />
    </div>
  );
};

export default ProductTRT;

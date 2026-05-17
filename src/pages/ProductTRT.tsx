import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, FlaskConical, Stethoscope, ClipboardList,
  Zap, Heart, Smile, Moon, Dumbbell, Scale,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { COPY } from "@/data/copy";
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
      display: "inline-block",
      transition: "background 0.2s",
      ...style,
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background =
        "var(--brand-cta-hover)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background =
        "var(--brand-cta)";
    }}
  >
    {children}
  </button>
);

const CheckIcon = () => (
  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--brand-cta)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Check size={13} strokeWidth={3} color="#fff" aria-hidden />
  </span>
);

/* ─── FAQ data ──────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "What is included in the no-cost consultation?",
    a: "Your no-cost consultation includes a face-to-face visit with a licensed Virginia provider, a complete review of your symptoms and health history, and on-site lab work. You'll get your results and a personalized recommendation during the same visit — no waiting, no runaround.",
  },
  {
    q: "What is TRT?",
    a: "Testosterone Replacement Therapy (TRT) is a clinician-supervised treatment that restores testosterone to healthy levels. It's prescribed after lab testing confirms low T and a provider determines you're a good candidate. Common delivery options include injections and topical formulations.",
  },
  {
    q: "Who needs TRT?",
    a: "TRT may be appropriate for men experiencing persistent fatigue, reduced sex drive, loss of muscle mass, mood changes, or poor sleep — especially when bloodwork confirms low testosterone. A licensed provider reviews your labs and symptoms before recommending any treatment.",
  },
  {
    q: "Do I need a prescription for testosterone?",
    a: "Yes. Testosterone is a controlled substance and requires a prescription from a licensed provider. At Men's Wellness Centers, your prescribing provider reviews your labs and health history in person before any treatment is considered.",
  },
  {
    q: "What are the benefits of testosterone replacement therapy?",
    a: "Men on clinician-supervised TRT commonly report increased energy, improved body composition, better sexual health, sharper mental focus, and improved sleep quality. Individual results vary and depend on your baseline levels and overall health.",
  },
  {
    q: "How long before I notice improvement with TRT?",
    a: "Most patients begin to notice changes within 4–8 weeks. Energy and mood often improve first, followed by body composition and libido over the following months. Your provider monitors your labs regularly and adjusts your protocol as needed.",
  },
];

/* ─── Main component ────────────────────────────────────────────────────────── */

const ProductTRT = () => {
  const navigate = useNavigate();
  const goBook = () => navigate("/book/location");

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

      <TRTHeader minimal />

      <main style={{ flex: 1 }}>
        {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
        <section
          id="hero"
          style={{ background: "#ffffff", paddingTop: 88, paddingBottom: 64 }}
        >
          <div style={{
            maxWidth: 1140,
            margin: "0 auto",
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "start",
          }}
          className="grid-cols-1 lg:grid-cols-2"
          >
            {/* LEFT — large product/service image */}
            <div style={{
              borderRadius: 16,
              overflow: "hidden",
              background: "#f0f4ff",
              minHeight: 480,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <img
                src="/src/assets/lp/onsite-labs-centrifuge.webp"
                alt="Men's Wellness Centers on-site lab"
                style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 480 }}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  const parent = el.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:48px"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#E8670A" stroke-width="1.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg><p style="font-family:Oswald,sans-serif;font-size:20px;color:#0B1029;font-weight:700;text-align:center">On-Site Labs<br/>Same-Day Results</p></div>`;
                  }
                }}
              />
            </div>

            {/* RIGHT — headline + order summary card */}
            <div style={{ paddingTop: 8 }}>
              {/* Headline — matches MangoRx 2-line with orange second line */}
              <h1 style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(36px, 5vw, 60px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                marginBottom: 28,
              }}>
                <span style={{ color: "var(--brand-navy)", display: "block" }}>Be the Man</span>
                <span style={{ color: "var(--brand-cta)", display: "block" }}>You Were Built to Be</span>
              </h1>

              {/* Order Summary card — MangoRx pattern */}
              <div style={{
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 24,
              }}>
                <div style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #e8e8e8",
                  background: "#fafafa",
                }}>
                  <span style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--brand-navy)",
                    letterSpacing: "0.04em",
                  }}>
                    What's Included
                  </span>
                </div>

                {[
                  {
                    icon: <FlaskConical size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />,
                    title: "Comprehensive Lab Panel",
                    sub: "Full hormone panel drawn on-site",
                    note: "Typically $100–$300",
                    value: "Included",
                  },
                  {
                    icon: <Stethoscope size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />,
                    title: "Provider Consultation",
                    sub: "Private 1-on-1 with a licensed Virginia provider",
                    note: "Typically $150–$300",
                    value: "Included",
                  },
                  {
                    icon: <ClipboardList size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />,
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
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "rgba(232,103,10,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#111", margin: 0 }}>{title}</p>
                      <p style={{ fontSize: 12, color: "#555", margin: "2px 0 0" }}>{sub}</p>
                      <p style={{ fontSize: 11, color: "#999", margin: "1px 0 0" }}>{note}</p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#16a34a", flexShrink: 0 }}>{value}</span>
                  </div>
                ))}

                {/* Total row */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "#fafafa",
                }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Total</span>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--brand-cta)" }}>
                    No-cost consultation
                  </span>
                </div>
              </div>

              {/* CTA */}
              <OrangeCTA onClick={goBook} style={{ width: "100%", textAlign: "center", borderRadius: 999, fontSize: 18, height: 60 }}>
                Get Started Now
              </OrangeCTA>

              {/* Trust badges */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                <a
                  href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Verify LegitScript Certification"
                >
                  <img src="/images/badges/legitscript-color.png" alt="LegitScript Certified" style={{ height: 48, width: "auto" }} loading="lazy" />
                </a>
                <img src="/images/badges/hipaa-color.webp" alt="HIPAA Compliant" style={{ height: 40, width: "auto" }} loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. MEDIA STRIP ───────────────────────────────────────────────── */}
        <section
          style={{
            background: "#f4f4f4",
            padding: "20px 24px",
          }}
        >
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
              As seen in:
            </span>
            {["MEN'S HEALTH", "PEOPLE", "SPORTS ILLUSTRATED", "WEBMD"].map((pub) => (
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
                }}
              >
                {pub}
              </span>
            ))}
          </div>
        </section>

        {/* ── 3. SYMPTOM HOOK ──────────────────────────────────────────────── */}
        <section
          style={{
            background: "#ffffff",
            padding: "72px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 700,
                color: "var(--brand-navy)",
                marginBottom: 36,
                lineHeight: 1.2,
              }}
            >
              Have you noticed a drop in your energy levels?
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 32,
                textAlign: "left",
              }}
            >
              {[
                "Tired even after sleeping",
                "Loss of muscle despite working out",
                "Low sex drive",
                "Brain fog",
              ].map((symptom) => (
                <div
                  key={symptom}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#f8f8f8",
                    borderRadius: 10,
                    padding: "14px 18px",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: "2px solid var(--brand-cta)",
                      flexShrink: 0,
                      background: "rgba(232,103,10,0.08)",
                    }}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>{symptom}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 17, color: "#555", lineHeight: 1.6 }}>
              If any of these sound familiar, you may have low testosterone.
            </p>
          </div>
        </section>

        {/* ── 4. 3-STEP PROCESS ────────────────────────────────────────────── */}
        <section
          style={{
            background: "#ffffff",
            padding: "72px 24px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
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
              How It Works
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 24,
              }}
            >
              {[
                {
                  num: "1",
                  title: "Complete Medical Intake",
                  desc: "Answer a few health questions online before your visit.",
                },
                {
                  num: "2",
                  title: "Meet Your Provider",
                  desc: "Sit down with a licensed Virginia provider. Labs drawn on-site.",
                },
                {
                  num: "3",
                  title: "Start Treatment",
                  desc: "If appropriate, begin your personalized protocol the same day.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  style={{
                    background: "#f8f8f8",
                    borderRadius: 16,
                    padding: "32px 28px",
                    border: "1px solid #e8e8e8",
                    position: "relative",
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
                  <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. TREATMENT OPTIONS ─────────────────────────────────────────── */}
        <section
          style={{
            background: "#f8f8f8",
            padding: "72px 24px",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
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
              Treatment Options
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {/* Card 1: Testosterone Therapy */}
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
                    top: -14,
                    left: 28,
                    background: "var(--brand-cta)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    borderRadius: 999,
                    padding: "4px 14px",
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
                    marginTop: 8,
                  }}
                >
                  Testosterone Therapy
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[
                    "Most common treatment for low T",
                    "Clinician-prescribed, multiple delivery options",
                    "Monitored with regular labs",
                    "Most patients notice changes within weeks",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 12,
                        fontSize: 15,
                        color: "#333",
                        lineHeight: 1.5,
                      }}
                    >
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 24 }}>
                  <OrangeCTA onClick={goBook} style={{ width: "100%", textAlign: "center" }}>
                    {COPY.cta.bookConsult}
                  </OrangeCTA>
                </div>
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
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[
                    "FDA-approved oral and injectable options",
                    "Personalized protocol based on labs and history",
                    "Private, in-person visit",
                    "Options beyond what online clinics offer",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 12,
                        fontSize: 15,
                        color: "#333",
                        lineHeight: 1.5,
                      }}
                    >
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 24 }}>
                  <OrangeCTA onClick={goBook} style={{ width: "100%", textAlign: "center", background: "var(--brand-navy)" }}>
                    {COPY.cta.bookConsult}
                  </OrangeCTA>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. BENEFITS SECTION ──────────────────────────────────────────── */}
        <section
          style={{
            background: "#ffffff",
            padding: "72px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 56,
              alignItems: "center",
            }}
          >
            {/* Left: image */}
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "#f0f0f0",
                minHeight: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/src/assets/lp/man-gym-confident.webp"
                alt="Man at gym, confident and fit"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="lazy"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  const parent = el.parentElement;
                  if (parent) {
                    parent.style.background = "linear-gradient(135deg, #e8e8e8 0%, #ccc 100%)";
                    parent.style.display="flex"; parent.style.alignItems="center"; parent.style.justifyContent="center";
                  }
                }}
              />
            </div>

            {/* Right: benefits list */}
            <div>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 700,
                  color: "var(--brand-navy)",
                  marginBottom: 32,
                  lineHeight: 1.2,
                }}
              >
                Benefits of{" "}
                <span style={{ color: "var(--brand-cta)" }}>Testosterone</span>{" "}
                Replacement Therapy
              </h2>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
                {[
                  "Increased energy & vitality",
                  "Improved body composition",
                  "Sexual health & performance",
                  "Mental clarity & focus",
                  "Better sleep quality",
                ].map((benefit) => (
                  <li
                    key={benefit}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 16,
                      fontSize: 17,
                      color: "#222",
                      fontWeight: 500,
                    }}
                  >
                    <CheckIcon />
                    {benefit}
                  </li>
                ))}
              </ul>

              <OrangeCTA onClick={goBook}>Learn If You Qualify</OrangeCTA>
            </div>
          </div>
        </section>

        {/* ── 7. SIGNS SECTION ─────────────────────────────────────────────── */}
        <section
          style={{
            background: "#f8f8f8",
            padding: "72px 24px",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 700,
                color: "var(--brand-navy)",
                marginBottom: 12,
              }}
            >
              You Don't Have to Feel This Way
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "#555",
                marginBottom: 48,
                lineHeight: 1.6,
                maxWidth: 600,
                margin: "0 auto 48px",
              }}
            >
              If you're struggling with any of these symptoms, testosterone therapy may help.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 16,
                marginBottom: 48,
              }}
            >
              {[
                { icon: <Zap size={24} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, label: "Fatigue" },
                { icon: <Heart size={24} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, label: "Low Libido" },
                { icon: <Smile size={24} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, label: "Mood Changes" },
                { icon: <Moon size={24} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, label: "Poor Sleep" },
                { icon: <Dumbbell size={24} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, label: "Reduced Strength" },
                { icon: <Scale size={24} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, label: "Weight Gain" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "24px 16px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }} aria-hidden="true">
                    {icon}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--brand-navy)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Stat callout */}
            <div
              style={{
                background: "var(--brand-navy)",
                borderRadius: 16,
                padding: "28px 32px",
                maxWidth: 640,
                margin: "0 auto 40px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 52,
                  fontWeight: 800,
                  color: "var(--brand-cta)",
                  lineHeight: 1,
                }}
              >
                ~40%
              </span>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 16,
                  lineHeight: 1.5,
                  maxWidth: 340,
                  textAlign: "left",
                }}
              >
                of men over 45 experience low testosterone symptoms
              </p>
            </div>

            <OrangeCTA onClick={goBook}>Check My Levels Today</OrangeCTA>
          </div>
        </section>

        {/* ── 8. FAQ ───────────────────────────────────────────────────────── */}
        <section
          style={{
            background: "#ffffff",
            padding: "72px 24px",
          }}
        >
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
                        style={{ flexShrink: 0, color: "var(--brand-cta)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}
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
                color: "rgba(255,255,255,0.75)",
                marginBottom: 36,
                lineHeight: 1.6,
              }}
            >
              Virginia's physician-led men's health practice since 2015.
            </p>
            <OrangeCTA onClick={goBook} style={{ fontSize: 18, padding: "16px 48px" }}>
              {COPY.cta.bookConsult}
            </OrangeCTA>
          </div>
        </section>
      </main>

      <TRTFooter />
    </div>
  );
};

export default ProductTRT;

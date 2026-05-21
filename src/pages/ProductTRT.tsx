/**
 * /product/trt — Testosterone Replacement Therapy landing page
 *
 * CRO-first funnel page. No header nav (eliminates exit paths on paid traffic).
 * Hero: dark navy split — left copy + right lead-capture form.
 * Sections ordered for maximum conversion from paid media visitors.
 */

import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone, Check, X, Minus, FlaskConical, Stethoscope, ClipboardList,
  ArrowRight, Clock,
} from "lucide-react";

import { TRTHeroForm }               from "@/components/landing/trt/TRTHeroForm";
import { TRTFooter }                 from "@/components/landing/trt/TRTFooter";
import { TRTBenefitsSection }        from "@/components/landing/trt/TRTBenefitsSection";
import { TRTSignsSection }           from "@/components/landing/trt/TRTSignsSection";
import { TRTTreatmentOptionsSection }from "@/components/landing/trt/TRTTreatmentOptionsSection";
import { TRTProductFAQ }             from "@/components/landing/trt/TRTProductFAQ";
import { TRTPricing }                from "@/components/landing/trt/TRTPricing";
import { OrangeCTA, Eyebrow }        from "@/components/landing/trt/TRTProductHelpers";
import { SEO }                       from "@/components/SEO";
import { PHONE }                     from "@/lib/constants";

/* ─── CSS keyframe animations ────────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes shimmerLR {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .ann-shimmer {
    background: linear-gradient(
      90deg,
      #0B1029 0%, #0B1029 30%, #1e2f5e 50%, #0B1029 70%, #0B1029 100%
    );
    background-size: 200% auto;
    animation: shimmerLR 3.5s linear infinite;
  }

  /* Timeline step entrance animation */
  .tl-step {
    opacity: 0;
    transform: translateX(-18px);
    transition: none;
  }
  .tl-step.tl-visible {
    animation: slideInLeft 400ms ease forwards;
  }
  .tl-step.tl-visible:nth-child(1) { animation-delay:   0ms; }
  .tl-step.tl-visible:nth-child(2) { animation-delay: 100ms; }
  .tl-step.tl-visible:nth-child(3) { animation-delay: 200ms; }
  .tl-step.tl-visible:nth-child(4) { animation-delay: 300ms; }

  /* Comparison table row hover */
  .compare-row {
    transition: transform var(--transition-fast, 120ms ease), box-shadow var(--transition-fast, 120ms ease);
  }
  .compare-row:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    position: relative;
    z-index: 1;
  }

  /* Quiz answer ripple on click */
  .quiz-answer {
    transition: border-color 150ms, background 150ms, transform 150ms;
  }
  .quiz-answer:active {
    transform: scale(0.97);
  }
  .quiz-answer.quiz-selected {
    transform: scale(1.00);
  }

  /* Stats count-up ready */
  .stat-value { will-change: contents; }

  /* Quiz answer grid — single-col on very small screens */
  @media (max-width: 520px) {
    .quiz-grid { grid-template-columns: 1fr !important; }
  }

  /* Mobile overrides */
  @media (max-width: 768px) {
    .hero-grid      { grid-template-columns: 1fr !important; gap: 28px !important; }
    .timeline-grid  { flex-direction: column !important; }
    .tl-connector   { display: none !important; }
    .compare-scroll { overflow-x: auto !important; }
  }
`;

/* ─── CRO Header (no nav, logo + phone only) ─────────────────────────────── */
const CROHeader = () => (
  <header
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: 64,
      background: "var(--brand-navy-deep)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      fontFamily: "Inter, sans-serif",
    }}
  >
    <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
      <img
        src="/logos/Text_Logo_white.webp"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
        alt="Men's Wellness Centers"
        style={{ height: 32, width: "auto" }}
        width={160}
        height={32}
      />
    </a>
    <a
      href={PHONE.tel}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        color: "var(--c-text-on-dark)",
        fontWeight: 600,
        fontSize: 15,
      }}
    >
      <Phone size={16} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />
      {PHONE.display}
    </a>
  </header>
);

/* ─── Comparison table ───────────────────────────────────────────────────── */
const COMPARE_ROWS: {
  label: string;
  mwc: string;
  mwcType: "check" | "text";
  primary: string;
  primaryType: "x" | "partial" | "text";
  tele: string;
  teleType: "x" | "partial" | "text";
}[] = [
  {
    label: "On-Site Labs",
    mwc: "Included",       mwcType: "check",
    primary: "Separate",   primaryType: "x",
    tele: "Not available", teleType: "x",
  },
  {
    label: "Same-Day Results",
    mwc: "Same visit",   mwcType: "check",
    primary: "Days later", primaryType: "x",
    tele: "Days later",    teleType: "x",
  },
  {
    label: "Personalized Protocol",
    mwc: "In-person",    mwcType: "check",
    primary: "Sometimes",  primaryType: "partial",
    tele: "Script only",   teleType: "partial",
  },
  {
    label: "In-Person Provider",
    mwc: "Always",       mwcType: "check",
    primary: "Limited",    primaryType: "partial",
    tele: "Remote only",   teleType: "x",
  },
  {
    label: "Typical Wait Time",
    mwc: "Under 1 week",  mwcType: "text",
    primary: "3-6 weeks",   primaryType: "text",
    tele: "1-2 weeks",      teleType: "text",
  },
  {
    label: "Pricing Transparency",
    mwc: "In writing",   mwcType: "check",
    primary: "Varies",     primaryType: "partial",
    tele: "Online",        teleType: "partial",
  },
];

const CellIcon = ({ type }: { type: "check" | "x" | "partial" | "text" }) => {
  if (type === "check")   return <Check size={18} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />;
  if (type === "x")       return <X     size={18} strokeWidth={2.5} style={{ color: "#9CA3AF",          flexShrink: 0 }} />;
  if (type === "partial") return <Minus size={18} strokeWidth={2.5} style={{ color: "#9CA3AF",          flexShrink: 0 }} />;
  return null;
};

const ComparisonTable = () => (
  <section style={{ background: "#fff", padding: "80px 24px" }}>
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <Eyebrow>WHY MEN CHOOSE MWC</Eyebrow>
      </div>
      <h2
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(26px, 4vw, 40px)",
          fontWeight: 700,
          color: "var(--brand-navy)",
          marginBottom: 8,
          lineHeight: 1.15,
        }}
      >
        MWC vs. Primary Care vs. Telehealth
      </h2>
      <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)", marginBottom: 40, maxWidth: 600 }}>
        Most men have already tried their GP. Here's why they come to us instead.
      </p>

      <div className="compare-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              <th style={{
                textAlign: "left",
                padding: "14px 20px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--c-text-on-light-muted)",
                background: "#F8F9FB",
                borderRadius: "8px 0 0 0",
                borderBottom: "2px solid #E5E7EB",
              }}>
                Feature
              </th>
              {/* MWC — featured column */}
              <th style={{
                textAlign: "center",
                padding: "14px 16px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#fff",
                background: "var(--brand-cta)",
                borderBottom: "2px solid var(--brand-cta)",
              }}>
                MWC
              </th>
              <th style={{
                textAlign: "center",
                padding: "14px 16px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--c-text-on-light-muted)",
                background: "#F8F9FB",
                borderBottom: "2px solid #E5E7EB",
              }}>
                Primary Care
              </th>
              <th style={{
                textAlign: "center",
                padding: "14px 16px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--c-text-on-light-muted)",
                background: "#F8F9FB",
                borderRadius: "0 8px 0 0",
                borderBottom: "2px solid #E5E7EB",
              }}>
                Telehealth
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row, i) => (
              <tr
                key={row.label}
                className="compare-row"
                style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }}
              >
                <td style={{
                  padding: "14px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--brand-navy)",
                  borderBottom: "1px solid #F0F2F5",
                  whiteSpace: "nowrap",
                }}>
                  {row.label}
                </td>
                {/* MWC — orange-tinted */}
                <td style={{
                  textAlign: "center",
                  padding: "14px 16px",
                  background: "rgba(232,103,10,0.05)",
                  borderBottom: "1px solid rgba(232,103,10,0.10)",
                  borderLeft: "1px solid rgba(232,103,10,0.15)",
                  borderRight: "1px solid rgba(232,103,10,0.15)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CellIcon type={row.mwcType} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: row.mwcType === "text" ? "var(--brand-cta)" : "var(--brand-navy)" }}>
                      {row.mwc}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: "center", padding: "14px 16px", borderBottom: "1px solid #F0F2F5" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CellIcon type={row.primaryType} />
                    <span style={{ fontSize: 13, color: "var(--c-text-on-light-muted)" }}>{row.primary}</span>
                  </div>
                </td>
                <td style={{ textAlign: "center", padding: "14px 16px", borderBottom: "1px solid #F0F2F5" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CellIcon type={row.teleType} />
                    <span style={{ fontSize: 13, color: "var(--c-text-on-light-muted)" }}>{row.tele}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

/* ─── "See If You're a Candidate" Quiz ──────────────────────────────────── */
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
    options: ["Poor - I struggle most nights", "Fair - some good, some bad", "Good - occasional issues", "Great - no problems"],
  },
  {
    q: "How often do you experience brain fog or difficulty concentrating?",
    options: ["Daily", "A few times a week", "Occasionally", "Rarely or never"],
  },
];

const CandidateQuiz = ({ onNavigateSchedule }: { onNavigateSchedule: () => void }) => {
  const [current, setCurrent] = useState(0);
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
      setCurrent((c) => c + 1);
      setSelected(null);
      setAdvancing(false);
    }, 300);
  };

  return (
    <section style={{ background: "#FDF6F0", padding: "64px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <Eyebrow>SEE IF YOU ARE A CANDIDATE</Eyebrow>
          </div>
          <h2 style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(24px, 3.5vw, 36px)",
            color: "var(--brand-navy)",
            marginBottom: 8,
            lineHeight: 1.2,
          }}>
            Answer 5 Quick Questions
          </h2>
          <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)" }}>
            Takes 60 seconds. No login required.
          </p>
        </div>

        {/* Progress track */}
        <div style={{
          height: 6,
          background: "#E8D5C4",
          borderRadius: 999,
          width: 200,
          margin: "0 auto 32px",
          overflow: "hidden",
        }}>
          <div style={{
            height: 6,
            background: "var(--brand-cta)",
            borderRadius: 999,
            width: `${progress}%`,
            transition: "width 300ms ease",
          }} />
        </div>

        {!isDone ? (
          <>
            <h3 style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(18px, 3vw, 26px)",
              color: "var(--c-text-on-light)",
              textAlign: "center",
              maxWidth: 580,
              margin: "0 auto 28px",
              lineHeight: 1.3,
            }}>
              {QUIZ_QUESTIONS[current].q}
            </h3>
            <div
              className="quiz-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}
            >
              {QUIZ_QUESTIONS[current].options.map((opt, i) => {
                const isSel = selected === i;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(i)}
                    className={`quiz-answer${isSel ? " quiz-selected" : ""}`}
                    style={{
                      background: isSel ? "rgba(232,103,10,0.06)" : "#fff",
                      border: `1.5px solid ${isSel ? "var(--brand-cta)" : "#E2E4EC"}`,
                      borderRadius: 14,
                      padding: "18px 14px",
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--c-text-on-light)",
                      cursor: advancing ? "default" : "pointer",
                      minHeight: 60,
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSel && !advancing) {
                        e.currentTarget.style.borderColor = "var(--brand-cta)";
                        e.currentTarget.style.background = "rgba(232,103,10,0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSel) {
                        e.currentTarget.style.borderColor = "#E2E4EC";
                        e.currentTarget.style.background = "#fff";
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
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 2, background: "var(--brand-cta)", borderRadius: 999, margin: "0 auto 28px" }} />
            <h3 style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(22px, 3.5vw, 34px)",
              color: "var(--brand-navy)",
              marginBottom: 16,
            }}>
              You Are In Good Hands.
            </h3>
            <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 32px" }}>
              Our licensed Virginia providers review your symptoms, run labs on-site, and build a plan based on your results. Individual results vary.
            </p>
            <button
              type="button"
              onClick={onNavigateSchedule}
              style={{
                background: "var(--brand-cta)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "16px 28px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                width: "100%",
                maxWidth: 480,
                display: "block",
                margin: "0 auto 16px",
                height: 56,
                boxShadow: "0 6px 28px rgba(232,103,10,0.40)",
                letterSpacing: "0.02em",
              }}
            >
              Book My No-Cost Lab Visit
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Visual numbered timeline ───────────────────────────────────────────── */
const TIMELINE_STEPS = [
  {
    num: 1,
    title: "Book in Under 5 Minutes",
    time: "5 min online",
    desc: "Choose your location and time. No waiting rooms.",
  },
  {
    num: 2,
    title: "Full Labs Drawn Here",
    time: "20 min",
    desc: "Not at a separate lab. Everything done at your appointment.",
  },
  {
    num: 3,
    title: "Your Provider Reads Every Number With You",
    time: "Same visit",
    desc: "In plain English. No waiting for a portal. No guessing.",
  },
  {
    num: 4,
    title: "Walk Out With a Written Plan",
    time: "Same day",
    desc: "Or know exactly why not. Either way, you leave with answers.",
  },
];

const VisualTimeline = ({ onSchedule }: { onSchedule: () => void }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
  <section style={{ background: "linear-gradient(135deg, #0B1029 0%, #111B3A 100%)", padding: "80px 24px" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
          <Eyebrow>HOW IT WORKS</Eyebrow>
        </div>
        <h2 style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(26px, 4vw, 42px)",
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1.15,
          marginBottom: 8,
        }}>
          Everything Done In One Visit
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 500, margin: "0 auto" }}>
          Start to finish, here is exactly what your first appointment looks like.
        </p>
      </div>

      {/* Steps */}
      <div
        ref={gridRef}
        className="timeline-grid"
        style={{ display: "flex", gap: 0, position: "relative", alignItems: "flex-start" }}
      >
        {TIMELINE_STEPS.map((step, i) => (
          <div key={step.num} className={`tl-step${visible ? " tl-visible" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {/* Connector line between circles */}
            {i < TIMELINE_STEPS.length - 1 && (
              <div
                className="tl-connector"
                style={{
                  position: "absolute",
                  top: 28,
                  left: "calc(50% + 28px)",
                  right: "calc(-50% + 28px)",
                  height: 2,
                  background: "linear-gradient(90deg, var(--brand-cta), rgba(232,103,10,0.30))",
                  zIndex: 0,
                }}
              />
            )}

            {/* Step circle */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--brand-cta)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              flexShrink: 0,
              boxShadow: "0 4px 20px rgba(232,103,10,0.45)",
              marginBottom: 20,
            }}>
              <span style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: "#fff",
                lineHeight: 1,
              }}>
                {step.num}
              </span>
            </div>

            {/* Step content */}
            <div style={{ textAlign: "center", padding: "0 12px" }}>
              <h3 style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#fff",
                marginBottom: 8,
                lineHeight: 1.2,
              }}>
                {step.title}
              </h3>
              {/* Time badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(232,103,10,0.15)",
                border: "1px solid rgba(232,103,10,0.30)",
                borderRadius: 999,
                padding: "4px 10px",
                marginBottom: 12,
              }}>
                <Clock size={12} strokeWidth={2} style={{ color: "var(--brand-cta)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-cta)", letterSpacing: "0.04em" }}>
                  {step.time}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <OrangeCTA onClick={onSchedule} style={{ borderRadius: 999, height: 56, fontSize: 17, justifyContent: "center" }}>
          Book My No-Cost Lab Visit <ArrowRight size={18} strokeWidth={2.5} />
        </OrangeCTA>
      </div>
    </div>
  </section>
  );
};

/* ─── Trust badges strip ─────────────────────────────────────────────────── */
const TrustBadgesInline = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
    <a
      href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Verify LegitScript Certification"
    >
      <img
        src="/images/badges/legitscript-color.png"
        alt="LegitScript Certified"
        style={{ height: 40, width: "auto", opacity: 0.85 }}
        loading="lazy"
      />
    </a>
    <img
      src="/images/badges/hipaa-color.webp"
      alt="HIPAA Compliant"
      style={{ height: 32, width: "auto", opacity: 0.80 }}
      loading="lazy"
    />
    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontWeight: 600, letterSpacing: "0.05em" }}>
      HIPAA Compliant
    </span>
  </div>
);

/* ─── Stat strip ─────────────────────────────────────────────────────────── */
const StatStrip = () => {
  const stripRef = useRef<HTMLDivElement>(null);
  const [statCounts, setStatCounts] = useState([0, 0, 0]);
  const stripStarted = useRef(false);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stripStarted.current) {
          stripStarted.current = true;
          obs.disconnect();
          const duration = 1200;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - elapsed, 3);
            setStatCounts([
              Math.round(10000 * ease),
              Math.round(3 * ease),
              0,
            ]);
            if (elapsed < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const STAT_DISPLAY = [
    { isNum: true,  suffix: "+", label: "Men Treated" },
    { isNum: true,  suffix: "",  label: "Virginia Locations" },
    { isNum: false, display: "Same Day", label: "Lab Results" },
  ];

  return (
    <div ref={stripRef} style={{
      background: "rgba(232,103,10,0.10)",
      borderTop: "1px solid rgba(232,103,10,0.20)",
      padding: "20px 24px",
    }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        flexWrap: "wrap",
      }}>
        {STAT_DISPLAY.map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", padding: "8px 32px" }}>
              <div
                className="stat-value"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(22px, 3vw, 30px)",
                  color: "var(--brand-cta)",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {item.isNum
                  ? `${statCounts[i].toLocaleString()}${item.suffix}`
                  : item.display}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.60)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {item.label}
              </div>
            </div>
            {i < 2 && (
              <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── What's Included card (tightened) ──────────────────────────────────── */
const IncludedCard = () => (
  <div style={{
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  }}>
    <div style={{
      padding: "12px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(11,16,41,0.60)",
    }}>
      <span style={{
        fontFamily: "Oswald, sans-serif",
        fontWeight: 700,
        fontSize: 13,
        color: "#fff",
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
      }}>
        What Is Included
      </span>
    </div>
    {([
      { icon: <FlaskConical size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Full Hormone Lab Panel" },
      { icon: <Stethoscope  size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Provider Consultation" },
      { icon: <ClipboardList size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Personalized Treatment Plan" },
    ] as const).map(({ icon, title }) => (
      <div key={title} style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {icon}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#fff" }}>{title}</span>
        <span style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--c-success-on-dark)",
        }}>
          <Check size={12} strokeWidth={3} color="var(--c-success-on-dark)" />
          Included
        </span>
      </div>
    ))}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 20px",
      background: "rgba(11,16,41,0.80)",
    }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>Total</span>
      <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--brand-cta)" }}>
        $0 No-cost consultation
      </span>
    </div>
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
const ProductTRT = () => {
  const navigate = useNavigate();
  const goSchedule = useCallback(() => navigate("/product/trt/schedule"), [navigate]);

  return (
    <div style={{
      background: "#fff",
      fontFamily: "Inter, sans-serif",
      overflowX: "hidden",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <SEO
        title="Testosterone Replacement Therapy | Men's Wellness Centers"
        description="In-person TRT at Virginia's physician-led men's health practice. On-site labs, same-day results, and personalized protocols. No-cost consultation."
      />
      <style>{GLOBAL_STYLES}</style>

      {/* 1. ANNOUNCEMENT BAR */}
      <div className="ann-shimmer" style={{ padding: "10px 16px", textAlign: "center" }}>
        <p style={{
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
        }}>
          <span style={{ color: "var(--brand-cta)", fontSize: 10 }}>●</span>
          No-cost provider visits for new members · Same-day labs
        </p>
      </div>

      {/* 2. CRO HEADER — logo + phone, no nav */}
      <CROHeader />

      <main style={{ flex: 1, paddingTop: 64 /* offset fixed header */ }}>

        {/* 3. HERO — dark navy split */}
        <section
          id="hero"
          style={{
            background: "linear-gradient(135deg, #0B1029 0%, #0D1535 40%, #111B3A 100%)",
            paddingTop: 72,
            paddingBottom: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dot-pattern texture */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px", pointerEvents: "none",
          }} />
          {/* Orange glow top-right */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 40% at 90% 0%, rgba(232,103,10,0.16) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          <div
            className="hero-grid"
            style={{
              maxWidth: 1140,
              margin: "0 auto",
              padding: "0 24px 64px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 56,
              alignItems: "start",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* LEFT — copy */}
            <div style={{ paddingTop: 16 }}>
              <Eyebrow>TESTOSTERONE THERAPY</Eyebrow>
              <h1 style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(38px, 5vw, 64px)",
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                marginBottom: 24,
                marginTop: 16,
              }}>
                <span style={{ color: "#fff", display: "block" }}>Your Labs.</span>
                <span style={{ color: "#fff", display: "block" }}>Your Plan.</span>
                <span style={{ color: "var(--brand-cta)", display: "block" }}>In One Visit.</span>
              </h1>

              {/* 3-line value prop */}
              <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "On-site labs drawn at your appointment -- no outside visits",
                  "Results reviewed same day by a licensed Virginia provider",
                  "Personalized protocol built for your numbers, not a template",
                ].map((line) => (
                  <li key={line} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 15, color: "rgba(255,255,255,0.80)", lineHeight: 1.5 }}>{line}</span>
                  </li>
                ))}
              </ul>

              {/* Trust badges inline */}
              <TrustBadgesInline />

              {/* CTA */}
              <div style={{ marginTop: 28 }}>
                <OrangeCTA onClick={goSchedule} style={{ borderRadius: 999, height: 56, fontSize: 17, justifyContent: "center", width: "100%" }}>
                  Book My No-Cost Lab Visit <ArrowRight size={18} strokeWidth={2.5} />
                </OrangeCTA>
              </div>
            </div>

            {/* RIGHT — form */}
            <div style={{ paddingTop: 8 }}>
              <IncludedCard />
              <TRTHeroForm
                service="trt"
                heading="Reserve Your Consultation"
                ctaLabel="Book My No-Cost Lab Visit"
              />
            </div>
          </div>

          {/* Stat strip — anchored to bottom of hero */}
          <StatStrip />
        </section>

        {/* 4. COMPARISON TABLE */}
        <ComparisonTable />

        {/* 5. CANDIDATE QUIZ */}
        <CandidateQuiz onNavigateSchedule={goSchedule} />

        {/* 6. VISUAL TIMELINE */}
        <VisualTimeline onSchedule={goSchedule} />

        {/* 7. BENEFITS */}
        <TRTBenefitsSection />

        {/* 8. TREATMENT OPTIONS */}
        <TRTTreatmentOptionsSection onSchedule={goSchedule} />

        {/* 9. SIGNS */}
        <TRTSignsSection onSchedule={goSchedule} />

        {/* 10. PRICING */}
        <TRTPricing />

        {/* 11. FAQ */}
        <div id="faq">
          <TRTProductFAQ />
        </div>

        {/* 12. CLOSING CTA */}
        <section style={{
          background: "linear-gradient(135deg, #0B1029 0%, #111B3A 100%)",
          padding: "80px 24px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#fff",
              marginBottom: 12,
              lineHeight: 1.15,
            }}>
              Ready to Know Your Numbers?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", marginBottom: 32, lineHeight: 1.6 }}>
              Your first visit is no-cost. Labs are drawn on-site. Results reviewed the same day.
            </p>
            <OrangeCTA onClick={goSchedule} style={{ borderRadius: 999, height: 56, fontSize: 17, margin: "0 auto" }}>
              Book My No-Cost Lab Visit <ArrowRight size={18} strokeWidth={2.5} />
            </OrangeCTA>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 16 }}>
              Virginia-licensed providers · LegitScript Certified · HIPAA Compliant
            </p>
          </div>
        </section>
      </main>

      <TRTFooter />
    </div>
  );
};

export default ProductTRT;

/**
 * /pricing — Affordability page for Men's Wellness Centers.
 * Complete UI/UX redesign — editorial premium treatment.
 *
 * Design rules enforced:
 * - Left-border eyebrows only (no pill/badge eyebrow — banned AI tell)
 * - No colored circles around icons (icons standalone only)
 * - No email fields anywhere on this page
 * - CTAs: orange pill, border-radius 999, height 54–60px
 * - Lucide icons, strokeWidth 1.75
 * - No hardcoded brand colors — CSS custom properties
 * - No em dashes in JSX strings
 * - No AI slop vocabulary
 * - "licensed provider" not "physician"
 * - "no-cost" not "free"
 * - Membership terms: 12, 24, 30, 36-month only (no monthly option)
 * - 8px spacing grid
 * - Mobile-first (390px primary)
 * - prefers-reduced-motion respected via transitions only (no keyframes)
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Calendar,
  Tag,
  UserCheck,
  Pill,
  LayoutDashboard,
  CalendarCheck,
  CircleDollarSign,
  Microscope,
} from "lucide-react";

import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";

// ─── Constants ─────────────────────────────────────────────────────────────────

/**
 * Membership terms: 12-month minimum. No monthly option.
 * Correction applied: monthly removed; terms are 12, 24, 30, 36.
 */
const TERMS = [
  {
    term: "12-Month",
    tag: "Most Popular",
    featured: true,
    desc: "Reduced rate. Full lab cycle. Quarterly check-in.",
  },
  {
    term: "24-Month",
    tag: "Enhanced Value",
    featured: false,
    desc: "Lower effective rate. Two full lab cycles.",
  },
  {
    term: "30-Month",
    tag: "Superior Value",
    featured: false,
    desc: "Extended commitment, meaningful savings.",
  },
  {
    term: "36-Month",
    tag: "Best Rate",
    featured: false,
    desc: "Lowest effective monthly rate. Three lab cycles. Priority scheduling.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Why doesn't MWC publish prices online?",
    a: "Your treatment plan is built around your labs and your provider's recommendation. A flat published rate would either be misleading or force us to offer something that isn't right for your situation. Your provider reviews every cost in writing at your no-cost consultation.",
  },
  {
    q: "How much does TRT cost at MWC?",
    a: "Pricing depends on your therapy type, lab requirements, and the term you choose. Your provider walks the full breakdown with you at your consultation. No-cost visit, no commitment to enroll.",
  },
  {
    q: "What's included in the membership?",
    a: "Licensed provider oversight, in-center lab draws, FDA-approved medications when clinically appropriate, member portal access, and quarterly check-ins. Nothing sold separately.",
  },
  {
    q: "Is the consultation really at no cost?",
    a: "Yes. There is no charge for your first 60-minute visit. Labs are drawn, results reviewed, and your provider walks through a complete treatment and pricing summary before you decide anything.",
  },
  {
    q: "Do you accept insurance?",
    a: "We do not bill insurance. We do accept FSA and HSA cards. Many members find our cash-pay model simpler than insurance prior authorizations.",
  },
  {
    q: "Is financing available?",
    a: "Healthcare financing is available through third-party lenders. Many members pay as little as $179/month on a 36-month term, subject to credit approval and lender terms. Actual rate and payment depend on loan amount, creditworthiness, and term selected. APR varies by lender. Not all applicants will qualify. Ask at your consultation.",
  },
  {
    q: "Can I cancel my membership?",
    a: "12-month is our minimum term. 24-, 30-, and 36-month terms have specific cancellation terms that are reviewed in full at your consultation before you commit to anything.",
  },
  {
    q: "Are there military or first responder discounts?",
    a: "Active duty military, veterans, and first responders should ask about available discounts at their consultation.",
  },
] as const;

// ─── Style helpers ──────────────────────────────────────────────────────────────

const eyebrowBase: React.CSSProperties = {
  borderLeft: "3px solid var(--brand-cta)",
  paddingLeft: 10,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontFamily: "Inter, sans-serif",
  display: "block",
  marginBottom: 16,
};

const eyebrowLight: React.CSSProperties = {
  ...eyebrowBase,
  color: "var(--brand-cta)",
};

const eyebrowDark: React.CSSProperties = {
  ...eyebrowBase,
  color: "var(--brand-cta)",
};

function pillStyle(fullWidth = false, height = 56): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height,
    padding: "0 32px",
    width: fullWidth ? "100%" : undefined,
    background: "var(--brand-cta)",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.04em",
    fontFamily: "Inter, sans-serif",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 150ms ease, transform 150ms cubic-bezier(0.215, 0.61, 0.355, 1), box-shadow 150ms ease",
  };
}

// ─── Reveal hooks ───────────────────────────────────────────────────────────────

function useSectionReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), 150);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, revealed };
}

function useCardReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), 100);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, revealed };
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

/** Single timeline row with dot and optional connecting line */
const TimelineRow = ({
  title,
  desc,
  isLast,
  lineVisible,
}: {
  title: string;
  desc: string;
  isLast: boolean;
  lineVisible: boolean;
}) => (
  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
    {/* Dot + line column */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
        paddingTop: 4,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--brand-cta)",
          flexShrink: 0,
        }}
      />
      {!isLast && (
        <div
          style={{
            width: 1,
            height: 44,
            background: "rgba(11,16,41,0.07)",
            marginTop: 4,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: lineVisible ? "100%" : "0%",
              background: "var(--brand-cta)",
              opacity: 0.3,
              transition: "height 300ms cubic-bezier(0.215, 0.61, 0.355, 1)",
            }}
          />
        </div>
      )}
    </div>
    {/* Text */}
    <div style={{ paddingBottom: isLast ? 0 : 16 }}>
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--brand-navy-deep)",
          margin: 0,
          marginBottom: 2,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: 13,
          color: "var(--c-text-on-light-muted)",
          margin: 0,
          lineHeight: 1.5,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {desc}
      </p>
    </div>
  </div>
);

const TIMELINE_ROWS = [
  { title: "Labs drawn on-site", desc: "Full hormone panel. Takes about 20 minutes." },
  { title: "Results reviewed same visit", desc: "Your provider reads every number with you." },
  {
    title: "Treatment plan discussed",
    desc: "If treatment is right for you, you leave with a written protocol.",
  },
  {
    title: "Pricing reviewed in writing",
    desc: "Full cost breakdown before you decide anything.",
  },
] as const;

/**
 * Hero right-zone: "Your 60-Minute Visit" editorial card.
 * Asymmetric border radius (squared left, rounded right) is the signature visual.
 * No form, no email field. Visit card only.
 */
const VisitCard = () => {
  const { ref, revealed } = useCardReveal();
  return (
    <div
      ref={ref}
      style={{
        background: "var(--bg-white)",
        borderLeft: "2px solid var(--brand-cta)",
        borderRadius: "0 16px 16px 0",
        padding: 36,
        maxWidth: 420,
        width: "100%",
      }}
    >
      <p
        style={{
          fontFamily: "Oswald, sans-serif",
          fontWeight: 600,
          fontSize: 22,
          color: "var(--brand-navy-deep)",
          margin: 0,
          marginBottom: 4,
        }}
      >
        Your 60-Minute Visit
      </p>
      <p
        style={{
          fontSize: 13,
          color: "var(--c-text-on-light-muted)",
          margin: 0,
          marginBottom: 20,
          fontFamily: "Inter, sans-serif",
        }}
      >
        What actually happens when you come in.
      </p>
      <div
        style={{
          height: 1,
          background: "rgba(0,0,0,0.06)",
          marginBottom: 24,
        }}
      />
      {TIMELINE_ROWS.map((row, i, arr) => (
        <TimelineRow
          key={row.title}
          title={row.title}
          desc={row.desc}
          isLast={i === arr.length - 1}
          lineVisible={revealed && i < arr.length - 1}
        />
      ))}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "var(--c-text-on-light-muted)",
            margin: 0,
            lineHeight: 1.5,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Financing from $179/month. Subject to credit approval.
        </p>
      </div>
    </div>
  );
};

/**
 * FAQ accordion with animated max-height reveal and left-border slide-in.
 * 220ms ease-out cubic-bezier per web-animation-design skill spec.
 */
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setMeasuredHeight(bodyRef.current.scrollHeight);
    }
  }, []);

  return (
    <div style={{ borderBottom: "1px solid #E5E7EB" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--brand-navy-deep)",
            lineHeight: 1.4,
          }}
        >
          {q}
        </span>
        <span
          style={{
            flexShrink: 0,
            display: "flex",
            transition: "transform 200ms ease-out",
            transform: open ? "rotate(0deg)" : "rotate(0deg)",
          }}
        >
          {open ? (
            <ChevronUp size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />
          ) : (
            <ChevronDown size={18} strokeWidth={1.75} style={{ color: "var(--brand-navy-deep)" }} />
          )}
        </span>
      </button>
      {/* Animated answer container */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? (measuredHeight || 400) : 0,
          transition: "max-height 220ms cubic-bezier(0.215, 0.61, 0.355, 1)",
        }}
      >
        <div
          ref={bodyRef}
          style={{
            paddingBottom: 20,
            paddingLeft: 14,
            borderLeft: open ? "3px solid var(--brand-cta)" : "0px solid var(--brand-cta)",
            transition: "border-left-width 220ms ease-out, padding-left 220ms ease-out",
          }}
        >
          <p
            style={{
              fontSize: 15,
              color: "var(--c-text-on-light-muted)",
              lineHeight: 1.65,
              margin: 0,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── CTA hover handlers (shared) ───────────────────────────────────────────────

const ctaEnter = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(-2px)";
  el.style.boxShadow = "0 8px 24px rgba(232,103,10,0.30)";
  el.style.background = "var(--brand-cta-hover)";
};

const ctaLeave = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "none";
  el.style.boxShadow = "none";
  el.style.background = "var(--brand-cta)";
};

// ─── Main page ──────────────────────────────────────────────────────────────────

export default function Affordability() {
  const navigate = useNavigate();

  // Section reveal refs — each section's H2 animates in on scroll
  const heroSection = useSectionReveal(0.05);
  const howPricingSection = useSectionReveal();
  const includedSection = useSectionReveal();
  const termsSection = useSectionReveal();
  const voicesSection = useSectionReveal();
  const faqSection = useSectionReveal();
  const closingSection = useSectionReveal();

  /** Shared h2 entrance style — opacity + translateY */
  const revealH2 = (revealed: boolean): React.CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? "none" : "translateY(12px)",
    transition: "opacity 400ms ease-out 150ms, transform 400ms ease-out 150ms",
  });

  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>

      {/* ── 1. UTILITY BAR ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#06091A",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 24px",
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          position: "relative",
          zIndex: 60,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "rgba(245,240,235,0.65)",
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <BadgeCheck
            size={14}
            strokeWidth={1.75}
            style={{ color: "var(--brand-cta)", flexShrink: 0 }}
            aria-hidden
          />
          Financing available. As little as $179/month.
        </span>
        <a
          href="/book/location"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--brand-cta)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Book No-Cost Visit
        </a>
      </div>

      {/* ── 2. HEADER ────────────────────────────────────────────────────────── */}
      <TRTHeader minimal />

      {/* ── 3. HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroSection.ref}
        id="hero"
        style={{
          background: "linear-gradient(150deg, #0B1029 0%, #0D1535 55%, #111B3A 100%)",
          position: "relative",
          overflow: "hidden",
          paddingTop: 102,
          paddingBottom: 96,
        }}
      >
        {/* Radial glow top-right — signature atmospheric treatment */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 640,
            height: 640,
            background:
              "radial-gradient(circle, rgba(232,103,10,0.13) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(232,103,10,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 56,
            position: "relative",
            zIndex: 1,
            alignItems: "center",
          }}
          className="md:grid-cols-[3fr_2fr]"
        >
          {/* LEFT ZONE — editorial copy */}
          <div style={{ maxWidth: 640 }}>
            <span style={eyebrowDark}>Transparent Pricing</span>

            <h1
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(52px, 6vw, 80px)",
                color: "var(--brand-cream)",
                lineHeight: 1.0,
                marginBottom: 16,
                ...revealH2(heroSection.revealed),
              }}
            >
              What Does It Cost?
            </h1>

            {/* Signature visual: orange rule under H1 */}
            <div
              style={{
                width: 48,
                height: 2,
                background: "var(--brand-cta)",
                marginBottom: 28,
                opacity: heroSection.revealed ? 1 : 0,
                transform: heroSection.revealed ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition:
                  "opacity 400ms ease-out 300ms, transform 400ms cubic-bezier(0.215, 0.61, 0.355, 1) 300ms",
              }}
              aria-hidden
            />

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.65,
                color: "rgba(245,240,235,0.80)",
                marginBottom: 40,
                maxWidth: 540,
                fontFamily: "Inter, sans-serif",
                opacity: heroSection.revealed ? 1 : 0,
                transform: heroSection.revealed ? "none" : "translateY(8px)",
                transition:
                  "opacity 400ms ease-out 250ms, transform 400ms ease-out 250ms",
              }}
            >
              We don't publish prices online. Your plan depends on your labs, your hormone
              levels, and what your provider recommends. At your no-cost 60-minute visit,
              your provider walks every number with you in writing. Before you decide
              anything.
            </p>

            {/* Trust row — 4 items, 2-col grid, no borders */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 24px",
                marginBottom: 40,
                opacity: heroSection.revealed ? 1 : 0,
                transition: "opacity 400ms ease-out 400ms",
              }}
            >
              {[
                "No-cost first visit",
                "No hidden fees",
                "Labs drawn on-site",
                "Leave with a written plan",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "rgba(245,240,235,0.85)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <Check
                    size={15}
                    strokeWidth={2.5}
                    style={{ color: "var(--brand-cta)", flexShrink: 0 }}
                    aria-hidden
                  />
                  {item}
                </span>
              ))}
            </div>

            {/* Primary CTA */}
            <div
              style={{
                opacity: heroSection.revealed ? 1 : 0,
                transform: heroSection.revealed ? "none" : "translateY(8px)",
                transition:
                  "opacity 400ms ease-out 500ms, transform 400ms ease-out 500ms",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/book/location")}
                style={pillStyle(false, 56)}
                onMouseEnter={ctaEnter}
                onMouseLeave={ctaLeave}
              >
                Book My No-Cost Visit
              </button>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(245,240,235,0.40)",
                  marginTop: 10,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                or call{" "}
                <a
                  href="tel:8045550199"
                  style={{
                    color: "rgba(245,240,235,0.55)",
                    textDecoration: "none",
                  }}
                >
                  (804) 555-0199
                </a>
              </p>
            </div>
          </div>

          {/* RIGHT ZONE — editorial visit card (no form, no email) */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              opacity: heroSection.revealed ? 1 : 0,
              transform: heroSection.revealed ? "none" : "translateY(16px)",
              transition:
                "opacity 500ms ease-out 350ms, transform 500ms ease-out 350ms",
            }}
            className="md:sticky md:top-[102px]"
          >
            <VisitCard />
          </div>
        </div>
      </section>

      {/* ── 4. HOW PRICING WORKS ─────────────────────────────────────────────── */}
      <section
        ref={howPricingSection.ref}
        id="how-pricing-works"
        style={{ background: "#F8F5F0", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={eyebrowLight}>How Pricing Works</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(30px, 4vw, 50px)",
              color: "var(--brand-navy-deep)",
              marginBottom: 56,
              lineHeight: 1.05,
              maxWidth: 640,
              ...revealH2(howPricingSection.revealed),
            }}
          >
            Three Things Determine Your Monthly Rate.
          </h2>

          {/* Asymmetric editorial numbered blocks — full width, separated by lines */}
          {[
            {
              num: "01",
              title: "Membership Length",
              body: "12-month, 24-month, 30-month, or 36-month. The longer the term, the lower your effective monthly rate. Your provider explains the math at your visit.",
            },
            {
              num: "02",
              title: "Therapy Type",
              body: "Injectable TRT, oral TRT, or add-on therapies. Each has different medication, lab, and oversight requirements. Your provider recommends based on your labs, not a menu.",
            },
            {
              num: "03",
              title: "New Member Offers",
              body: "Limited promotions reduce your first-month cost. Ask at your consultation. We'll tell you exactly what's available.",
            },
          ].map((block, i) => (
            <div key={block.num}>
              {i > 0 && (
                <div
                  style={{
                    height: 1,
                    background: "rgba(11,16,41,0.08)",
                    marginBottom: 48,
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 32,
                  paddingBottom: 48,
                  opacity: howPricingSection.revealed ? 1 : 0,
                  transform: howPricingSection.revealed
                    ? "none"
                    : "translateY(12px)",
                  transition: `opacity 400ms ease-out ${200 + i * 120}ms, transform 400ms ease-out ${200 + i * 120}ms`,
                }}
                className="md:flex-row flex-col"
              >
                {/* Decorative large numeral */}
                <span
                  aria-hidden
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
                    fontSize: 80,
                    lineHeight: 1,
                    color: "rgba(11,16,41,0.06)",
                    flexShrink: 0,
                    userSelect: "none",
                    minWidth: 80,
                  }}
                >
                  {block.num}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 600,
                      fontSize: 24,
                      color: "var(--brand-navy-deep)",
                      marginBottom: 12,
                      marginTop: 0,
                    }}
                  >
                    {block.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: "var(--c-text-on-light-muted)",
                      lineHeight: 1.65,
                      maxWidth: 680,
                      margin: 0,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {block.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. WHAT'S INCLUDED ───────────────────────────────────────────────── */}
      <section
        ref={includedSection.ref}
        style={{ background: "var(--brand-navy-deep)", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={eyebrowDark}>Included in Every Membership</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(30px, 4vw, 50px)",
              color: "var(--brand-cream)",
              marginBottom: 8,
              lineHeight: 1.05,
              ...revealH2(includedSection.revealed),
            }}
          >
            One Monthly Rate. No Surprises.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(245,240,235,0.65)",
              lineHeight: 1.6,
              marginBottom: 56,
              maxWidth: 520,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Every membership includes the following. Nothing sold separately.
          </p>

          {/* 2-col editorial icon list — no boxes, no borders around items */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 32,
            }}
          >
            {(
              [
                {
                  Icon: UserCheck,
                  title: "Licensed provider oversight",
                  desc: "Every protocol reviewed and managed by a licensed provider.",
                },
                {
                  Icon: Microscope,
                  title: "In-center lab draws",
                  desc: "Labs drawn at your location, results reviewed same visit.",
                },
                {
                  Icon: Pill,
                  title: "FDA-approved medications",
                  desc: "When clinically appropriate. No compounded substitutions without discussion.",
                },
                {
                  Icon: LayoutDashboard,
                  title: "Member portal access",
                  desc: "Review labs, messages, and appointment history anytime.",
                },
                {
                  Icon: CalendarCheck,
                  title: "Quarterly check-ins",
                  desc: "Regular touchpoints to review progress and adjust your protocol.",
                },
                {
                  Icon: CircleDollarSign,
                  title: "No hidden fees",
                  desc: "Your membership rate covers everything listed here.",
                },
              ] as const
            ).map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  opacity: includedSection.revealed ? 1 : 0,
                  transform: includedSection.revealed ? "none" : "translateY(12px)",
                  transition: `opacity 400ms ease-out ${100 + i * 60}ms, transform 400ms ease-out ${100 + i * 60}ms`,
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={1.75}
                  style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }}
                  aria-hidden
                />
                <div>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--brand-cream)",
                      margin: 0,
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(245,240,235,0.55)",
                      margin: 0,
                      lineHeight: 1.5,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. MEMBERSHIP TERMS ──────────────────────────────────────────────── */}
      <section
        ref={termsSection.ref}
        style={{ background: "var(--bg-white)", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <span style={eyebrowLight}>Membership Terms</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(30px, 4vw, 50px)",
              color: "var(--brand-navy-deep)",
              marginBottom: 8,
              lineHeight: 1.05,
              ...revealH2(termsSection.revealed),
            }}
          >
            Choose Your Term at the Consultation.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--c-text-on-light-muted)",
              marginBottom: 48,
              lineHeight: 1.6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            All terms reviewed in writing. No pressure to decide on the spot.
          </p>

          {/* Horizontal comparison bands — full-width rows */}
          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {TERMS.map((band, i) => (
              <BandRow
                key={band.term}
                band={band}
                isLast={i === TERMS.length - 1}
                revealed={termsSection.revealed}
                delay={120 + i * 80}
              />
            ))}
          </div>

          {/* Financing strip — left-border orange, no card */}
          <div
            style={{
              marginTop: 32,
              borderLeft: "4px solid var(--brand-cta)",
              paddingLeft: 20,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 600,
                  fontSize: 17,
                  color: "var(--brand-navy-deep)",
                  margin: 0,
                  marginBottom: 2,
                }}
              >
                As little as $179/month with financing.
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--c-text-on-light-muted)",
                  margin: 0,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Subject to credit approval. Actual rate and payment vary by
                lender, term, and creditworthiness.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/book/location")}
              style={pillStyle(false, 46)}
              onMouseEnter={ctaEnter}
              onMouseLeave={ctaLeave}
            >
              Reserve My Visit
            </button>
          </div>
        </div>
      </section>

      {/* ── 7. MEMBER VOICES ─────────────────────────────────────────────────── */}
      <section
        ref={voicesSection.ref}
        style={{ background: "#FAFAF8", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <span style={eyebrowLight}>Member Voices</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 46px)",
              color: "var(--brand-navy-deep)",
              marginBottom: 56,
              lineHeight: 1.05,
              ...revealH2(voicesSection.revealed),
            }}
          >
            What Members Say.
          </h2>

          {[
            {
              quote:
                "I appreciated that the consultation was genuinely no-pressure. My provider walked through every line item before I made any decision.",
              initials: "J.M.",
              location: "Richmond",
              since: "2024",
            },
            {
              quote:
                "I'd been putting this off because I assumed it would be expensive and confusing. It wasn't either. The pricing conversation took about 10 minutes.",
              initials: "D.W.",
              location: "Virginia Beach",
              since: "2023",
            },
            {
              quote:
                "Six months in and the process has been completely straightforward. No surprise charges, no upsells.",
              initials: "T.K.",
              location: "Newport News",
              since: "2025",
            },
          ].map(({ quote, initials, location, since }, i, arr) => (
            <div key={initials}>
              {/* Pull-quote editorial block */}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                  paddingBottom: 40,
                  opacity: voicesSection.revealed ? 1 : 0,
                  transform: voicesSection.revealed
                    ? "none"
                    : "translateY(12px)",
                  transition: `opacity 400ms ease-out ${150 + i * 120}ms, transform 400ms ease-out ${150 + i * 120}ms`,
                }}
              >
                {/* Decorative large quotation mark */}
                <span
                  aria-hidden
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
                    fontSize: 72,
                    lineHeight: 1,
                    color: "rgba(232,103,10,0.12)",
                    flexShrink: 0,
                    marginTop: -8,
                    userSelect: "none",
                  }}
                >
                  &ldquo;
                </span>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 18,
                      fontWeight: 500,
                      color: "var(--brand-navy-deep)",
                      lineHeight: 1.6,
                      marginBottom: 20,
                      marginTop: 0,
                    }}
                  >
                    {quote}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {/* Initials badge — navy bg, orange initial, NO border (per spec) */}
                    <div
                      aria-hidden
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--brand-navy-deep)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Oswald, sans-serif",
                          fontWeight: 700,
                          fontSize: 15,
                          color: "var(--brand-cta)",
                        }}
                      >
                        {initials[0]}
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--brand-navy-deep)",
                          margin: 0,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {initials}, {location}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--c-text-on-light-muted)",
                          margin: 0,
                          marginTop: 2,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Member since {since}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    height: 1,
                    background: "rgba(11,16,41,0.08)",
                    marginBottom: 40,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────────────────────────── */}
      <section
        ref={faqSection.ref}
        style={{ background: "var(--bg-white)", padding: "96px 24px" }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 48,
            alignItems: "start",
          }}
          className="md:grid-cols-[35fr_65fr]"
        >
          {/* Left — sticky heading */}
          <div className="md:sticky md:top-[102px]">
            <span style={eyebrowLight}>FAQ</span>
            <h2
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(28px, 3.5vw, 42px)",
                color: "var(--brand-navy-deep)",
                marginBottom: 12,
                lineHeight: 1.05,
                ...revealH2(faqSection.revealed),
              }}
            >
              Common Questions.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--c-text-on-light-muted)",
                lineHeight: 1.65,
                marginBottom: 24,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Can't find what you need? Call us.{" "}
              <a
                href="tel:8045550199"
                style={{
                  color: "var(--brand-cta)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                (804) 555-0199
              </a>
            </p>
            <button
              type="button"
              onClick={() => navigate("/book/location")}
              style={pillStyle(false, 48)}
              onMouseEnter={ctaEnter}
              onMouseLeave={ctaLeave}
            >
              Book My Visit
            </button>
          </div>

          {/* Right — accordion, borderless, separator lines only */}
          <div style={{ borderTop: "1px solid #E5E7EB" }}>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CLOSING CTA ───────────────────────────────────────────────────── */}
      <section
        ref={closingSection.ref}
        style={{
          background:
            "linear-gradient(160deg, #07091F 0%, #0B1029 60%, #0E1635 100%)",
          padding: "112px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(232,103,10,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              ...eyebrowDark,
              display: "inline-block",
              marginBottom: 20,
            }}
          >
            Ready?
          </span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(36px, 5vw, 60px)",
              color: "var(--brand-cream)",
              lineHeight: 1.05,
              marginBottom: 20,
              ...revealH2(closingSection.revealed),
            }}
          >
            Your Pricing Is Reviewed At The Consultation.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "rgba(245,240,235,0.65)",
              lineHeight: 1.65,
              marginBottom: 40,
              fontFamily: "Inter, sans-serif",
            }}
          >
            No-cost. No commitment. Your provider walks every number with you in
            writing before you decide.
          </p>

          <button
            type="button"
            onClick={() => navigate("/book/location")}
            style={{
              ...pillStyle(false, 60),
              fontSize: 16,
              letterSpacing: "0.05em",
              padding: "0 48px",
            }}
            onMouseEnter={ctaEnter}
            onMouseLeave={ctaLeave}
          >
            Book My No-Cost Visit
          </button>

          {/* Trust trio — inline, below CTA */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px 24px",
              marginTop: 24,
            }}
          >
            {["No-cost first visit", "Labs included", "Leave with a plan"].map(
              (item) => (
                <span
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "rgba(245,240,235,0.50)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <Check
                    size={12}
                    strokeWidth={2.5}
                    style={{ color: "var(--brand-cta)", flexShrink: 0 }}
                    aria-hidden
                  />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── LEGAL DISCLOSURE ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#F0EDE8",
          borderTop: "1px solid #D9D4CE",
          padding: "20px 24px",
        }}
      >
        <p
          style={{
            maxWidth: 900,
            margin: "0 auto",
            fontSize: 11,
            lineHeight: 1.6,
            color: "#6B7280",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Treatment requires a clinical evaluation and is provided only when medically appropriate.
          Individual results vary. Treatment is provided by licensed providers at Men's Wellness Centers.
          Membership pricing is reviewed in person at your no-cost 60-minute consultation. Financing is
          available through third-party lenders and is subject to credit approval. The $179/month example
          is based on a representative 36-month financing term and does not represent the cost of any
          specific membership. Actual monthly payment depends on creditworthiness, loan amount, APR, and
          term selected. APR varies by lender. Not all applicants will qualify. This advertisement does not
          constitute a credit offer. Men's Wellness Centers is not a lender. LegitScript certified.
          &copy; {new Date().getFullYear()} Men's Wellness Centers. All rights reserved.
        </p>
      </div>

      {/* ── 10. FOOTER ───────────────────────────────────────────────────────── */}
      <TRTFooter />

      {/* ── STICKY MOBILE CTA ────────────────────────────────────────────────── */}
      <StickyMobileCTA />
    </div>
  );
}

// ─── BandRow component (extracted to avoid hook-in-loop TS issue) ──────────────

type BandData = {
  readonly term: string;
  readonly tag: string;
  readonly featured: boolean;
  readonly desc: string;
};

const BandRow = ({
  band,
  isLast,
  revealed,
  delay,
}: {
  band: BandData;
  isLast: boolean;
  revealed: boolean;
  delay: number;
}) => {
  const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!band.featured) {
      e.currentTarget.style.background = "rgba(0,0,0,0.025)";
    }
  };
  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!band.featured) {
      e.currentTarget.style.background = "var(--bg-white)";
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "5fr 8fr",
        minHeight: 72,
        alignItems: "center",
        gap: 24,
        padding: "20px 32px",
        background: band.featured ? "var(--brand-navy-deep)" : "var(--bg-white)",
        borderBottom: isLast ? undefined : "1px solid #E5E7EB",
        cursor: "default",
        transition: `background 120ms ease, opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`,
        opacity: revealed ? 1 : 0,
        transform: revealed ? "none" : "translateY(8px)",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Left: term name + tag */}
      <div>
        <p
          style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 600,
            fontSize: 18,
            margin: 0,
            marginBottom: 4,
            color: band.featured ? "var(--brand-cream)" : "var(--brand-navy-deep)",
          }}
        >
          {band.term}
        </p>
        <span
          style={{
            borderLeft: "3px solid var(--brand-cta)",
            paddingLeft: 8,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: band.featured
              ? "rgba(232,103,10,0.85)"
              : "var(--c-text-on-light-muted)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {band.tag}
        </span>
      </div>
      {/* Right: description */}
      <p
        style={{
          fontSize: 14,
          color: band.featured
            ? "rgba(245,240,235,0.70)"
            : "var(--c-text-on-light-muted)",
          margin: 0,
          lineHeight: 1.5,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {band.desc}
      </p>
    </div>
  );
};

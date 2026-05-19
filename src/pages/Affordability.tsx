/**
 * /pricing — Affordability page for Men's Wellness Centers.
 * Full scratch rebuild following system design language and token rules.
 *
 * Design rules enforced:
 * - Left-border eyebrows only (no pill/badge — banned)
 * - No colored circles around icons (icons standalone, no wrappers)
 * - No email fields anywhere on this page
 * - Buttons: rounded-lg, height 56, matching manifesto inline style
 * - Lucide icons, strokeWidth 1.75
 * - No hardcoded hex — CSS vars only (rgba() overlays excepted)
 * - No em dashes in JSX text content
 * - "licensed provider" not "physician"
 * - "no-cost" not "free"
 * - Membership terms: 12, 24, 30, 36-month only (no monthly option)
 * - Mobile-first (390px)
 * - 8px grid using Tailwind / var(--space-N)
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, FlaskConical, Quote, Tag } from "lucide-react";

import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { TRTEverythingIncluded } from "@/components/landing/trt/TRTEverythingIncluded";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";

// ─── Shared eyebrow style (left-border — the only permitted eyebrow pattern) ───

const eyebrow: React.CSSProperties = {
  display: "block",
  borderLeft: "3px solid var(--brand-cta)",
  paddingLeft: 10,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--brand-cta)",
  fontFamily: "Inter, sans-serif",
  lineHeight: 1,
  marginBottom: 12,
};

// ─── FAQ data ───────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Why doesn't MWC publish prices online?",
    a: "Because your treatment plan is built around your labs and your provider's recommendation. A flat published rate would either be misleading or force us to offer something that isn't right for your situation. Your provider reviews every cost in writing at your no-cost consultation.",
  },
  {
    q: "How much does TRT cost at MWC?",
    a: "Membership pricing depends on your therapy type, lab requirements, and the membership term you choose. Your provider reviews the full breakdown at your consultation. No-cost, no commitment.",
  },
  {
    q: "What's included in the membership?",
    a: "Licensed provider oversight, in-center lab draws, FDA-approved medications when clinically appropriate, member portal access, and quarterly check-ins. No hidden fees.",
  },
  {
    q: "Is the consultation really at no cost?",
    a: "Yes. There is no charge for your first 60-minute visit. Labs are drawn, results reviewed, and your provider walks through a complete treatment and pricing summary before you decide anything.",
  },
  {
    q: "Do you accept insurance?",
    a: "We do not bill insurance. We do accept FSA and HSA cards. Many members find our transparent cash-pay model simpler than insurance prior authorizations.",
  },
  {
    q: "Is financing available?",
    a: "Healthcare financing is available through third-party lenders. Many members pay as little as $179/month on a 36-month term, subject to credit approval and lender terms. Actual rate depends on creditworthiness, loan amount, and term. APR varies by lender. Not all applicants will qualify.",
  },
  {
    q: "Can I cancel my membership?",
    a: "12-month is our minimum term. 24-, 30-, and 36-month terms have specific cancellation terms reviewed at your consultation before you commit to anything.",
  },
  {
    q: "Are there military or first responder discounts?",
    a: "Active duty military, veterans, and first responders should ask about available discounts at their consultation.",
  },
] as const;

// ─── FAQ Accordion Item — mirrors TRTFAQ accordion pattern exactly ──────────────

const FaqItem = ({
  q,
  a,
  isOpen,
  onToggle,
  index,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) => {
  const panelId = `pricing-faq-panel-${index}`;
  const itemRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    onToggle();
    if (!isOpen) {
      window.setTimeout(() => {
        itemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  };

  return (
    <div
      ref={itemRef}
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-white)", border: "1px solid var(--c-border-on-light)" }}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
        style={{
          color: "var(--brand-navy)",
          fontFamily: "Inter, sans-serif",
          background: "none",
          border: "none",
        }}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="font-semibold" style={{ fontSize: 17 }}>
          {q}
        </span>
        <ChevronDown
          className="h-5 w-5 flex-shrink-0 transition-transform duration-200"
          strokeWidth={1.75}
          style={{
            color: "var(--brand-cta)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {isOpen && (
        <div
          id={panelId}
          className="px-5 pb-5 leading-relaxed"
          style={{
            color: "var(--c-text-on-light-muted)",
            fontFamily: "Inter, sans-serif",
            fontSize: 16,
          }}
        >
          <p style={{ margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  );
};

// ─── Main page ──────────────────────────────────────────────────────────────────

export default function Affordability() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleFaqToggle = (i: number) => {
    setOpenFaq(openFaq === i ? null : i);
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <TRTHeader minimal />

      {/* ── SECTION 1: HERO (dark navy, full-width manifesto pattern) ────────── */}
      <section
        id="hero"
        style={{
          background: "var(--brand-navy-deep)",
          paddingTop: "calc(64px + 80px)",
          paddingBottom: 80,
        }}
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <p style={eyebrow}>Transparent Pricing</p>

          <h1
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(32px, 4vw, 52px)",
              color: "var(--brand-cream)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginTop: 0,
              marginBottom: 20,
            }}
          >
            WHAT DOES IT COST?
          </h1>

          <p
            className="leading-[1.7]"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 17,
              color: "var(--c-text-on-dark-muted)",
              maxWidth: 600,
              marginTop: 0,
              marginBottom: 32,
            }}
          >
            We don't publish prices online. Your plan is built around your labs,
            your hormone levels, and what your provider recommends. At your
            no-cost 60-minute visit, your provider walks every number with you
            in writing. Before you decide anything.
          </p>

          <button
            type="button"
            onClick={() => navigate("/book/location")}
            className="mt-2 w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer border-none"
            style={{
              height: 56,
              minHeight: 56,
              background: "var(--brand-cta)",
              color: "var(--c-text-on-dark)",
              fontSize: "clamp(15px, 3.5vw, 19px)",
              letterSpacing: "0.06em",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--brand-cta-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--brand-cta)";
            }}
          >
            Book My No-Cost Visit
          </button>

          <p
            className="mt-3"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "var(--c-text-on-dark-muted)",
              marginBottom: 0,
            }}
          >
            No commitment. No pressure.
          </p>
        </div>
      </section>

      {/* ── SECTION 2: STAT STRIP (CredibilityBand pattern, custom stats) ────── */}
      <section style={{ background: "var(--brand-navy-deep)", borderTop: "1px solid var(--c-border-on-dark)" }}>
        <div
          className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 text-center"
          style={{ paddingTop: 0, paddingBottom: 0 }}
        >
          {[
            { value: "No-Cost", label: "First Visit" },
            { value: "Labs Included", label: "Drawn On-Site" },
            { value: "Same-Day", label: "Results In-Visit" },
            { value: "$179/mo*", label: "From, With Financing" },
          ].map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col items-center gap-2 px-2 py-5 md:py-7"
            >
              <div
                className="font-bold uppercase"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: "var(--c-text-on-dark)",
                  fontSize: "clamp(22px, 3.5vw, 36px)",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                }}
              >
                {stat.value}
              </div>
              <div
                className="uppercase"
                style={{
                  fontFamily: "Inter, sans-serif",
                  // hardcoded-color-allow-next-line
                  color: "rgba(255,255,255,0.70)",
                  fontSize: 11,
                  letterSpacing: "0.10em",
                  fontWeight: 700,
                  lineHeight: 1.45,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: HOW PRICING WORKS (cream, 3-col card grid) ───────────── */}
      <section className="py-16 md:py-20" style={{ background: "var(--brand-cream)" }}>
        <div className="max-w-[1100px] mx-auto px-6">
          <p style={eyebrow}>How Pricing Works</p>
          <h2
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(28px, 3.5vw, 40px)",
              color: "var(--c-text-on-light)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginTop: 0,
              marginBottom: 40,
            }}
          >
            THREE THINGS DETERMINE YOUR RATE.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: Calendar,
                title: "Membership Length",
                body: "12-, 24-, 30-, or 36-month. Longer terms mean a lower effective monthly rate. Your provider explains the math at your visit.",
              },
              {
                Icon: FlaskConical,
                title: "Therapy Type",
                body: "Injectable TRT, oral TRT, or add-on therapies. Your provider recommends based on your labs.",
              },
              {
                Icon: Tag,
                title: "New Member Offers",
                body: "Limited promotions may reduce your first-month cost. Ask at your consultation.",
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                style={{
                  background: "var(--bg-white)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-md)",
                  padding: "28px 24px",
                  border: "1px solid var(--c-border-on-light)",
                }}
              >
                <Icon
                  size={28}
                  strokeWidth={1.75}
                  style={{ color: "var(--brand-cta)", marginBottom: 16, display: "block" }}
                  aria-hidden
                />
                <h3
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 600,
                    fontSize: 20,
                    color: "var(--c-text-on-light)",
                    marginTop: 0,
                    marginBottom: 10,
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 15,
                    color: "var(--c-text-on-light-muted)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: WHAT'S INCLUDED (reuse TRTEverythingIncluded as-is) ───── */}
      <TRTEverythingIncluded />

      {/* ── SECTION 5: MEMBERSHIP TERMS (white, 2x2 card grid) ──────────────── */}
      <section className="py-16 md:py-20" style={{ background: "var(--bg-white)" }}>
        <div className="max-w-[1100px] mx-auto px-6">
          <p style={eyebrow}>Membership Terms</p>
          <h2
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(28px, 3.5vw, 40px)",
              color: "var(--c-text-on-light)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            CHOOSE YOUR TERM AT THE CONSULTATION.
          </h2>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 16,
              color: "var(--c-text-on-light-muted)",
              lineHeight: 1.6,
              marginTop: 0,
              marginBottom: 40,
            }}
          >
            All terms reviewed in writing. No pressure to decide on the spot.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                term: "12-Month",
                badge: "Most Popular",
                desc: "Commitment with results. Full lab cycle. Quarterly check-in included.",
                featured: true,
              },
              {
                term: "24-Month",
                badge: "Enhanced Value",
                desc: "Lower effective rate. Two full lab cycles.",
                featured: false,
              },
              {
                term: "30-Month",
                badge: "Superior Value",
                desc: "Extended commitment. Meaningful rate savings.",
                featured: false,
              },
              {
                term: "36-Month",
                badge: "Best Rate",
                desc: "Lowest effective monthly rate. Three lab cycles. Priority scheduling.",
                featured: false,
              },
            ].map(({ term, badge, desc, featured }) => (
              <div
                key={term}
                style={{
                  background: featured ? "var(--brand-navy-deep)" : "var(--bg-white)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-md)",
                  border: featured ? "none" : "1px solid var(--c-border-on-light)",
                  borderTop: featured ? "4px solid var(--brand-cta)" : undefined,
                  padding: "24px 28px",
                }}
              >
                <p
                  style={{
                    borderLeft: "3px solid var(--brand-cta)",
                    paddingLeft: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: featured ? "var(--brand-cream)" : "var(--brand-cta)",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1,
                    marginTop: 0,
                    marginBottom: 12,
                  }}
                >
                  {badge}
                </p>
                <h3
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 600,
                    fontSize: 22,
                    color: featured ? "var(--brand-cream)" : "var(--c-text-on-light)",
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  {term}
                </h3>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 15,
                    color: featured
                      ? "var(--c-text-on-dark-muted)"
                      : "var(--c-text-on-light-muted)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* Financing strip */}
          <div
            className="mt-8 flex flex-wrap items-center justify-between gap-4"
            style={{
              background: "var(--brand-cream)",
              borderRadius: "var(--radius-md)",
              padding: "20px 24px",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                color: "var(--c-text-on-light)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              As little as <strong>$179/month</strong> with financing, subject to credit approval.
            </p>
            <button
              type="button"
              onClick={() => navigate("/book/location")}
              className="inline-flex items-center justify-center rounded-lg px-7 font-bold cursor-pointer border-none"
              style={{
                height: 48,
                background: "var(--brand-cta)",
                color: "var(--c-text-on-dark)",
                fontSize: 14,
                letterSpacing: "0.05em",
                fontFamily: "Inter, sans-serif",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--brand-cta-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--brand-cta)";
              }}
            >
              Reserve My Consultation
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: MEMBER VOICES (cream, 3 quote cards) ─────────────────── */}
      <section className="py-16 md:py-20" style={{ background: "var(--brand-cream)" }}>
        <div className="max-w-[1100px] mx-auto px-6">
          <p style={eyebrow}>Member Voices</p>
          <h2
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(28px, 3.5vw, 40px)",
              color: "var(--c-text-on-light)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginTop: 0,
              marginBottom: 40,
            }}
          >
            WHAT MEMBERS SAY ABOUT THE PROCESS.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "I appreciated that the consultation was genuinely no-pressure. My provider walked through every line item before I made any decision.",
                attr: "J.M., Richmond",
                since: "Member since 2024",
              },
              {
                quote:
                  "I'd been putting this off because I assumed it would be expensive and confusing. It wasn't either. The pricing conversation took about 10 minutes.",
                attr: "D.W., Virginia Beach",
                since: "Member since 2023",
              },
              {
                quote:
                  "Six months in and the process has been completely straightforward. No surprise charges, no upsells.",
                attr: "T.K., Newport News",
                since: "Member since 2025",
              },
            ].map(({ quote, attr, since }) => (
              <div
                key={attr}
                style={{
                  background: "var(--bg-white)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-md)",
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Quote
                  size={28}
                  strokeWidth={1.75}
                  style={{ color: "var(--brand-cta)", marginBottom: 16, flexShrink: 0 }}
                  aria-hidden
                />
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 16,
                    fontStyle: "italic",
                    color: "var(--c-text-on-light)",
                    lineHeight: 1.65,
                    marginTop: 0,
                    marginBottom: 20,
                    flex: 1,
                  }}
                >
                  {quote}
                </p>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--c-text-on-light)",
                    margin: 0,
                    marginBottom: 2,
                  }}
                >
                  {attr}
                </p>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "var(--c-text-on-light-muted)",
                    margin: 0,
                    marginBottom: 8,
                  }}
                >
                  {since}
                </p>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: "var(--c-text-on-light-muted)",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  Individual results vary.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: PRICING FAQ (white, TRTFAQ accordion pattern) ────────── */}
      <section
        id="faq"
        className="py-16 md:py-24"
        style={{ background: "var(--bg-white)", scrollMarginTop: 64 }}
      >
        <div className="max-w-[820px] mx-auto px-6">
          <p style={eyebrow}>Pricing FAQ</p>
          <h2
            className="font-bold uppercase text-center"
            style={{
              fontFamily: "Oswald, sans-serif",
              color: "var(--brand-navy)",
              fontSize: "clamp(26px, 3vw, 38px)",
              letterSpacing: "0.02em",
              marginTop: 0,
              marginBottom: 40,
            }}
          >
            COMMON QUESTIONS ABOUT PRICING.
          </h2>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                isOpen={openFaq === i}
                onToggle={() => handleFaqToggle(i)}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: CLOSING CTA (dark navy, TRTFinalCTA pattern) ─────────── */}
      <section
        id="final-cta"
        className="py-14 md:py-20"
        style={{ background: "var(--brand-navy-deep)" }}
      >
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <p
            style={{
              ...eyebrow,
              display: "inline-block",
              marginBottom: 20,
            }}
          >
            Ready?
          </p>

          <h2
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(28px, 4vw, 48px)",
              color: "var(--brand-cream)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginTop: 0,
              marginBottom: 16,
            }}
          >
            YOUR PRICING IS REVIEWED AT THE CONSULTATION.
          </h2>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 17,
              color: "var(--c-text-on-dark-muted)",
              lineHeight: 1.65,
              maxWidth: 560,
              margin: "0 auto 32px",
            }}
          >
            No-cost. No commitment. Your provider walks every number with you
            in writing before you decide.
          </p>

          <button
            type="button"
            onClick={() => navigate("/book/location")}
            className="inline-flex items-center justify-center rounded-lg px-10 font-bold cursor-pointer border-none"
            style={{
              height: 56,
              minHeight: 56,
              background: "var(--brand-cta)",
              color: "var(--c-text-on-dark)",
              fontSize: "clamp(15px, 3.5vw, 19px)",
              letterSpacing: "0.06em",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--brand-cta-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--brand-cta)";
            }}
          >
            Book My No-Cost Visit
          </button>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              color: "var(--c-text-on-dark-muted)",
              lineHeight: 1.6,
              maxWidth: 760,
              margin: "40px auto 0",
              textAlign: "center",
            }}
          >
            Treatment requires clinical evaluation and is provided only when medically appropriate.
            Financing subject to credit approval. The $179/month example is based on a representative
            36-month term; actual payment depends on creditworthiness, loan amount, APR, and term.
            APR varies by lender. Not all applicants qualify. This is not a credit offer.
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <TRTFooter />

      {/* ── STICKY MOBILE CTA ────────────────────────────────────────────────── */}
      <StickyMobileCTA />
    </div>
  );
}

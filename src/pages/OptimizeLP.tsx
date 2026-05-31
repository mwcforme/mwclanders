/**
 * /optimize — Men's Wellness Centers conversion landing page.
 *
 * Design principles:
 *   - Dark navy hero, cream/navy section alternation
 *   - Real photos from /assets/lp/, not stock
 *   - TRTHeroForm (real GHL-integrated form) in hero and bottom CTA
 *   - Copy is direct, specific, no corporate vagueness
 *   - Brand colors only: --brand-navy-deep, --brand-cream, --brand-cta
 */
import { lazy, Suspense, useState, useRef } from "react";
import {
  Check, X, Star, MapPin, Phone,
  Clock, FlaskConical, UserCheck, ClipboardList, ChevronDown, ShieldCheck, Award, CreditCard, Zap, Heart, Scale,
} from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { CredibilityBand } from "@/components/landing/trt/CredibilityBand";
import { TRTHeroForm } from "@/components/landing/trt/TRTHeroForm";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";
import { SEO } from "@/components/SEO";

const TRTFooter = lazy(() =>
  import("@/components/landing/trt/TRTFooter").then(m => ({ default: m.TRTFooter }))
);

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const NAVY   = "var(--brand-navy-deep)";   // #0B1029
const CREAM  = "var(--brand-cream)";        // #F5F0EB
const ORANGE = "var(--brand-cta)";          // #E8670A
const WHITE  = "#FFFFFF";

// ─── Copy ─────────────────────────────────────────────────────────────────────
const SYMPTOMS = [
  "Still tired at 10am after a full night's sleep.",
  "Your workouts stopped working six months ago.",
  "Your drive is low. You've noticed. She has too.",
  "Your doctor says everything looks normal. You don't feel normal.",
];

const WHY_US = [
  "Same Virginia provider every visit — not a rotating list of strangers",
  "Labs drawn on-site, results in the same visit, not a week later",
  "60-minute in-person evaluation — not a 10-minute telehealth call",
  "First visit — labs, evaluation, and review — at no cost to you",
  "Treatment only when clinically appropriate. We'll tell you if it's not.",
  "Follow-up labs and protocol adjustments are included — not billed as add-ons",
  "FSA and HSA accepted. No insurance games.",
];

const WHY_NOT = [
  "Shipping medications from a fulfillment center",
  "Clinicians who don't know you",
  "Subscription fees that auto-renew whether you improve or not",
  "Questionnaires that substitute for actual evaluation",
  "Pressure to start treatment before you've had a real conversation",
];

const REVIEWS = [
  {
    name: "Mark B.", location: "Richmond, VA",
    text: "Six months in and I finally feel like myself again. Energy is up, mood is stable, and I'm sleeping through the night for the first time in years.",
  },
  {
    name: "Clarke M.", location: "Virginia Beach, VA",
    text: "Been going about six months now. Way better energy, better workouts, sleeping straight through the night. Wish I'd done this years ago.",
  },
  {
    name: "Bobby M.", location: "Richmond, VA",
    text: "Always greeted by name. It feels like a personal visit, not a transaction. That matters when you're talking about this kind of stuff.",
  },
  {
    name: "James R.", location: "Richmond, VA",
    text: "Got my labs back and started treatment the same week. No runaround, no waiting months. They move fast and know what they're doing.",
  },
];

const FAQS = [
  {
    q: "How is this different from Hims, Hone, or an online TRT clinic?",
    a: "We're in-person only. Three centers in Virginia. You see the same licensed provider every time, your labs are drawn on-site and read that day, and your provider actually knows your case. No chatbots. No mail-order. No rotating staff.",
  },
  {
    q: "What happens at the first visit?",
    a: "It's 60 minutes. Labs drawn in our on-site CLIA-certified lab. Your provider goes through every number with you before you leave and explains what it means in straightforward terms. If treatment is appropriate, you walk out with a real protocol that day. If it's not appropriate, we'll tell you that too.",
  },
  {
    q: "What does this cost?",
    a: "Your first visit — labs, provider evaluation, and results review — is at no cost. If you start a treatment program, pricing is transparent and all-inclusive with no hidden fees. We accept FSA and HSA cards.",
  },
  {
    q: "How long before I feel anything?",
    a: "Some men notice changes in the first few weeks. Most see meaningful improvement by month two or three. Your provider tracks your labs and adjusts your protocol over time based on actual data, not a one-size-fits-all chart.",
  },
  {
    q: "Is testosterone therapy safe?",
    a: "TRT is FDA-approved for clinically low testosterone. Like any prescription treatment, it has potential side effects that your provider will review with you. Ongoing lab monitoring is built into every care plan so nothing gets missed.",
  },
];

const LOCATIONS_DATA = [
  { city: "Richmond",       addr: "4050 Innslake Dr, Suite 360", cityState: "Richmond, VA 23060",    phone: "(804) 346-4636", drive: "5 min from I-64",            key: "richmond" },
  { city: "Newport News",   addr: "12860 Jefferson Ave, Suite 203", cityState: "Newport News, VA 23602", phone: "(757) 806-6263", drive: "3 min from I-64, Exit 258A", key: "newport-news" },
  { city: "Virginia Beach", addr: "4252 Holland Rd, Suite 104",  cityState: "Virginia Beach, VA 23452", phone: "(757) 612-4428", drive: "5 min from I-264",            key: "virginia-beach" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ borderBottom: "1px solid #E5E3E0" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 16,
          padding: "22px 0", textAlign: "left",
          background: "none", border: "none", cursor: "pointer",
          minHeight: 56,
        }}
        aria-expanded={open}
        className="optimize-faq-btn"
      >
        <span style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(16px,3.5vw,19px)",
          textTransform: "uppercase", letterSpacing: "0.03em",
          color: "var(--brand-navy)", lineHeight: 1.25,
        }}>{q}</span>
        <ChevronDown
          size={20}
          style={{
            color: ORANGE, flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 240ms cubic-bezier(0.4,0,0.2,1)",
          }}
          aria-hidden
        />
      </button>
      {/* Smooth height animation via max-height + overflow */}
      <div
        ref={bodyRef}
        style={{
          overflow: "hidden",
          maxHeight: open ? 600 : 0,
          transition: open
            ? "max-height 320ms cubic-bezier(0.4,0,0.2,1)"
            : "max-height 240ms cubic-bezier(0.4,0,0.6,1)",
        }}
        aria-hidden={!open}
      >
        <p style={{
          fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.7,
          color: "var(--c-text-on-light-muted)", paddingBottom: 22,
        }}>{a}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OptimizeLP() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: NAVY }}>
      <SEO
        title="Men's Wellness Centers — Same-Day TRT, ED, and Weight Loss in Virginia"
        description="In-person testosterone therapy, ED treatment, and weight loss at 3 Virginia centers. No-cost 60-minute physician visit with same-day lab results."
      />

      <TRTHeader />

      {/* ── HERO ── navy bg, 2-col, real photo texture */}
      <section
        id="hero"
        style={{
          background: NAVY,
          paddingTop: 88, // clear fixed header
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grain */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05,
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "200px 200px",
        }} />
        {/* Orange glow under headline */}
        <div aria-hidden style={{
          position: "absolute", top: 80, left: "5%", width: "60%", height: 400,
          background: `radial-gradient(ellipse 70% 50% at 30% 40%, rgba(232,103,10,0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
          alignItems: "start", paddingBottom: 80,
        }} className="optimize-hero-grid">

          {/* Left: headline + proof */}
          <div style={{ paddingTop: 32, minWidth: 0 }}>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: ORANGE, marginBottom: 18,
              display: "flex", alignItems: "flex-start", gap: 6, flexWrap: "wrap",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <MapPin size={13} aria-hidden /> Virginia
              </span>
              <span aria-hidden style={{ opacity: 0.5 }}>·</span>
              <span style={{ flexShrink: 0 }}>Richmond</span>
              <span aria-hidden style={{ opacity: 0.5 }}>·</span>
              <span style={{ flexShrink: 0 }}>Newport News</span>
              <span aria-hidden style={{ opacity: 0.5 }}>·</span>
              <span style={{ flexShrink: 0 }}>Virginia Beach</span>
            </p>

            <h1 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: "clamp(36px, 6vw, 64px)", textTransform: "uppercase",
              color: WHITE, lineHeight: 1.02, marginBottom: 24,
              letterSpacing: "-0.01em",
            }}>
              Your labs came back normal.
              <span style={{ display: "block", color: ORANGE }}>You don't feel normal.</span>
            </h1>

            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 18, lineHeight: 1.65,
              color: "rgba(255,255,255,0.75)", maxWidth: 500, marginBottom: 32,
              overflowWrap: "break-word",
            }}>
              Three Virginia centers. One dedicated provider per visit. Labs drawn on-site and reviewed with you the same day.
            </p>

            {/* Services scope chips — rapid self-qualification for TRT/ED/Weight visitors */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24,
            }}>
              {[
                { icon: Zap,   label: "Testosterone Therapy" },
                { icon: Heart, label: "ED Treatment" },
                { icon: Scale, label: "Weight Management" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20,
                  background: "rgba(232,103,10,0.15)",
                  border: "1px solid rgba(232,103,10,0.35)",
                  fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
                  color: "rgba(255,255,255,0.80)", letterSpacing: "0.04em",
                }}>
                  <Icon size={12} style={{ color: ORANGE }} aria-hidden />
                  {label}
                </span>
              ))}
            </div>

            {/* Symptom list */}
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", marginBottom: 10,
            }}>Sound familiar?</p>
            <ul style={{ display: "grid", gap: 12, marginBottom: 28 }}>
              {SYMPTOMS.map(s => (
                <li key={s} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  fontFamily: "Inter, sans-serif", fontSize: 16,
                  color: "rgba(255,255,255,0.85)",
                  minWidth: 0,
                }}>
                  <span style={{
                    marginTop: 7, height: 6, width: 6, borderRadius: "50%",
                    background: ORANGE, flexShrink: 0,
                  }} aria-hidden />
                  <span style={{ minWidth: 0, overflowWrap: "break-word", flex: 1 }}>{s}</span>
                </li>
              ))}
            </ul>


            {/* Social proof bridge — connects symptom recognition to MWC's track record */}
            <div style={{
              marginBottom: 20, padding: "14px 16px", borderRadius: 10,
              background: "rgba(232,103,10,0.10)",
              border: "1px solid rgba(232,103,10,0.25)",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <Star size={15} style={{ color: ORANGE, flexShrink: 0, marginTop: 2, fill: ORANGE }} aria-hidden />
              <p style={{
                fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.55,
                color: "rgba(255,255,255,0.80)", margin: 0,
              }}>
                <strong style={{ color: WHITE }}>10,000+ Virginia men</strong> have addressed these exact concerns at Men's Wellness Centers since 2015.
              </p>
            </div>

            {/* Mobile-only tap-to-call strip — hidden on desktop via CSS */}
            <div className="optimize-call-strip" style={{ marginBottom: 0 }}>
              <p style={{
                fontFamily: "Inter, sans-serif", fontSize: 13,
                color: "rgba(255,255,255,0.55)", marginBottom: 6,
              }}>Prefer to call? We answer live.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                {LOCATIONS_DATA.map(loc => (
                  <a
                    key={loc.key}
                    href={`tel:${loc.phone.replace(/\D/g, "")}`}
                    className="optimize-phone-link"
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                      color: ORANGE, textDecoration: "none",
                    }}
                  >
                    <Phone size={13} style={{ color: ORANGE, flexShrink: 0 }} aria-hidden />
                    <span style={{ color: "rgba(255,255,255,0.65)" }}>{loc.city}: {loc.phone}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Right: hero form — id="hero-form" lets StickyMobileCTA observe and hide when form is in view */}
          <div id="hero-form">
            <TRTHeroForm service="trt" formId="hero-opt" />

            {/* Credential authority grid — 2×2 cards give each certification real visual weight */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
              marginTop: 16,
            }} role="list" aria-label="Credentials and certifications">
              {[
                { icon: FlaskConical, label: "CLIA-Certified Lab",       sub: "On-site hormone testing" },
                { icon: ShieldCheck,  label: "Virginia-Licensed",         sub: "Board-certified providers" },
                { icon: Award,        label: "FDA-Approved Treatments",   sub: "TRT, ED, and weight protocols" },
                { icon: CreditCard,   label: "FSA / HSA Accepted",        sub: "No insurance required" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} role="listitem" style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  padding: "10px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: "rgba(232,103,10,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={14} style={{ color: ORANGE }} aria-hidden />
                  </div>
                  <div>
                    <p style={{
                      fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
                      color: "rgba(255,255,255,0.88)", letterSpacing: "0.03em",
                      lineHeight: 1.3, margin: 0, marginBottom: 2,
                    }}>{label}</p>
                    <p style={{
                      fontFamily: "Inter, sans-serif", fontSize: 10,
                      color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.3,
                    }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* HIPAA privacy assurance */}
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 11,
              color: "rgba(255,255,255,0.40)", marginTop: 10, textAlign: "center",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              <ShieldCheck size={11} style={{ color: "rgba(255,255,255,0.40)", flexShrink: 0 }} aria-hidden />
              Your information is protected and never shared.
            </p>
          </div>
          {/* Scroll indicator — desktop only, prompts exploration below the fold */}
          <div className="optimize-scroll-hint" aria-hidden style={{
            textAlign: "center", paddingBottom: 24, opacity: 0.4,
          }}>
            <ChevronDown size={22} style={{ color: WHITE }} />
          </div>
        </div>
      </section>

      {/* ── CREDIBILITY BAND ── full-width stat strip */}
      <CredibilityBand />

      {/* ── WHY MWC ── cream bg */}
      <SectionReveal>
        <section style={{ background: CREAM, padding: "80px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--brand-cta-accessible)", marginBottom: 12,
            }}>What's different here</p>
            <h2 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: "clamp(28px,4vw,44px)", textTransform: "uppercase",
              color: "var(--brand-navy)", lineHeight: 1.08, marginBottom: 40,
            }}>
              In-person. Same provider.<br />Real labs. Same day.
            </h2>

            <div style={{
              display: "flex", flexDirection: "row",
              gap: 24, alignItems: "stretch",
            }} className="optimize-2col">
              {/* What you get */}
              <div style={{
                background: WHITE, borderRadius: 16,
                border: `2px solid ${ORANGE}`,
                padding: "32px 28px",
                boxShadow: "0 4px 24px rgba(232,103,10,0.12)",
                display: "flex", flexDirection: "column", flex: 1,
              }}>
                <div style={{ marginBottom: 20 }}>
                  <p style={{
                    fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: "var(--brand-navy)", marginBottom: 4,
                  }}>Men's Wellness Centers</p>
                  <p style={{
                    fontFamily: "Inter, sans-serif", fontSize: 12,
                    color: "var(--c-text-on-light-muted)", lineHeight: 1.4,
                  }}>Virginia state-licensed providers with men's health specialty training.</p>
                </div>
                <ul style={{ display: "grid", gap: 14 }}>
                  {WHY_US.map(line => (
                    <li key={line} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      fontFamily: "Inter, sans-serif", fontSize: 15,
                      fontWeight: 600, color: "var(--brand-navy)",
                      lineHeight: 1.4,
                    }}>
                      <Check size={17} style={{ color: "#047857", flexShrink: 0, marginTop: 2 }} strokeWidth={3} aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What you won't find */}
              <div style={{
                background: WHITE, borderRadius: 16,
                border: "1px solid #E5E3E0",
                padding: "32px 28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column", flex: 1,
              }}>
                <p style={{
                  fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--c-text-on-light-muted)", marginBottom: 20,
                }}>What you won't find here</p>
                <ul style={{ display: "grid", gap: 14 }}>
                  {WHY_NOT.map(line => (
                    <li key={line} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      fontFamily: "Inter, sans-serif", fontSize: 15,
                      color: "var(--c-text-on-light-muted)", lineHeight: 1.4,
                    }}>
                      <X size={16} style={{ color: "var(--c-text-on-light-muted)", flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bridge CTA — catches visitors convinced by comparison before Stats+Reviews scroll */}
            <div style={{
              marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <a
                href="#hero"
                className="optimize-mid-cta"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                  height: 50, padding: "0 32px", borderRadius: 10,
                  background: ORANGE, color: WHITE,
                  fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 700,
                  textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase",
                  boxShadow: "0 6px 24px rgba(232,103,10,0.30)",
                }}
              >
                Book Your No-Cost Visit
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <p style={{
                fontFamily: "Inter, sans-serif", fontSize: 12,
                color: "var(--c-text-on-light-muted)",
              }}>No obligation. Same-day and next-day slots available.</p>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── STATS + REVIEWS ── navy */}
      <SectionReveal>
        <section style={{ background: NAVY, padding: "80px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: ORANGE, marginBottom: 12,
            }}>The numbers</p>
            <h2 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: "clamp(28px,4vw,44px)", textTransform: "uppercase",
              color: WHITE, lineHeight: 1.08, marginBottom: 40,
            }}>10,000+ Virginia members since 2015.</h2>

            {/* Stats row */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56,
            }} className="optimize-stats">
              {[
                { n: "10,000+", l: "Virginia members" },
                { n: "4.9★",   l: "191 verified reviews" },
                { n: "3",      l: "Virginia centers" },
                { n: "Same Day", l: "Labs drawn & reviewed" },
              ].map(s => (
                <div key={s.l} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12, padding: "20px 16px", textAlign: "center",
                }}>
                  <p style={{
                    fontFamily: "Oswald, sans-serif", fontWeight: 700,
                    fontSize: "clamp(28px,4vw,36px)", color: ORANGE, lineHeight: 1,
                  }}>{s.n}</p>
                  <p style={{
                    fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)", marginTop: 8,
                  }}>{s.l}</p>
                </div>
              ))}
            </div>

            {/* Results timeline — sets expectation, reduces "how long until I feel it?" hesitation */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "8px 24px", marginBottom: 28,
            }}>
              {[
                { week: "Weeks 2-4", result: "Sleep and energy often improve first" },
                { week: "Months 2-3", result: "Most members see meaningful change" },
                { week: "6 months", result: "Full protocol optimization with follow-up labs" },
              ].map(item => (
                <span key={item.week} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: "Inter, sans-serif", fontSize: 12,
                  color: "rgba(255,255,255,0.70)",
                }}>
                  <span style={{
                    fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 13,
                    color: ORANGE, letterSpacing: "0.04em",
                  }}>{item.week}:</span>
                  {item.result}
                </span>
              ))}
            </div>

            {/* Reviews */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24,
            }} className="optimize-2col">
              {REVIEWS.map(r => (
                <figure key={r.name} style={{
                  background: WHITE, borderRadius: 14, padding: "22px 24px",
                  margin: 0, boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{ fill: ORANGE, color: ORANGE }} aria-hidden />)}
                  </div>
                  <blockquote style={{
                    fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.65,
                    color: "var(--brand-navy)", marginBottom: 14,
                    fontStyle: "normal",
                  }}>"{r.text}"</blockquote>
                  <figcaption style={{
                    fontFamily: "Inter, sans-serif", fontSize: 13,
                    color: "var(--c-text-on-light-muted)",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <span><strong style={{ color: "var(--brand-navy)" }}>{r.name}</strong>{" · "}{r.location}</span>
                    {/* Google verified badge — uses Google brand colors per brand guidelines */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 8px", borderRadius: 6,
                      /* hardcoded-color-allow: Google brand blue-50 background */
                      background: "#EFF6FF",
                      /* hardcoded-color-allow: Google brand blue-200 border */
                      border: "1px solid #BFDBFE",
                      width: "fit-content",
                    }}>
                      {/* Google G logo — hardcoded brand colors are required by Google brand guidelines */}
                      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      {/* hardcoded-color-allow: Google brand blue-700 */}
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1D4ED8" }}>Verified Google Review</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.50)" }}>
              Individual results vary. Reviews reflect member experiences.
            </p>

            {/* CTA after social proof peak — catch visitors persuaded by reviews before they continue scrolling */}
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <a
                href="#hero"
                className="optimize-mid-cta"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                  height: 56, padding: "0 40px", borderRadius: 10,
                  background: ORANGE, color: WHITE,
                  fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 700,
                  textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase",
                  boxShadow: "0 6px 24px rgba(232,103,10,0.35)",
                }}
              >
                Book Your No-Cost Visit
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <p style={{
                fontFamily: "Inter, sans-serif", fontSize: 13,
                color: "rgba(255,255,255,0.50)",
              }}>Labs drawn on-site. Results reviewed before you leave.</p>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── HOW IT WORKS ── cream */}
      <SectionReveal>
        <section style={{ background: CREAM, padding: "80px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--brand-cta-accessible)", marginBottom: 12,
            }}>What to expect</p>
            <h2 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: "clamp(28px,4vw,44px)", textTransform: "uppercase",
              color: "var(--brand-navy)", lineHeight: 1.08, marginBottom: 40,
            }}>Three steps. One visit.</h2>

            {/* Steps with visual connectors on desktop */}
            <div className="optimize-steps-wrapper" style={{
              display: "grid", gridTemplateColumns: "1fr 28px 1fr 28px 1fr", gap: 0, alignItems: "start",
            }}>
              {[
                {
                  n: "01", title: "Book your slot",
                  body: "Pick a center and a 60-minute window online. Same-day and next-day availability. Confirmation by text immediately.",
                  icon: Clock,
                },
                {
                  n: "02", title: "Labs on arrival",
                  body: "Full hormone panel drawn in our CLIA-certified on-site lab. No leaving for a separate lab visit. No waiting a week for results.",
                  icon: FlaskConical,
                },
                {
                  n: "03", title: "Your provider reviews everything",
                  body: "Sit down with a Virginia-licensed provider for 60 minutes. Every number explained clearly. Walk out with a protocol if treatment fits.",
                  icon: UserCheck,
                },
              ].flatMap((step, idx, arr) => [
                <div key={step.n} style={{
                  background: WHITE, borderRadius: 14,
                  border: "1px solid #E5E3E0",
                  padding: "28px 24px",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                }}>
                  <p style={{
                    fontFamily: "Oswald, sans-serif", fontWeight: 700,
                    fontSize: 56, color: ORANGE, lineHeight: 1, marginBottom: 16,
                  }}>{step.n}</p>
                  <step.icon size={22} style={{ color: "var(--brand-navy)", marginBottom: 12 }} aria-hidden />
                  <h3 style={{
                    fontFamily: "Oswald, sans-serif", fontWeight: 700,
                    fontSize: 20, textTransform: "uppercase",
                    color: "var(--brand-navy)", marginBottom: 10,
                  }}>{step.title}</h3>
                  <p style={{
                    fontFamily: "Inter, sans-serif", fontSize: 15,
                    color: "var(--c-text-on-light-muted)", lineHeight: 1.65,
                  }}>{step.body}</p>
                </div>,
                // Step connector arrow (hidden on mobile via CSS)
                idx < arr.length - 1 ? (
                  <div key={`connector-${idx}`} className="optimize-step-connector" aria-hidden style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    paddingTop: 64,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </div>
                ) : null,
              ])}
            </div>

            {/* Mid-page CTA — captures desktop visitors primed by the process steps */}
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <a
                href="#hero"
                className="optimize-mid-cta"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                  height: 56, padding: "0 40px", borderRadius: 10,
                  background: ORANGE, color: WHITE,
                  fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 700,
                  textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase",
                  boxShadow: "0 6px 24px rgba(232,103,10,0.35)",
                }}
              >
                Book Your No-Cost Visit
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <p style={{
                fontFamily: "Inter, sans-serif", fontSize: 13,
                color: "var(--c-text-on-light-muted)", marginTop: 10,
              }}>Same-day and next-day slots available. No insurance required.</p>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── LOCATIONS ── navy */}
      <SectionReveal>
        <section style={{ background: NAVY, padding: "80px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: ORANGE, marginBottom: 12,
            }}>Three Virginia centers</p>
            <h2 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: "clamp(28px,4vw,44px)", textTransform: "uppercase",
              color: WHITE, lineHeight: 1.08, marginBottom: 40,
            }}>Pick the one closest to you.</h2>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20,
            }} className="optimize-3col">
              {LOCATIONS_DATA.map(loc => (
                <div key={loc.city} style={{
                  background: WHITE, borderRadius: 14, overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
                }}>
                  <div style={{ padding: "22px 22px 18px" }}>
                    <p style={{
                      fontFamily: "Oswald, sans-serif", fontWeight: 700,
                      fontSize: 22, textTransform: "uppercase",
                      color: "var(--brand-navy)", marginBottom: 4,
                    }}>{loc.city}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "var(--c-text-on-light-muted)", marginBottom: 14 }}>
                      {loc.addr}<br />{loc.cityState}
                    </p>
                    <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "var(--brand-navy)", marginBottom: 4 }}>
                      <MapPin size={14} style={{ color: ORANGE }} aria-hidden /> {loc.drive}
                    </p>
                    <a href={`tel:${loc.phone.replace(/\D/g,"")}`} className="optimize-phone-link" style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>
                      <Phone size={14} style={{ color: ORANGE }} aria-hidden /> {loc.phone}
                    </a>
                  </div>
                  <div style={{ padding: "0 16px 16px" }}>
                    <a href="#hero"
                      className="optimize-loc-cta"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        height: 46, borderRadius: 8,
                        background: ORANGE, color: WHITE,
                        fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700,
                        textDecoration: "none", letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        boxShadow: "0 4px 16px rgba(232,103,10,0.35)",
                      }}
                    >
                      Book No-Cost Visit
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── FAQ ── cream */}
      <SectionReveal>
        <section style={{ background: CREAM, padding: "80px 0" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--brand-cta-accessible)", marginBottom: 12,
            }}>Before you book</p>
            <h2 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: "clamp(28px,4vw,40px)", textTransform: "uppercase",
              color: "var(--brand-navy)", lineHeight: 1.08, marginBottom: 32,
            }}>Straight answers.</h2>
            <div style={{
              background: WHITE, borderRadius: 16, padding: "8px clamp(16px, 5vw, 28px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              border: "1px solid #E5E3E0",
            }}>
              {FAQS.map((f, i) => (
                <FAQItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
              ))}
              {/* Post-FAQ micro-CTA — captures visitors who read through all answers */}
              <div style={{
                padding: "20px 0 4px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 12,
              }}>
                <p style={{
                  fontFamily: "Inter, sans-serif", fontSize: 14,
                  color: "var(--c-text-on-light-muted)",
                }}>
                  Still have questions? We answer live.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {LOCATIONS_DATA.slice(0, 1).map(loc => (
                    <a
                      key={loc.key}
                      href={`tel:${loc.phone.replace(/\D/g, "")}`}
                      className="optimize-phone-link"
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600,
                        color: ORANGE, textDecoration: "none",
                      }}
                    >
                      <Phone size={14} style={{ color: ORANGE }} aria-hidden />
                      {loc.phone}
                    </a>
                  ))}
                  <a href="#hero" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    height: 38, padding: "0 18px", borderRadius: 8,
                    background: ORANGE, color: WHITE,
                    fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700,
                    textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase",
                  }}>Book Visit</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── FINAL CTA ── navy with form */}
      <SectionReveal>
        <section id="final-cta" style={{ background: NAVY, padding: "80px 0" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: ORANGE, marginBottom: 12,
            }}>Start here</p>
            <h2 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: "clamp(28px,4vw,44px)", textTransform: "uppercase",
              color: WHITE, lineHeight: 1.08, marginBottom: 12,
            }}>Reserve your no-cost visit.</h2>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 16,
              color: "rgba(255,255,255,0.60)", marginBottom: 24,
            }}>
              60 minutes. Labs on-site. Results reviewed before you leave.
            </p>

            {/* What's included — visual breakdown removes price/commitment anxiety */}
            <div style={{
              display: "flex", justifyContent: "center", flexWrap: "wrap",
              gap: "12px 24px", marginBottom: 32,
            }}>
              {[
                { icon: FlaskConical, label: "Full hormone panel" },
                { icon: UserCheck,    label: "60-min provider eval" },
                { icon: ClipboardList,label: "Results before you leave" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                  color: "rgba(255,255,255,0.80)",
                }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: "50%",
                    background: "rgba(232,103,10,0.18)",
                    flexShrink: 0,
                  }}>
                    <Icon size={14} style={{ color: ORANGE }} aria-hidden />
                  </span>
                  {label}
                </span>
              ))}
            </div>

            {/* Provider authority strip — removes "is this a real doctor?" hesitation at peak intent */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "14px 16px", borderRadius: 10, marginBottom: 20,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              textAlign: "left",
            }}>
              <UserCheck size={20} style={{ color: ORANGE, flexShrink: 0, marginTop: 2 }} aria-hidden />
              <p style={{
                fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.6,
                color: "rgba(255,255,255,0.72)", margin: 0,
              }}>
                <strong style={{ color: WHITE }}>Virginia Board of Medicine licensed providers.</strong>{" "}
                No chatbots. No physician assistants standing in for a doctor. A licensed clinician who specializes in men's health reviews your labs and your case - personally, every visit.
              </p>
            </div>

            <TRTHeroForm service="trt" formId="cta-opt" />

            {/* Risk-reversal micro-copy */}
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 12,
              color: "rgba(255,255,255,0.40)", marginTop: 16,
            }}>
              No obligation. No pressure. If treatment is not right for you, your provider will tell you.
            </p>
          </div>
        </section>
      </SectionReveal>

      <Suspense fallback={null}>
        <TRTFooter />
      </Suspense>

      <StickyMobileCTA />
      {/* Extra bottom clearance so sticky CTA never covers last content */}
      <div className="md:hidden" style={{ height: 120 }} aria-hidden />

      {/* Responsive grid collapse */}
      <style>{`
        @media (max-width: 767px) {
          .optimize-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .optimize-2col      { grid-template-columns: 1fr !important; flex-direction: column !important; }
          .optimize-3col      { grid-template-columns: 1fr !important; }
          .optimize-stats     { grid-template-columns: 1fr 1fr !important; }
        }
        /* Show tap-to-call strip on mobile, hide on desktop */
        .optimize-call-strip { display: none; }
        @media (max-width: 767px) {
          .optimize-call-strip { display: block; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.10); }
        }
        /* Scroll hint animation — desktop only; disabled for reduced-motion preference */
        @keyframes optimize-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .optimize-scroll-hint { animation: optimize-bounce 2s ease-in-out infinite; }
        }
        @media (max-width: 767px) {
          .optimize-scroll-hint { display: none; }
        }
        .optimize-hero-grid { padding-bottom: 80px; }
        .optimize-loc-cta:hover { opacity: 0.88; transform: translateY(-1px); }
        .optimize-loc-cta { transition: opacity 150ms, transform 150ms; }
        .optimize-mid-cta:hover { opacity: 0.88; transform: translateY(-1px); }
        .optimize-mid-cta { transition: opacity 150ms, transform 150ms; }
        /* Step connectors: show on desktop, collapse on mobile */
        .optimize-step-connector { display: flex; }
        @media (max-width: 767px) {
          .optimize-steps-wrapper {
            grid-template-columns: 1fr !important;
          }
          .optimize-step-connector { display: none !important; }
        }
        /* Focus-visible rings for keyboard navigation */
        .optimize-faq-btn:focus-visible {
          outline: 2px solid var(--brand-cta);
          outline-offset: 3px;
          border-radius: 4px;
        }
        .optimize-faq-btn:hover {
          background: rgba(232,103,10,0.04);
          border-radius: 6px;
        }
        .optimize-mid-cta:focus-visible,
        .optimize-loc-cta:focus-visible {
          outline: 3px solid var(--brand-cta);
          outline-offset: 4px;
        }
        .optimize-mid-cta:active,
        .optimize-loc-cta:active {
          opacity: 0.82;
          transform: scale(0.97) translateY(0);
          transition: opacity 80ms, transform 80ms;
        }
        /* Phone link interaction states */
        .optimize-phone-link {
          transition: opacity 150ms;
        }
        .optimize-phone-link:hover {
          opacity: 0.78;
          text-decoration: underline;
        }
        .optimize-phone-link:active {
          opacity: 0.60;
        }
        .optimize-phone-link:focus-visible {
          outline: 2px solid var(--brand-cta);
          outline-offset: 3px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

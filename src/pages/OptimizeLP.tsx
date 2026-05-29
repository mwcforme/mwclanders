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
import { lazy, Suspense, useState } from "react";
import {
  Check, X, Star, MapPin, Phone,
  Clock, FlaskConical, UserCheck, ClipboardList, ChevronDown,
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
            transition: "transform 220ms ease",
          }}
          aria-hidden
        />
      </button>
      {open && (
        <p style={{
          fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.7,
          color: "var(--c-text-on-light-muted)", paddingBottom: 22,
        }}>{a}</p>
      )}
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
              Men's Wellness Centers is Virginia's in-person men's health practice. Three locations. A licensed provider who draws your labs on-site, reads them with you, and gives you a real answer the same visit.
            </p>

            {/* Symptom list */}
            <ul style={{ display: "grid", gap: 12, marginBottom: 36 }}>
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


          </div>

          {/* Right: hero form — no outer wrapper, form card is self-contained */}
          <div>
            <TRTHeroForm service="trt" formId="hero-opt" />
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
                <p style={{
                  fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--brand-navy)", marginBottom: 20,
                }}>Men's Wellness Centers</p>
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
                    display: "flex", flexDirection: "column", gap: 4,
                  }}>
                    <span><strong style={{ color: "var(--brand-navy)" }}>{r.name}</strong>{" · "}{r.location}</span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 600, color: "#1a73e8",
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden fill="none" stroke="#1a73e8" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Verified Google Review
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.50)" }}>
              Individual results vary. Reviews reflect member experiences.
            </p>
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

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20,
            }} className="optimize-3col">
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
              ].map(step => (
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
                </div>
              ))}
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
                    <a href={`tel:${loc.phone.replace(/\D/g,"")}`} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>
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
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── FINAL CTA ── navy with form */}
      <SectionReveal>
        <section id="final-cta" style={{ background: NAVY, padding: "80px 0" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
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
              color: "rgba(255,255,255,0.60)", marginBottom: 32,
            }}>
              60 minutes. Labs on-site. Results reviewed before you leave.
            </p>
            <TRTHeroForm service="trt" formId="cta-opt" />
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
        .optimize-hero-grid { padding-bottom: 80px; }
        .optimize-loc-cta:hover { opacity: 0.88; transform: translateY(-1px); }
        .optimize-loc-cta { transition: opacity 150ms, transform 150ms; }
        .optimize-phone-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

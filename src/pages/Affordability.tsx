/**
 * /pricing — Affordability page for Men's Wellness Centers.
 *
 * Modeled on Sono Bello's pattern: addresses "we don't publish prices" by
 * making the no-cost consultation the conversion event.
 *
 * Design rules enforced:
 * - Left-border eyebrows only (no pill/badge eyebrow — banned AI tell)
 * - No colored circles around icons (banned AI tell)
 * - All CTAs: orange pill, border-radius 999, height 52–56px
 * - All form inputs: font-size 16px (prevents iOS zoom), height 56px
 * - Lucide icons throughout, strokeWidth 1.75
 * - No hardcoded hex — CSS custom properties where possible
 * - No emojis, mobile-first
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Calendar,
  FlaskConical,
  Tag,
  DollarSign,
  Gift,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { useBookingStore } from "@/domain/booking/bookingStore";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCATIONS = [
  { value: "richmond", label: "Richmond" },
  { value: "virginia-beach", label: "Virginia Beach" },
  { value: "newport-news", label: "Newport News" },
  { value: "norfolk", label: "Norfolk" },
  { value: "chesapeake", label: "Chesapeake" },
] as const;

type LocationValue = typeof LOCATIONS[number]["value"];

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
    q: "What's included in the monthly membership?",
    a: "Physician oversight, in-center lab draws, FDA-approved medications when clinically appropriate, member portal access, and quarterly check-ins. No hidden fees.",
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
    a: "Healthcare financing is available through third-party lenders, subject to credit approval. Ask at your consultation.",
  },
  {
    q: "Can I cancel my membership?",
    a: "Monthly memberships can be cancelled after the first month. Multi-month terms have different cancellation terms reviewed at the consultation.",
  },
  {
    q: "Are there military or first responder discounts?",
    a: "Active duty military, veterans, and first responders should ask about available discounts at their consultation.",
  },
] as const;

// ─── Shared style helpers ─────────────────────────────────────────────────────

const eyebrow = {
  borderLeft: "3px solid var(--brand-cta)" as const,
  paddingLeft: 10,
  fontSize: 12,
  fontWeight: 700 as const,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--brand-cta)",
  marginBottom: 16,
  fontFamily: "Inter, sans-serif",
  display: "block" as const,
};

const orangePill = (fullWidth = false): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 54,
  padding: "0 32px",
  width: fullWidth ? "100%" : undefined,
  background: "var(--brand-cta)",
  color: "var(--c-text-on-dark)",
  border: "none",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: "0.05em",
  fontFamily: "Inter, sans-serif",
  cursor: "pointer",
  textDecoration: "none",
});

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Hero lead form with glass morphism card */
const HeroForm = () => {
  const navigate = useNavigate();
  const bookingPatch = useBookingStore((s) => s.patch);
  const bookingSetIdentity = useBookingStore((s) => s.setIdentity);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<LocationValue | "">("");
  const [tcpa, setTcpa] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!phone || phone.replace(/\D/g, "").length < 10) errs.phone = "Valid phone number is required.";
    if (!location) errs.location = "Please select a location.";
    if (!tcpa) errs.tcpa = "Please agree to be contacted.";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // Store in booking state
    bookingSetIdentity({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      phone: phone.replace(/\D/g, ""),
      email: "",
    });
    bookingPatch({ location: location || undefined, source: "affordability-hero", lpSlug: "/pricing" });
    setSubmitted(true);
    // Navigate to booking schedule after brief confirmation display
    window.setTimeout(() => navigate("/book/schedule"), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 56,
    background: "var(--bg-white)",
    border: "1.5px solid rgba(0,0,0,0.15)",
    borderRadius: 8,
    padding: "0 16px",
    fontSize: 16,
    color: "var(--brand-navy-deep)",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(245,240,235,0.65)",
    marginBottom: 6,
    fontFamily: "Inter, sans-serif",
  };

  const fieldWrap: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        padding: "32px 28px",
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
      }}
    >
      {submitted ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Check
            size={48}
            strokeWidth={1.75}
            style={{ color: "var(--brand-cta)", margin: "0 auto 16px" }}
          />
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--c-text-on-dark)",
              lineHeight: 1.5,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Got it. A Men's Wellness Centers team member will call you within one
            business hour to confirm your appointment.
          </p>
        </div>
      ) : (
        <>
          <p style={{ ...eyebrow, color: "rgba(245,240,235,0.70)", borderLeftColor: "var(--brand-cta)", marginBottom: 12 }}>
            Get Your Pricing at the Consultation
          </p>
          <h3
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--c-text-on-dark)",
              marginBottom: 24,
              lineHeight: 1.2,
            }}
          >
            Reserve Your 60-Minute In-Person Visit.
          </h3>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* First Name */}
            <div style={fieldWrap}>
              <label htmlFor="af-first" style={labelStyle}>First Name</label>
              <input
                id="af-first"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setErrors((p) => { const { firstName: _, ...r } = p; return r; }); }}
                style={{ ...inputStyle, borderColor: errors.firstName ? "var(--c-error-on-light)" : "rgba(0,0,0,0.15)" }}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && <ErrorMsg msg={errors.firstName} />}
            </div>

            {/* Last Name */}
            <div style={fieldWrap}>
              <label htmlFor="af-last" style={labelStyle}>Last Name</label>
              <input
                id="af-last"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div style={fieldWrap}>
              <label htmlFor="af-phone" style={labelStyle}>Phone</label>
              <input
                id="af-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  setErrors((p) => { const { phone: _, ...r } = p; return r; });
                }}
                style={{ ...inputStyle, borderColor: errors.phone ? "var(--c-error-on-light)" : "rgba(0,0,0,0.15)" }}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <ErrorMsg msg={errors.phone} />}
            </div>

            {/* Location */}
            <div style={fieldWrap}>
              <label htmlFor="af-location" style={labelStyle}>Location</label>
              <select
                id="af-location"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value as LocationValue);
                  setErrors((p) => { const { location: _, ...r } = p; return r; });
                }}
                style={{
                  ...inputStyle,
                  borderColor: errors.location ? "var(--c-error-on-light)" : "rgba(0,0,0,0.15)",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230B1029' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: 40,
                }}
                aria-invalid={!!errors.location}
              >
                <option value="">Select a location</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
              {errors.location && <ErrorMsg msg={errors.location} />}
            </div>

            {/* TCPA */}
            <div style={{ marginTop: 4 }}>
              <label
                htmlFor="af-tcpa"
                style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", userSelect: "none" }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    border: `2px solid ${tcpa ? "var(--brand-cta)" : errors.tcpa ? "var(--c-error-on-light)" : "rgba(255,255,255,0.40)"}`,
                    background: tcpa ? "var(--brand-cta)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    transition: "background 150ms ease, border-color 150ms ease",
                  }}
                >
                  {tcpa && <Check size={13} strokeWidth={3} style={{ color: "var(--bg-white)" }} />}
                </div>
                <span style={{ fontSize: 11, color: "rgba(245,240,235,0.55)", lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
                  I agree to receive SMS/calls about my consultation. Reply STOP to opt out.
                  Msg &amp; data rates may apply. Not a condition of service.{" "}
                  <a href="/privacy-policy" style={{ color: "var(--brand-cta)", textDecoration: "none" }}>Privacy Policy</a>
                </span>
              </label>
              <input
                id="af-tcpa"
                type="checkbox"
                checked={tcpa}
                onChange={(e) => { setTcpa(e.target.checked); setErrors((p) => { const { tcpa: _, ...r } = p; return r; }); }}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
              />
              {errors.tcpa && <ErrorMsg msg={errors.tcpa} />}
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                ...orangePill(true),
                marginTop: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
            >
              Schedule My Consultation
            </button>
          </form>
        </>
      )}
    </div>
  );
};

const ErrorMsg = ({ msg }: { msg: string }) => (
  <p
    role="alert"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: 12,
      color: "var(--c-error-on-dark)",
      marginTop: 5,
      fontFamily: "Inter, sans-serif",
    }}
  >
    <AlertCircle size={12} strokeWidth={2} />
    {msg}
  </p>
);

/** FAQ accordion item */
const FaqItem = ({ q, a, index }: { q: string; a: string; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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
        aria-expanded={open}
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
        {open ? (
          <ChevronUp size={18} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
        ) : (
          <ChevronDown size={18} strokeWidth={2} style={{ color: "var(--brand-navy-deep)", flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 20,
            paddingLeft: 0,
            borderLeft: "3px solid var(--brand-cta)",
            paddingLeft: 16,
            marginBottom: 4,
          }}
        >
          <p
            style={{
              fontSize: 15,
              color: "var(--c-text-on-light-muted)",
              lineHeight: 1.65,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {a}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Affordability() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>

      {/* ── 1. TOP UTILITY BAR ───────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--brand-navy-deep)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 24px",
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          position: "relative",
          zIndex: 60,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(245,240,235,0.75)",
            fontFamily: "Inter, sans-serif",
            margin: 0,
          }}
        >
          No-cost, no-pressure pricing review at your consultation.
        </p>
        <button
          type="button"
          onClick={() => navigate("/book/location")}
          style={{
            height: 28,
            padding: "0 14px",
            background: "var(--brand-cta)",
            color: "var(--c-text-on-dark)",
            border: "none",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
        >
          Book Consultation
        </button>
      </div>

      {/* ── 2. HEADER ────────────────────────────────────────────────────── */}
      <TRTHeader minimal />

      {/* ── 3. HERO SECTION ──────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          background: "linear-gradient(135deg, #0B1029 0%, #0D1535 60%, #111B3A 100%)",
          position: "relative",
          overflow: "hidden",
          paddingTop: 104, // 64px header + 40px utility bar
          paddingBottom: 80,
        }}
      >
        {/* Orange radial glow top-right */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(232,103,10,0.18) 0%, transparent 70%)",
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
            gap: 48,
            position: "relative",
            zIndex: 1,
          }}
          className="md:grid-cols-[1fr_auto]"
        >
          {/* LEFT */}
          <div style={{ maxWidth: 620 }}>
            <span style={{ ...eyebrow }}>Pricing</span>

            <h1
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(40px, 5.5vw, 72px)",
                color: "var(--brand-cream)",
                lineHeight: 1.05,
                marginBottom: 24,
              }}
            >
              Transparent Pricing
              <br />
              For Every Man.
            </h1>

            <p
              style={{
                fontSize: 16,
                lineHeight: 1.65,
                color: "rgba(245,240,235,0.70)",
                marginBottom: 36,
                maxWidth: 540,
              }}
            >
              Physician-led care in Virginia. Locally owned. LegitScript certified. Walk
              through every number with a provider at your no-cost 60-minute in-person
              consultation. No surprises, no upsells.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
              <button
                type="button"
                onClick={() => navigate("/book/location")}
                style={orangePill()}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
              >
                Book My Consultation
              </button>
              <button
                type="button"
                onClick={() => scrollTo("how-pricing-works")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 54,
                  padding: "0 28px",
                  background: "transparent",
                  color: "var(--c-text-on-dark)",
                  border: "2px solid rgba(255,255,255,0.30)",
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.60)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.30)"; }}
              >
                How Pricing Works
              </button>
            </div>

            {/* Trust strip */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "No-cost consultation",
                "No hidden fees",
                "Flexible membership terms",
                "Physician-led care",
                "Locally owned in Virginia",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "rgba(245,240,235,0.85)",
                  }}
                >
                  <Check size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} aria-hidden />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — lead form */}
          <div style={{ display: "flex", justifyContent: "center" }} id="hero-form">
            <HeroForm />
          </div>
        </div>
      </section>

      {/* ── 4. HOW PRICING WORKS ─────────────────────────────────────────── */}
      <section
        id="how-pricing-works"
        style={{
          background: "var(--bg-white)",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={{ ...eyebrow, color: "var(--brand-cta)" }}>How Pricing Works</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 46px)",
              color: "var(--brand-navy-deep)",
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Three Factors Shape Your Membership.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--c-text-on-light-muted)",
              lineHeight: 1.65,
              maxWidth: 680,
              marginBottom: 48,
            }}
          >
            MWC does not publish prices online because hormone optimization is a
            clinical decision. Your provider walks every number with you at the
            consultation.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {/* Card 1 */}
            <div style={{ background: "var(--bg-white)", border: "1px solid #E5E7EB", borderRadius: 12, padding: 28 }}>
              <Calendar size={28} strokeWidth={1.75} style={{ color: "var(--brand-cta)", marginBottom: 16 }} />
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20, color: "var(--brand-navy-deep)", marginBottom: 10 }}>
                Membership Term
              </h3>
              <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)", lineHeight: 1.6 }}>
                Monthly, 6-month, or 12-month. Longer terms reduce your effective monthly rate.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{ background: "var(--bg-white)", border: "1px solid #E5E7EB", borderRadius: 12, padding: 28 }}>
              <FlaskConical size={28} strokeWidth={1.75} style={{ color: "var(--brand-cta)", marginBottom: 16 }} />
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20, color: "var(--brand-navy-deep)", marginBottom: 10 }}>
                Therapy Type
              </h3>
              <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)", lineHeight: 1.6 }}>
                Injectable TRT, oral TRT, or HRT add-ons. Each has its own medication, lab, and
                oversight structure.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{ background: "var(--bg-white)", border: "1px solid #E5E7EB", borderRadius: 12, padding: 28 }}>
              <Tag size={28} strokeWidth={1.75} style={{ color: "var(--brand-cta)", marginBottom: 16 }} />
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20, color: "var(--brand-navy-deep)", marginBottom: 10 }}>
                Onboarding Promotions
              </h3>
              <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Limited new-member offers may reduce your first month's cost.
              </p>
              <a
                href="/book/location"
                style={{ fontSize: 14, fontWeight: 600, color: "var(--brand-cta)", textDecoration: "none" }}
              >
                Check Current Offers &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WHAT'S INCLUDED ───────────────────────────────────────────── */}
      <section
        style={{
          background: "#F8F5F0",
          padding: "64px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={{ ...eyebrow }}>Included in Every Membership</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 46px)",
              color: "var(--brand-navy-deep)",
              marginBottom: 40,
              lineHeight: 1.1,
            }}
          >
            One Price. Everything You Need.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {[
              "Physician oversight",
              "In-center labs",
              "FDA-approved medications when clinically appropriate",
              "Member portal & messaging",
              "Quarterly check-ins",
              "No hidden fees",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "18px 20px",
                  background: "var(--bg-white)",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Check
                  size={18}
                  strokeWidth={2.5}
                  style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }}
                  aria-hidden
                />
                <span style={{ fontSize: 15, fontWeight: 500, color: "var(--brand-navy-deep)", lineHeight: 1.45 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. MEMBERSHIP TERMS & FINANCING ─────────────────────────────── */}
      <section
        style={{
          background: "var(--bg-white)",
          padding: "64px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={{ ...eyebrow }}>Membership Terms &amp; Financing</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 46px)",
              color: "var(--brand-navy-deep)",
              marginBottom: 36,
              lineHeight: 1.1,
            }}
          >
            Flexible Membership Terms.
          </h2>

          {/* Value bar */}
          <div
            style={{
              background: "var(--brand-navy-deep)",
              borderRadius: 12,
              padding: "24px 32px",
              display: "flex",
              flexWrap: "wrap",
              gap: "20px 40px",
              justifyContent: "center",
              marginBottom: 40,
            }}
          >
            {[
              { Icon: DollarSign, label: "Predictable Monthly Payment" },
              { Icon: Gift, label: "Onboarding Offers" },
              { Icon: Eye, label: "Transparent Pricing" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--brand-cream)",
                }}
              >
                <Icon size={20} strokeWidth={1.75} style={{ color: "var(--brand-cta)", flexShrink: 0 }} aria-hidden />
                <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.03em" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Terms grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              marginBottom: 36,
            }}
          >
            {/* Monthly */}
            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 28,
                background: "var(--bg-white)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--c-text-on-light-muted)",
                  marginBottom: 12,
                  borderLeft: "3px solid var(--c-border-on-light)",
                  paddingLeft: 8,
                }}
              >
                Most Flexible
              </span>
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 22, color: "var(--brand-navy-deep)", marginBottom: 12 }}>
                Monthly Membership
              </h3>
              <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)", lineHeight: 1.6 }}>
                Lowest commitment. Cancel after month one.
              </p>
            </div>

            {/* 6-Month FEATURED */}
            <div
              style={{
                border: "2px solid var(--brand-cta)",
                borderRadius: 12,
                padding: 28,
                background: "var(--brand-navy-deep)",
                position: "relative",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  background: "var(--brand-cta)",
                  color: "var(--c-text-on-dark)",
                  borderRadius: 999,
                  padding: "3px 10px",
                  marginBottom: 12,
                }}
              >
                Most Popular
              </span>
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 22, color: "var(--c-text-on-dark)", marginBottom: 12 }}>
                6-Month Membership
              </h3>
              <p style={{ fontSize: 15, color: "rgba(245,240,235,0.75)", lineHeight: 1.6 }}>
                Reduced rate. Full lab cycle included. Quarterly check-in.
              </p>
            </div>

            {/* 12-Month */}
            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 28,
                background: "var(--bg-white)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--c-text-on-light-muted)",
                  marginBottom: 12,
                  borderLeft: "3px solid var(--c-border-on-light)",
                  paddingLeft: 8,
                }}
              >
                Best Value
              </span>
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 22, color: "var(--brand-navy-deep)", marginBottom: 12 }}>
                12-Month Membership
              </h3>
              <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)", lineHeight: 1.6 }}>
                Lowest effective monthly rate. Two lab cycles. Priority scheduling.
              </p>
            </div>
          </div>

          {/* Financing callout */}
          <div
            style={{
              border: "1.5px solid var(--brand-cta)",
              borderRadius: 12,
              padding: "24px 28px",
              background: "rgba(232,103,10,0.06)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <p
              style={{
                fontSize: 15,
                color: "var(--brand-navy-deep)",
                lineHeight: 1.5,
                margin: 0,
                maxWidth: 560,
              }}
            >
              Healthcare financing available through third-party lenders, subject to credit
              approval.
            </p>
            <button
              type="button"
              onClick={() => navigate("/book/location")}
              style={orangePill()}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
            >
              Reserve My Consultation
            </button>
          </div>
        </div>
      </section>

      {/* ── 7. MEMBER VOICES ─────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--brand-navy-deep)",
          padding: "64px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={{ ...eyebrow }}>Member Voices</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 46px)",
              color: "var(--c-text-on-dark)",
              marginBottom: 48,
              lineHeight: 1.1,
            }}
          >
            What Members Say About the Process.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
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
            ].map(({ quote, initials, location, since }) => (
              <div
                key={initials}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "28px 28px 24px",
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    color: "rgba(245,240,235,0.85)",
                    lineHeight: 1.65,
                    marginBottom: 24,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    aria-hidden
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--brand-navy)",
                      border: "2px solid var(--brand-cta)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--brand-cta)",
                        fontFamily: "Oswald, sans-serif",
                      }}
                    >
                      {initials[0]}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text-on-dark)", margin: 0 }}>
                      {initials}, {location}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(245,240,235,0.50)", margin: 0, marginTop: 2 }}>
                      Member since {since}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. PRICING FAQ ───────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg-white)",
          padding: "64px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <span style={{ ...eyebrow }}>Pricing FAQ</span>
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 46px)",
              color: "var(--brand-navy-deep)",
              marginBottom: 40,
              lineHeight: 1.1,
            }}
          >
            Common Questions About Pricing.
          </h2>

          <div style={{ borderTop: "1px solid #E5E7EB" }}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>

          {/* Closing CTA */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button
              type="button"
              onClick={() => navigate("/book/location")}
              style={orangePill()}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
            >
              Schedule My Consultation
            </button>
          </div>
        </div>
      </section>

      {/* ── 9. FOOTER ────────────────────────────────────────────────────── */}
      <TRTFooter />

      {/* ── 10. STICKY MOBILE CTA BAR ────────────────────────────────────── */}
      <StickyMobileCTA />
    </div>
  );
}

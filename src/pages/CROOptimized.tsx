/**
 * CROOptimized — /cro-op route
 *
 * Conversion-optimized landing page for paid media.
 * No header nav (eliminates exit paths).
 * Hero form includes email for retargeting.
 * 15 CRO improvements applied over the root LP.
 */

import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2, MapPin, Check, Phone, User, AlertCircle, ArrowRight,
  Star, Mail, ChevronRight,
} from "lucide-react";

import { heroLeadSchema, emailField, type HeroLeadInput } from "@/domain/leads/leadFormSchema";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { PHONE } from "@/lib/constants";
import { type FaqItem } from "@/data/faqs";

import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { TRTHero }              from "@/components/landing/trt/TRTHero";
import { TRTManifesto }         from "@/components/landing/trt/TRTManifesto";
import { TRTThreeProblems }     from "@/components/landing/trt/TRTThreeProblems";
import { TRTEverythingIncluded } from "@/components/landing/trt/TRTEverythingIncluded";
import { SectionReveal }        from "@/components/landing/trt/SectionReveal";
import { StickyMobileCTA }      from "@/components/landing/trt/StickyMobileCTA";
import { SEO }                  from "@/components/SEO";

const TRTHowItWorks = lazy(() =>
  import("@/components/landing/trt/TRTHowItWorks").then((m) => ({ default: m.TRTHowItWorks }))
);
const TRTResults = lazy(() =>
  import("@/components/landing/trt/TRTResults").then((m) => ({ default: m.TRTResults }))
);
const TRTPillars = lazy(() =>
  import("@/components/landing/trt/TRTPillars").then((m) => ({ default: m.TRTPillars }))
);
const TRTMarquee = lazy(() =>
  import("@/components/landing/trt/TRTMarquee").then((m) => ({ default: m.TRTMarquee }))
);
const TRTLocations = lazy(() =>
  import("@/components/landing/trt/TRTLocations").then((m) => ({ default: m.TRTLocations }))
);
const TRTFAQ = lazy(() =>
  import("@/components/landing/trt/TRTFAQ").then((m) => ({ default: m.TRTFAQ }))
);

// ─── Schema ───────────────────────────────────────────────────────────────────

const croHeroLeadSchema = heroLeadSchema.extend({ email: emailField });
type CROHeroLeadInput = z.infer<typeof croHeroLeadSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const ERR_RED = "#DC2626";
const NAVY    = "var(--brand-navy-deep)";
const WHITE   = "var(--bg-white)";

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const VALID_LOCATIONS = ["richmond", "virginia-beach", "newport-news"] as const;
type LocationKey = typeof VALID_LOCATIONS[number];

const LOCATIONS: { key: LocationKey; label: string }[] = [
  { key: "richmond",       label: "Richmond"      },
  { key: "virginia-beach", label: "Virginia Beach" },
  { key: "newport-news",   label: "Newport News"   },
];

function getLocationFromUrl(): LocationKey | "" {
  if (typeof window === "undefined") return "";
  const p = new URLSearchParams(window.location.search).get("location") ?? "";
  return VALID_LOCATIONS.includes(p as LocationKey) ? (p as LocationKey) : "";
}

// ─── FloatInput ──────────────────────────────────────────────────────────────

interface FloatInputProps {
  id: string;
  label: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  icon: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
  placeholder?: string;
  ariaInvalid?: boolean;
}

const FloatInput = ({
  id, label, type = "text", inputMode, autoComplete,
  value, onChange, onFocus, onBlur,
  error, icon, inputRef, placeholder, ariaInvalid,
}: FloatInputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          // hardcoded-color-allow-next-line
          color: error ? ERR_RED : focused ? ORANGE : "rgba(245,240,235,0.55)",
          marginBottom: 6,
          fontFamily: "Inter, sans-serif",
          transition: "color 150ms ease",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div
          aria-hidden
          style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
            // hardcoded-color-allow-next-line
            color: error ? ERR_RED : focused ? ORANGE : "rgba(11,16,41,0.58)",
            transition: "color 150ms ease",
            pointerEvents: "none",
            display: "flex",
          }}
        >
          {icon}
        </div>
        <input
          id={id}
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={focused ? placeholder : ""}
          value={value}
          aria-invalid={ariaInvalid}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { setFocused(true); onFocus?.(); }}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{
            width: "100%",
            height: 56,
            background: WHITE,
            // hardcoded-color-allow-next-line
            border: `2px solid ${error ? ERR_RED : focused ? ORANGE : "rgba(0,0,0,0.14)"}`,
            borderRadius: 8,
            padding: "0 16px 0 44px",
            fontSize: 16,
            color: NAVY,
            outline: "none",
            fontFamily: "Inter, sans-serif",
            transition: "border-color 150ms ease",
            WebkitAppearance: "none",
          }}
        />
        {type === "tel" && value.replace(/\D/g, "").length === 10 && !error && (
          <div style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            // hardcoded-color-allow-next-line
            color: "#16A34A",
          }}>
            <Check size={18} strokeWidth={2.5} />
          </div>
        )}
      </div>
      {error && (
        <p role="alert" style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 12, color: ERR_RED, marginTop: 5,
          fontFamily: "Inter, sans-serif",
        }}>
          <AlertCircle size={12} strokeWidth={2} /> {error}
        </p>
      )}
    </div>
  );
};

// ─── CROHeroForm ─────────────────────────────────────────────────────────────

interface CROHeroFormProps {
  service?:    "trt" | "wl" | "ed";
  heading?:    string;
  subheading?: string;
  ctaLabel?:   string;
  formId?:     string;
  source?:     string;
}

const CROHeroForm = ({
  service    = "trt",
  heading    = "Claim Your No-Cost Consultation",
  subheading = "Includes labs, evaluation & same-day results.",
  ctaLabel   = "Claim My No-Cost Visit Today",
  formId     = "cro-hf",
  source     = "cro-op-hero",
}: CROHeroFormProps = {}) => {
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [email,    setEmail]    = useState("");
  const [location, setLocation] = useState<LocationKey | "">(() => getLocationFromUrl());
  const [tcpa,     setTcpa]     = useState(false);
  const [hovered,  setHovered]  = useState<LocationKey | null>(null);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const nameRef     = useRef<HTMLInputElement>(null);
  const phoneRef    = useRef<HTMLInputElement>(null);
  const emailRef    = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const tcpaRef     = useRef<HTMLDivElement>(null);

  const controller = useLeadSubmitController<CROHeroLeadInput>({
    schema: croHeroLeadSchema,
    source,
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return {
        firstName: first || "Guest",
        lastName: rest.join(" ") || undefined,
        email: v.email,
        phone: v.phone,
      };
    },
    onSuccess: (result, v) => {
      markSessionSubmitted();
      trackFunnelEvent("booking_started", { service, location: v.location });
      const [first, ...rest] = v.name.trim().split(/\s+/);
      enterBookingFunnel({
        identity: {
          firstName: first || "Guest",
          lastName: rest.join(" ") || undefined,
          email: v.email,
          phone: v.phone,
          ghlContactId: result.contactId,
        },
        service,
        location: v.location,
        source,
        lpSlug: typeof window !== "undefined" ? window.location.pathname : undefined,
      }, navigate);
    },
    toastOnError: false,
  });

  useEffect(() => {
    const fe = controller.fieldErrors;
    if (!Object.keys(fe).length) return;
    const mapped: Record<string, string> = {};
    for (const k of Object.keys(fe)) mapped[k] = fe[k];
    setErrors(mapped);
    const order = ["name", "phone", "email", "location", "tcpa"];
    const first = order.find((k) => mapped[k]);
    if (first === "name")     nameRef.current?.focus();
    if (first === "phone")    phoneRef.current?.focus();
    if (first === "email")    emailRef.current?.focus();
    if (first === "location") locationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (first === "tcpa")     tcpaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [controller.fieldErrors]);

  const clearErr = (k: string) => setErrors((p) => { const { [k]: _, ...r } = p; return r; });
  const isSubmitting = controller.isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void controller.submit({ name, phone, email, location: location as LocationKey, tcpa });
  };

  return (
    <BookingErrorBoundary>
      <div
        style={{
          // hardcoded-color-allow-next-line
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          // hardcoded-color-allow-next-line
          border: "1px solid rgba(255,255,255,0.11)",
          borderRadius: 16,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 416,
          // hardcoded-color-allow-next-line
          boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Stars */}
        <a
          href={GBP_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 12 }}
        >
          <span style={{ display: "flex", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#C9A961" stroke="#C9A961" />
            ))}
          </span>
          {/* hardcoded-color-allow-next-line */}
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(245,240,235,0.80)" }}>
            4.9 &middot; 200+ Google reviews
          </span>
        </a>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(20px, 3vw, 24px)",
            fontWeight: 700,
            color: "var(--c-text-on-dark)",
            lineHeight: 1.15,
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          {heading}
        </h2>
        {/* hardcoded-color-allow-next-line */}
        <p style={{ fontSize: 13, color: "rgba(245,240,235,0.70)", marginBottom: 16, fontFamily: "Inter, sans-serif" }}>
          {subheading}
        </p>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Name */}
          <FloatInput
            id={`${formId}-name`}
            label="Name"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            value={name}
            inputRef={nameRef}
            error={errors.name}
            ariaInvalid={!!errors.name}
            icon={<User size={16} strokeWidth={1.75} />}
            onChange={(v) => { setName(v); clearErr("name"); }}
            onFocus={() => { void import("@/pages/book/BookLocation"); }}
          />

          {/* Phone */}
          <FloatInput
            id={`${formId}-phone`}
            label="Phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 000-0000"
            value={phone}
            inputRef={phoneRef}
            error={errors.phone}
            ariaInvalid={!!errors.phone}
            icon={<Phone size={16} strokeWidth={1.75} />}
            onChange={(v) => { setPhone(formatPhone(v)); clearErr("phone"); }}
            onBlur={() => {
              void capturePartialLead({ phone, name, email: email || undefined, location: location || undefined, source: `${source}-blur` });
            }}
          />

          {/* Email */}
          <FloatInput
            id={`${formId}-email`}
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="john@email.com"
            value={email}
            inputRef={emailRef}
            error={errors.email}
            ariaInvalid={!!errors.email}
            icon={<Mail size={16} strokeWidth={1.75} />}
            onChange={(v) => { setEmail(v); clearErr("email"); }}
          />

          {/* Location */}
          <div ref={locationRef} role="radiogroup" aria-label="Select clinic location" aria-required="true">
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.09em",
              textTransform: "uppercase",
              // hardcoded-color-allow-next-line
              color: errors.location ? ERR_RED : "rgba(245,240,235,0.65)",
              marginBottom: 8,
            }}>
              Location
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {LOCATIONS.map(({ key, label }) => {
                const sel = location === key;
                const hov = hovered === key && !sel;
                return (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: 48,
                      borderRadius: 8,
                      padding: "0 14px",
                      gap: 10,
                      cursor: "pointer",
                      userSelect: "none",
                      border: sel
                        ? `2px solid ${ORANGE}`
                        : errors.location
                          ? `1.5px solid ${ERR_RED}`
                          : hov
                            // hardcoded-color-allow-next-line
                            ? `1.5px solid rgba(232,103,10,0.40)`
                            // hardcoded-color-allow-next-line
                            : "1.5px solid rgba(255,255,255,0.11)",
                      // hardcoded-color-allow-next-line
                      background: sel ? ORANGE : hov ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
                      // hardcoded-color-allow-next-line
                      boxShadow: sel ? `0 4px 16px rgba(232,103,10,0.30)` : "none",
                      transition: "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
                    }}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <input
                      type="radio"
                      name={`${formId}-location`}
                      value={key}
                      checked={sel}
                      onChange={() => { setLocation(key); clearErr("location"); }}
                      aria-label={label}
                      style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                    />
                    <MapPin
                      size={16} strokeWidth={2} aria-hidden
                      style={{ flexShrink: 0, color: sel ? WHITE : ORANGE, transition: "color 150ms ease" }}
                    />
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: WHITE, lineHeight: 1 }}>
                      {label}
                    </span>
                    {sel && <Check size={15} strokeWidth={2.5} aria-hidden style={{ flexShrink: 0, color: WHITE }} />}
                  </label>
                );
              })}
            </div>
            {errors.location && (
              <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED, marginTop: 6 }}>
                <AlertCircle size={12} strokeWidth={2} /> {errors.location}
              </p>
            )}
            <style>{`
              label:has(input[name="${formId}-location"]:focus-visible) {
                outline: 2px solid ${ORANGE};
                outline-offset: 2px;
              }
            `}</style>
          </div>

          {/* TCPA */}
          <div ref={tcpaRef}>
            <input
              id={`${formId}-tcpa`}
              type="checkbox"
              checked={tcpa}
              onChange={(e) => { setTcpa(e.target.checked); clearErr("tcpa"); }}
              aria-describedby={`${formId}-tcpa-text`}
              aria-invalid={!!errors.tcpa}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            />
            <label
              htmlFor={`${formId}-tcpa`}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                cursor: "pointer", userSelect: "none",
                padding: "10px 12px",
                margin: "0 -12px",
                borderRadius: 8,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 24, height: 24, borderRadius: 5,
                  // hardcoded-color-allow-next-line
                  border: `2px solid ${tcpa ? ORANGE : errors.tcpa ? ERR_RED : "rgba(255,255,255,0.40)"}`,
                  background: tcpa ? ORANGE : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                  transition: "background 150ms ease, border-color 150ms ease",
                }}
              >
                {tcpa && <Check size={14} strokeWidth={3} style={{ color: WHITE }} />}
              </div>
              <span
                id={`${formId}-tcpa-text`}
                style={{ fontSize: 11, color: "rgba(245,240,235,0.50)", lineHeight: 1.4 }}
              >
                I agree to receive SMS/calls &amp; texts from Men&rsquo;s Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out.{" "}
                Not a condition of service. HIPAA Compliant.{" "}
                <a href="/privacy-policy" style={{ color: "var(--brand-cta)", textDecoration: "none" }}>Privacy Policy</a>
              </span>
            </label>
            {errors.tcpa && (
              <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED, marginTop: 6 }}>
                <AlertCircle size={12} strokeWidth={2} /> {errors.tcpa}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 4,
              width: "100%",
              height: 54,
              background: ORANGE,
              color: WHITE,
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontFamily: "Inter, sans-serif",
              cursor: isSubmitting ? "wait" : "pointer",
              opacity: isSubmitting ? 0.80 : 1,
              // hardcoded-color-allow-next-line
              boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(232,103,10,0.40)",
              transition: "background 180ms ease, transform 180ms ease, box-shadow 180ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = "var(--brand-cta-hover)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ORANGE;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isSubmitting
              ? <><Loader2 size={16} className="animate-spin" /> Booking...</>
              : <>{ctaLabel} <ArrowRight size={16} strokeWidth={2.5} /></>
            }
          </button>

          {controller.error && !Object.keys(errors).length && (
            <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED }}>
              <AlertCircle size={12} strokeWidth={2} /> {controller.error}
            </p>
          )}

          {/* Testimonial micro-quote below submit */}
          {/* hardcoded-color-allow-next-line */}
          <p style={{ fontSize: 11, color: "rgba(245,240,235,0.45)", textAlign: "center", lineHeight: 1.5, marginTop: 2 }}>
            &ldquo;First visit changed everything.&rdquo; &mdash; Mark T., 52, Richmond &middot; Verified patient
          </p>
        </form>
      </div>
    </BookingErrorBoundary>
  );
};

// ─── CROHeader ────────────────────────────────────────────────────────────────

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
      // hardcoded-color-allow-next-line
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      fontFamily: "Inter, sans-serif",
    }}
  >
    {/* Logo */}
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

    {/* Phone only — no nav links */}
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
      <Phone size={16} strokeWidth={1.75} style={{ color: ORANGE }} />
      {PHONE.display}
    </a>
  </header>
);

// ─── CROHeroSection ───────────────────────────────────────────────────────────

const SYMPTOMS = [
  "Tired by noon. Coffee stopped working.",
  "Same gym effort. Nothing to show.",
  "Sex drive is down. She\u2019s noticed too.",
  "Labs are fine. You\u2019re not.",
  "Brain fog. Can\u2019t find the word.",
];

const CROHeroSection = () => {
  const scrollToForm = () => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section
      id="hero"
      className="relative flex items-start lg:items-center"
      style={{ background: "var(--brand-navy-deep)", minHeight: 720 }}
    >
      <a
        href="#hero-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:text-black focus:rounded"
      >
        Skip to lead form
      </a>

      {/* Grain texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "220px 220px",
        }}
      />
      {/* Radial glow */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        // hardcoded-color-allow-next-line
        background: "radial-gradient(ellipse 50% 50% at 28% 45%, rgba(27,43,75,0.55) 0%, rgba(11,16,41,0) 70%)",
      }} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        // hardcoded-color-allow-next-line
        background: "radial-gradient(ellipse 60% 50% at 85% 10%, rgba(232,103,10,0.18) 0%, rgba(11,16,41,0) 60%)",
      }} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        // hardcoded-color-allow-next-line
        background: "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
      }} />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 pt-24 pb-12 lg:pt-28 lg:pb-20 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 lg:gap-12 items-start">
        {/* LEFT */}
        <div className="flex flex-col">
          <h1
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, 'Bebas Neue', Anton, sans-serif",
              fontSize: "clamp(36px, 9vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: "var(--brand-cream)",
              fontWeight: 700,
            }}
          >
            <span style={{ display: "block", whiteSpace: "nowrap" }}>VIRGINIA&rsquo;S CHOICE</span>
            <span style={{ display: "block", color: "var(--brand-cta)", whiteSpace: "nowrap" }}>FOR MEN&rsquo;S HEALTH</span>
          </h1>

          {/* hardcoded-color-allow-next-line */}
          <p className="mt-6 w-full" style={{ color: "rgba(245,240,235,0.88)", fontFamily: "Inter, sans-serif", fontSize: 19, lineHeight: 1.6 }}>
            Sit down with a licensed Virginia provider. Labs drawn on-site and reviewed in the same visit. No-cost consultation. Virginia&rsquo;s men&rsquo;s health practice since 2015.
          </p>

          {/* Hero image — clinic credibility between subtext and symptoms */}
          <div
            className="mt-6 rounded-xl overflow-hidden"
            style={{
              aspectRatio: "16/7",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <img
              src="/images/clinic-lab-draw.webp"
              alt="Licensed provider reviewing lab results with a patient at Men's Wellness Centers Virginia"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 30%",
                display: "block",
              }}
              width={720}
              height={315}
              loading="eager"
              decoding="async"
            />
            {/* Orange overlay shimmer at bottom for text legibility */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
                background: "linear-gradient(to top, rgba(11,16,41,0.65) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Symptoms list */}
          <div className="mt-6 flex flex-col gap-3">
            {SYMPTOMS.map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ChevronRight
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden
                  style={{ color: "var(--brand-cta)", flexShrink: 0 }}
                />
                {/* hardcoded-color-allow-next-line */}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "rgba(245,240,235,0.88)", lineHeight: 1.4 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* "I recognize this" scroll CTA */}
          <button
            type="button"
            onClick={scrollToForm}
            className="mt-6 inline-flex items-center gap-2 font-bold cursor-pointer border-none"
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              // hardcoded-color-allow-next-line
              border: `1.5px solid rgba(232,103,10,0.55)`,
              borderRadius: 8,
              padding: "11px 20px",
              color: "var(--brand-cta)",
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.03em",
              transition: "border-color 150ms ease, background 150ms ease",
            }}
            onMouseEnter={(e) => {
              // hardcoded-color-allow-next-line
              e.currentTarget.style.background = "rgba(232,103,10,0.10)";
              e.currentTarget.style.borderColor = "var(--brand-cta)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              // hardcoded-color-allow-next-line
              e.currentTarget.style.borderColor = "rgba(232,103,10,0.55)";
            }}
          >
            I recognize this <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* RIGHT — CRO form: sticky above fold on desktop */}
        <div id="hero-form" className="w-full flex lg:justify-end md:sticky md:top-[72px]">
          <div className="w-full">
            <CROHeroForm />
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── CROCredibilityBand ───────────────────────────────────────────────────────

import { trackCro } from "@/hooks/useAnalytics";

const CRO_STATS = [
  { value: "10,000+", label: "Men Treated\nSince 2015", slug: "cro_cb_count",     scrollTo: "results" },
  { value: "3",       label: "Virginia\nCenters",       slug: "cro_cb_locations", scrollTo: "locations" },
  { value: "4.9\u2605", label: "Google Rating\n200+ Reviews", slug: "cro_cb_reviews", href: "https://www.google.com/maps/search/Men%27s+Wellness+Centers" },
  { value: "Today",   label: "Same-Day\nAvailability",  slug: "cro_cb_availability", scrollTo: "hero-form" },
];

const CROCredibilityBand = () => (
  <section style={{ background: "#0A1628" }}>
    <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 text-center">
      {CRO_STATS.map((s) => {
        const inner = (
          <div className="flex flex-col items-center gap-2 px-2 py-5 md:py-7">
            <div
              className="font-bold uppercase"
              style={{
                fontFamily: "Oswald, sans-serif",
                color: "var(--c-text-on-dark)",
                fontSize: "clamp(26px, 4vw, 44px)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}
            >
              {s.value}
            </div>
            <div
              className="uppercase whitespace-pre-line"
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
              {s.label}
            </div>
          </div>
        );

        if (s.href) {
          return (
            <a
              key={s.slug}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cro={s.slug}
              onClick={() => trackCro(s.slug)}
              className="block hover:opacity-80 transition-opacity cursor-pointer"
              style={{ textDecoration: "none" }}
            >
              {inner}
            </a>
          );
        }

        if (s.scrollTo) {
          return (
            <button
              key={s.slug}
              type="button"
              data-cro={s.slug}
              onClick={() => {
                trackCro(s.slug);
                document.getElementById(s.scrollTo!)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:opacity-80 transition-opacity cursor-pointer w-full border-none bg-transparent"
            >
              {inner}
            </button>
          );
        }

        return <div key={s.slug}>{inner}</div>;
      })}
    </div>
  </section>
);

// ─── CROClosingFormSection ────────────────────────────────────────────────────

const CROClosingFormSection = () => (
  <section
    id="final-cta"
    style={{ background: "var(--brand-navy-deep)", scrollMarginTop: 64 }}
  >
    <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
      <p style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--brand-cta)",
        borderLeft: "3px solid var(--brand-cta)",
        paddingLeft: 10, lineHeight: 1,
        marginBottom: 16,
      }}>
        Ready to Start
      </p>
      <h2
        className="font-bold uppercase text-center"
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(26px, 3.5vw, 42px)",
          color: "var(--c-text-on-dark)",
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: 8,
        }}
      >
        Claim Your No-Cost Visit Today
      </h2>
      {/* hardcoded-color-allow-next-line */}
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: "rgba(255,255,255,0.75)", marginBottom: 32, textAlign: "center" }}>
        Same-day availability. Labs and evaluation on-site. No obligation to proceed.
      </p>
      <CROHeroForm
        formId="cro-cf"
        source="cro-op-closing"
        heading="Claim Your No-Cost Consultation"
        subheading="Includes labs, evaluation & same-day results."
      />
    </div>
  </section>
);

// ─── CROFooter ────────────────────────────────────────────────────────────────

const CROFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "var(--brand-navy)", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>

        {/* Logo + phone row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
          <img
            src="/logos/Text_Logo_white.webp"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
            alt="Men's Wellness Centers"
            style={{ height: 36, width: "auto" }}
            width={180}
            height={36}
            loading="lazy"
            decoding="async"
          />
          <a href={PHONE.tel} style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text-on-dark)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <Phone size={15} strokeWidth={1.75} style={{ color: ORANGE }} />
            {PHONE.display}
          </a>
        </div>

        {/* Trust badges */}
        <div style={{
          // hardcoded-color-allow-next-line
          borderTop: "1px solid rgba(255,255,255,0.12)",
          paddingTop: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          flexWrap: "wrap",
        }}>
          <img src="/images/badges/clia-color.webp" alt="CLIA Certified" style={{ height: 52, width: "auto" }} loading="lazy" decoding="async" />
          <a href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com" target="_blank" rel="noopener noreferrer">
            <img src="/images/badges/legitscript-color.png" alt="LegitScript Certified" style={{ height: 64, width: "auto" }} loading="lazy" decoding="async" />
          </a>
          <img src="/images/badges/hipaa-color.webp" alt="HIPAA Compliant" style={{ height: 52, width: "auto" }} loading="lazy" decoding="async" />
        </div>

        {/* Disclaimers */}
        <div style={{
          marginTop: 32,
          paddingTop: 24,
          // hardcoded-color-allow-next-line
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {[
            "The information presented on this website is for general informational purposes only and is not intended to constitute medical advice, diagnosis, or treatment. Nothing on this website should be relied upon as a substitute for an in-person evaluation with a licensed healthcare professional.",
            "Testimonials reflect individual experiences only and are not intended to represent typical outcomes or make medical claims.",
          ].map((text, i) => (
            <p key={i} style={{ fontSize: 11, lineHeight: 1.65, color: "rgba(255,255,255,0.45)", margin: 0, overflowWrap: "break-word" }}>
              {text}
            </p>
          ))}
        </div>

        {/* Bottom bar — compliance links only */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          paddingBottom: 24,
          // hardcoded-color-allow-next-line
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px 14px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          // hardcoded-color-allow-next-line
          color: "rgba(255,255,255,0.45)",
        }}>
          <span>&copy; {year} Men&rsquo;s Wellness Centers</span>
          <span>|</span>
          {/* hardcoded-color-allow-next-line */}
          <Link to="/prescribing-policy" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Safety Policy</Link>
          <span>|</span>
          {/* hardcoded-color-allow-next-line */}
          <Link to="/terms-of-service" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Terms</Link>
          <span>|</span>
          {/* hardcoded-color-allow-next-line */}
          <Link to="/privacy-policy" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};

// ─── CRODesktopStickyBar ──────────────────────────────────────────────────────

const CRODesktopStickyBar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      className="hidden md:flex"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 49,
        height: 64,
        background: "var(--brand-navy-deep)",
        // hardcoded-color-allow-next-line
        borderTop: "1px solid rgba(255,255,255,0.10)",
        // hardcoded-color-allow-next-line
        boxShadow: "0 -8px 32px rgba(0,0,0,0.40)",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        fontFamily: "Inter, sans-serif",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 300ms ease",
      }}
      aria-hidden={!visible}
    >
      {/* hardcoded-color-allow-next-line */}
      <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(245,240,235,0.90)", letterSpacing: "0.01em" }}>
        Virginia&rsquo;s #1 Men&rsquo;s Health Clinic
        <span style={{ margin: "0 12px", color: "var(--brand-cta)" }}>&middot;</span>
        Same-Day Availability
      </span>
      <button
        type="button"
        onClick={scrollToForm}
        className="font-bold cursor-pointer border-none"
        style={{
          height: 44,
          padding: "0 28px",
          background: "var(--brand-cta)",
          color: "var(--c-text-on-dark)",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.05em",
          fontFamily: "Inter, sans-serif",
          // hardcoded-color-allow-next-line
          boxShadow: "0 4px 16px rgba(232,103,10,0.35)",
          transition: "background 150ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
      >
        Claim My Visit
      </button>
    </div>
  );
};

// ─── Extra FAQ items ──────────────────────────────────────────────────────────

const CRO_EXTRA_FAQS: FaqItem[] = [
  {
    q: "Do I need a referral?",
    a: "No referral needed. Call or book online and come in. We handle all lab work on-site during your first visit. Most men walk out the same day with a clear picture of what their labs mean and, if appropriate, a treatment plan.",
  },
  {
    q: "What if my labs are borderline?",
    a: "Borderline results are often where men fall through the cracks of standard care. Our providers are trained to look at your full picture, not just whether a number clears a threshold. We discuss what your levels mean in context of your symptoms, history, and goals.",
  },
];

// ─── Section skeleton ─────────────────────────────────────────────────────────

const SectionSkeleton = ({ bg = "var(--brand-cream)", height = 200 }: { bg?: string; height?: number }) => (
  <div style={{ background: bg, minHeight: height }} aria-hidden="true" />
);

// ─── CROOptimized page ────────────────────────────────────────────────────────

const CROOptimized = () => (
  <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
    <SEO
      title="TRT in Virginia | No-Cost Consultation | Men's Wellness Centers"
      description="Claim your no-cost men's health consultation. Labs drawn on-site, results reviewed same visit. 3 Virginia locations. Same-day availability."
    />

    {/* 1. CROHeader — no nav, logo + phone only */}
    <CROHeader />

    <main className="flex-1">
      {/* 2. Hero — custom layout with CROHeroForm */}
      <CROHeroSection />

      {/* 3. CredibilityBand — 4th stat = Today / Same-Day Availability */}
      <SectionReveal><CROCredibilityBand /></SectionReveal>

      {/* 4. TRTManifesto — CTA scrolls to #hero-form */}
      <SectionReveal><TRTManifesto ctaScrollTarget="hero-form" /></SectionReveal>

      {/* 5. TRTThreeProblems — updated heading */}
      <TRTThreeProblems headlineOverride={{ line1: "THREE REASONS MEN COME TO US." }} />

      {/* 6. TRTEverythingIncluded — moved before HowItWorks */}
      <TRTEverythingIncluded />

      {/* 7. TRTHowItWorks */}
      <Suspense fallback={<SectionSkeleton bg="var(--brand-cream)" height={480} />}>
        <SectionReveal><TRTHowItWorks /></SectionReveal>
      </Suspense>

      {/* 8. TRTResults */}
      <Suspense fallback={<SectionSkeleton bg="var(--brand-cream)" height={400} />}>
        <SectionReveal><TRTResults /></SectionReveal>
      </Suspense>

      {/* 9. TRTPillars */}
      <Suspense fallback={<SectionSkeleton bg="var(--brand-navy)" height={360} />}>
        <SectionReveal><TRTPillars /></SectionReveal>
      </Suspense>

      {/* 10. TRTMarquee */}
      <Suspense fallback={<SectionSkeleton bg="#111827" height={160} />}>
        <SectionReveal><TRTMarquee /></SectionReveal>
      </Suspense>

      {/* 11. TRTLocations */}
      <Suspense fallback={<SectionSkeleton height={400} />}>
        <SectionReveal><TRTLocations /></SectionReveal>
      </Suspense>

      {/* 12. TRTFAQ + 2 new CRO questions */}
      <Suspense fallback={<SectionSkeleton bg="var(--brand-cream)" height={480} />}>
        <SectionReveal><TRTFAQ extraFaqs={CRO_EXTRA_FAQS} /></SectionReveal>
      </Suspense>

      {/* 13. Closing form section — mirrors hero form */}
      <CROClosingFormSection />
    </main>

    {/* 14. Minimal footer */}
    <CROFooter />

    {/* 15. StickyMobileCTA — existing component */}
    <StickyMobileCTA />

    {/* 16. Desktop sticky bottom bar — scroll-triggered */}
    <CRODesktopStickyBar />
  </div>
);

export default CROOptimized;

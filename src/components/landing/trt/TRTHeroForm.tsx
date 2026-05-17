/**
 * TRTHeroForm - LP hero lead capture form.
 *
 * Design system:
 * - 8px base grid throughout
 * - Inter for all UI text; Oswald for display heading only
 * - Lucide React for all icons (consistent 1.5px stroke, 24px grid)
 * - White inputs on dark panel - maximum contrast
 * - Location cards: dark semi-transparent, orange fill + Lucide Check on select
 * - TCPA checkbox: custom visual, native <input> hidden for a11y
 */

import { useState, useRef, useEffect } from "react";
import { Lock, Loader2, MapPin, Check, Phone, User, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { heroLeadSchema, type HeroLeadInput } from "@/domain/leads/leadFormSchema";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { COPY } from "@/data/copy";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";
import { trackFunnelEvent } from "@/hooks/useAnalytics";

// ─── Constants ────────────────────────────────────────────────────────────────

const ORANGE   = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const ERR_RED  = "#DC2626";
const NAVY     = "var(--brand-navy-deep)";
const WHITE    = "var(--bg-white)";

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const VALID_LOCATIONS = ["richmond", "virginia-beach", "newport-news"] as const;
type LocationKey = typeof VALID_LOCATIONS[number];

const LOCATIONS: { key: LocationKey; label: string }[] = [
  { key: "richmond",      label: "Richmond"      },
  { key: "virginia-beach", label: "Virginia Beach" },
  { key: "newport-news",  label: "Newport News"  },
];

function getLocationFromUrl(): LocationKey | "" {
  if (typeof window === "undefined") return "";
  const p = new URLSearchParams(window.location.search).get("location") ?? "";
  return VALID_LOCATIONS.includes(p as LocationKey) ? (p as LocationKey) : "";
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Service = "trt" | "wl" | "ed";

interface TRTHeroFormProps {
  service?:   Service;
  heading?:   string;
  subheading?: string;
  ctaLabel?:  string;
}

// ─── Floating Label Input ───────────────────────────────────────────────────
/**
 * Persistent floating label - label sits above the field at all times.
 * Placeholder disappears on focus; label never does. Critical for 55+ users.
 */
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
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      {/* Persistent label - always visible above field */}
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
      {/* Input wrapper */}
      <div style={{ position: "relative" }}>
        {/* Left icon */}
        <div
          aria-hidden
          style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
            // hardcoded-color-allow-next-line
            color: error ? ERR_RED : focused ? ORANGE : "rgba(11,16,41,0.35)",
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
        {/* Green check when phone is complete */}
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

// ─── Component ────────────────────────────────────────────────────────────────

export const TRTHeroForm = ({
  service    = "trt",
  heading    = COPY.cta.bookConsult,
  subheading = "No-cost consultation. Same-day availability.",
  ctaLabel   = COPY.cta.bookConsult,
}: TRTHeroFormProps = {}) => {
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState<LocationKey | "">(() => getLocationFromUrl());
  const [tcpa,     setTcpa]     = useState(false);
  const [hovered,  setHovered]  = useState<LocationKey | null>(null);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const nameRef     = useRef<HTMLInputElement>(null);
  const phoneRef    = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const tcpaRef     = useRef<HTMLDivElement>(null);

  // ── Controller ──────────────────────────────────────────────────────────────
  const controller = useLeadSubmitController<HeroLeadInput>({
    schema: heroLeadSchema,
    source: "landing-page-hero",
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return { firstName: first || "Guest", lastName: rest.join(" ") || undefined, email: undefined, phone: v.phone };
    },
    onSuccess: (result, v) => {
      markSessionSubmitted();
      trackFunnelEvent("booking_started", { service, location: v.location });
      const [first, ...rest] = v.name.trim().split(/\s+/);
      enterBookingFunnel({
        identity: {
          firstName: first || "Guest",
          lastName: rest.join(" ") || undefined,
          email: "",
          phone: v.phone,
          ghlContactId: result.contactId,
        },
        service,
        location: v.location,
        source: "landing-page-hero",
        lpSlug: typeof window !== "undefined" ? window.location.pathname : undefined,
      }, navigate);
    },
    toastOnError: false,
  });

  // Mirror controller errors into local state
  useEffect(() => {
    const fe = controller.fieldErrors;
    if (!Object.keys(fe).length) return;
    const mapped: Record<string, string> = {};
    for (const k of Object.keys(fe)) mapped[k] = fe[k];
    setErrors(mapped);
    const order = ["name", "phone", "location", "tcpa"];
    const first = order.find((k) => mapped[k]);
    if (first === "name")     nameRef.current?.focus();
    if (first === "phone")    phoneRef.current?.focus();
    if (first === "location") locationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (first === "tcpa")     tcpaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [controller.fieldErrors]);

  const clearErr = (k: string) => setErrors((p) => { const { [k]: _, ...r } = p; return r; });
  const isSubmitting = controller.isSubmitting;

  // ── Submit - Zod (via controller.submit) is the single validation source ────
  // Field errors come back through controller.fieldErrors → the useEffect above
  // maps them to local `errors` state and scrolls to the first invalid field.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void controller.submit({ name, phone, location: location as LocationKey, tcpa });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
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
      {/* Heading */}
      <h2 style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: 21,
        fontWeight: 600,
        color: "var(--brand-cream)",
        letterSpacing: "0.04em",
        lineHeight: 1.2,
        marginBottom: 6,
      }}>
        {heading}
      </h2>
      <p style={{
        fontSize: 13,
        // hardcoded-color-allow-next-line
        color: "rgba(245,240,235,0.60)",
        lineHeight: 1.5,
        marginBottom: 24,
      }}>
        {subheading}
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── First Name ─────────────────────────────────────────────────────── */}
        <FloatInput
          id="hf-name"
          label="First Name"
          type="text"
          autoComplete="given-name"
          placeholder="John"
          value={name}
          inputRef={nameRef}
          error={errors.name}
          ariaInvalid={!!errors.name}
          icon={<User size={16} strokeWidth={1.75} />}
          onChange={(v) => { setName(v); clearErr("name"); }}
          onFocus={() => {
            // Prefetch booking funnel chunks on first focus - bookingStore is
            // already in the static bundle so only BookLocation needs fetching.
            void import("@/pages/book/BookLocation");
          }}
        />

        {/* ── Phone ──────────────────────────────────────────────────────────── */}
        <FloatInput
          id="hf-phone"
          label="Phone Number"
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
            void capturePartialLead({ phone, name, location: location || undefined, source: "hero-form-blur" });
          }}
        />
        {/* Phone micro-copy */}
        {/* hardcoded-color-allow-next-line */}
        <p style={{ fontSize: 12, color: "rgba(245,240,235,0.65)", fontFamily: "Inter, sans-serif", marginTop: -4, lineHeight: 1.4 }}>
          We'll use this to confirm your visit and send reminders. No spam.
        </p>

        {/* ── Location ───────────────────────────────────────────────────────── */}
        <div ref={locationRef} role="radiogroup" aria-label="Select clinic location" aria-required="true">
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.09em",
            textTransform: "uppercase",
            // hardcoded-color-allow-next-line
            color: errors.location ? ERR_RED : "rgba(245,240,235,0.65)",
            marginBottom: 8,
          }}>
            Nearest location
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
                  {/* Hidden native radio for a11y / keyboard */}
                  <input
                    type="radio"
                    name="hf-location"
                    value={key}
                    checked={sel}
                    onChange={() => { setLocation(key); clearErr("location"); }}
                    aria-label={label}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                  />
                  {/* Lucide MapPin */}
                  <MapPin
                    size={16}
                    strokeWidth={2}
                    aria-hidden
                    style={{ flexShrink: 0, color: sel ? WHITE : ORANGE, transition: "color 150ms ease" }}
                  />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: WHITE, lineHeight: 1 }}>
                    {label}
                  </span>
                  {/* Lucide Check on selected */}
                  {sel && (
                    <Check size={15} strokeWidth={2.5} aria-hidden style={{ flexShrink: 0, color: WHITE }} />
                  )}
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
            label:has(input[name="hf-location"]:focus-visible) {
              outline: 2px solid ${ORANGE};
              outline-offset: 2px;
            }
          `}</style>
        </div>

        {/* ── TCPA ───────────────────────────────────────────────────────────── */}
        <div ref={tcpaRef}>
          {/* Native checkbox - hidden, drives state */}
          <input
            id="hf-tcpa"
            type="checkbox"
            checked={tcpa}
            onChange={(e) => { setTcpa(e.target.checked); clearErr("tcpa"); }}
            aria-describedby="hf-tcpa-text"
            aria-invalid={!!errors.tcpa}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
          />
          <label
            htmlFor="hf-tcpa"
            style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              cursor: "pointer", userSelect: "none",
              // Full-row tap target for large thumbs (55+ a11y)
              padding: "10px 12px",
              margin: "0 -12px",
              borderRadius: 8,
            }}
          >
            {/* Custom checkbox visual - 24×24 for easy tap */}
            <div
              aria-hidden="true"
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                // hardcoded-color-allow-next-line
                border: `2px solid ${tcpa ? ORANGE : errors.tcpa ? ERR_RED : "rgba(255,255,255,0.40)"}`,
                background: tcpa ? ORANGE : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
                transition: "background 150ms ease, border-color 150ms ease",
              }}
            >
              {tcpa && <Check size={14} strokeWidth={3} style={{ color: WHITE }} />}
            </div>
            <span
              id="hf-tcpa-text"
              // hardcoded-color-allow-next-line
              style={{ fontSize: 11, color: "rgba(245,240,235,0.45)", lineHeight: 1.4 }}
            >
              I agree to receive texts from Men&rsquo;s Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out.{" "}
              Not a condition of service.{" "}
              {/* hardcoded-color-allow-next-line */}
              <a href="/privacy-policy" style={{ color: "var(--brand-cta)", textDecoration: "none" }}>Privacy Policy</a>
            </span>
          </label>
          {errors.tcpa && (
            <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED, marginTop: 6 }}>
              <AlertCircle size={12} strokeWidth={2} /> {errors.tcpa}
            </p>
          )}
        </div>

        {/* ── Submit ─────────────────────────────────────────────────────────── */}
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
          onMouseEnter={(e) => { if (!isSubmitting) {
            // hardcoded-color-allow-next-line
            e.currentTarget.style.background = "#CF5C09"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ORANGE; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {isSubmitting
            ? <><Loader2 size={16} className="animate-spin" /> Booking...</>
            : <>{ctaLabel} <ArrowRight size={16} strokeWidth={2.5} /></>
          }
        </button>

        {/* Helper line under CTA */}
        <p style={{
          textAlign: "center", fontSize: 12,
          // hardcoded-color-allow-next-line
          color: "rgba(245,240,235,0.65)",
          fontFamily: "Inter, sans-serif", lineHeight: 1.5, marginTop: 2,
        }}>
          Same-day availability · No obligation to proceed
        </p>

        {controller.error && !Object.keys(errors).length && (
          <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED }}>
            <AlertCircle size={12} strokeWidth={2} /> {controller.error}
          </p>
        )}
      </form>

      {/* Footer */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 20,
        // hardcoded-color-allow-next-line
        color: "rgba(245,240,235,0.65)",
        fontSize: 12,
      }}>
        <Lock size={12} strokeWidth={2} aria-hidden />
        HIPAA secure · No spam, ever
      </div>
      <p style={{
        textAlign: "center", fontSize: 10,
        // hardcoded-color-allow-next-line
        color: "rgba(245,240,235,0.30)",
        fontFamily: "Inter, sans-serif",
        marginTop: 10, lineHeight: 1.4, padding: "0 4px",
      }}>
        Treatment requires a clinical evaluation and is only provided when medically appropriate. Individual results vary.
      </p>
    </div>
    </BookingErrorBoundary>
  );
};

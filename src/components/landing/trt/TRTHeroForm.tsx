/**
 * TRTHeroForm — LP hero lead capture form.
 *
 * Design system:
 * - 8px base grid throughout
 * - Inter for all UI text; Oswald for display heading only
 * - Lucide React for all icons (consistent 1.5px stroke, 24px grid)
 * - White inputs on dark panel — maximum contrast
 * - Location cards: dark semi-transparent, orange fill + Lucide Check on select
 * - TCPA checkbox: custom visual, native <input> hidden for a11y
 */

import { useState, useRef, useEffect } from "react";
import { Lock, Loader2, MapPin, Check, Phone, User, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { heroLeadSchema, type HeroLeadInput } from "@/domain/leads/leadFormSchema";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { COPY } from "@/data/copy";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";

// ─── Constants ────────────────────────────────────────────────────────────────

const ORANGE   = "#E8670A";
const ERR_RED  = "#DC2626";
const NAVY     = "#0B1029";
const WHITE    = "#FFFFFF";

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

// ─── Component ────────────────────────────────────────────────────────────────

export const TRTHeroForm = ({
  service    = "trt",
  heading    = COPY.cta.bookConsult,
  subheading = "Same-day and next-day availability. Takes under 2 minutes.",
  ctaLabel   = COPY.cta.bookConsult,
}: TRTHeroFormProps = {}) => {
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState<LocationKey | "">(() => getLocationFromUrl());
  const [tcpa,     setTcpa]     = useState(false);
  const [focused,  setFocused]  = useState<string | null>(null);
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

  // ── Validation ──────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!name.trim())                           fe.name     = "Name is required";
    if (phone.replace(/\D/g, "").length !== 10) fe.phone    = "Enter a valid 10-digit number";
    if (!location)                              fe.location = "Choose a location";
    if (!tcpa)                                  fe.tcpa     = "Please agree to continue";
    if (Object.keys(fe).length) { setErrors(fe); return; }
    void controller.submit({ name, phone, location: location as LocationKey, tcpa });
  };

  // ── Shared input styles ─────────────────────────────────────────────────────
  const inp = (field: string): React.CSSProperties => ({
    width: "100%",
    height: 52,
    background: WHITE,
    border: `1.5px solid ${errors[field] ? ERR_RED : focused === field ? ORANGE : "rgba(0,0,0,0.14)"}`,
    borderRadius: 8,
    padding: "0 16px 0 44px",
    fontSize: 15,
    color: NAVY,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 150ms ease",
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.11)",
        borderRadius: 16,
        padding: "32px 28px",
        width: "100%",
        maxWidth: 416,
        boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Heading */}
      <h2 style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: 21,
        fontWeight: 600,
        color: "#F5F0EB",
        letterSpacing: "0.04em",
        lineHeight: 1.2,
        marginBottom: 6,
      }}>
        {heading}
      </h2>
      <p style={{
        fontSize: 13,
        color: "rgba(245,240,235,0.60)",
        lineHeight: 1.5,
        marginBottom: 24,
      }}>
        {subheading}
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── First Name ─────────────────────────────────────────────────────── */}
        <div style={{ position: "relative" }}>
          <label htmlFor="hf-name" className="sr-only">First Name</label>
          <User
            size={16}
            strokeWidth={1.75}
            aria-hidden
            style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: errors.name ? ERR_RED : focused === "name" ? ORANGE : "rgba(11,16,41,0.35)",
              transition: "color 150ms ease", pointerEvents: "none",
            }}
          />
          <input
            id="hf-name"
            ref={nameRef}
            type="text"
            placeholder="First Name"
            value={name}
            autoComplete="given-name"
            aria-invalid={!!errors.name}
            onChange={(e) => { setName(e.target.value); clearErr("name"); }}
            onFocus={() => {
              setFocused("name");
              void import("@/pages/book/BookLocation");
              void import("@/domain/booking/bookingStore");
            }}
            onBlur={() => setFocused(null)}
            style={inp("name")}
          />
          {errors.name && (
            <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED, marginTop: 4 }}>
              <AlertCircle size={12} strokeWidth={2} /> {errors.name}
            </p>
          )}
        </div>

        {/* ── Phone ──────────────────────────────────────────────────────────── */}
        <div style={{ position: "relative" }}>
          <label htmlFor="hf-phone" className="sr-only">Phone Number</label>
          <Phone
            size={16}
            strokeWidth={1.75}
            aria-hidden
            style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: errors.phone ? ERR_RED : focused === "phone" ? ORANGE : "rgba(11,16,41,0.35)",
              transition: "color 150ms ease", pointerEvents: "none",
            }}
          />
          <input
            id="hf-phone"
            ref={phoneRef}
            type="tel"
            inputMode="numeric"
            placeholder="Phone Number"
            value={phone}
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            onChange={(e) => { setPhone(formatPhone(e.target.value)); clearErr("phone"); }}
            onFocus={() => setFocused("phone")}
            onBlur={() => {
              setFocused(null);
              void capturePartialLead({ phone, name, location: location || undefined, source: "hero-form-blur" });
            }}
            style={inp("phone")}
          />
          {errors.phone && (
            <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED, marginTop: 4 }}>
              <AlertCircle size={12} strokeWidth={2} /> {errors.phone}
            </p>
          )}
        </div>

        {/* ── Location ───────────────────────────────────────────────────────── */}
        <div ref={locationRef} role="radiogroup" aria-label="Select clinic location" aria-required="true">
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: errors.location ? ERR_RED : "rgba(245,240,235,0.45)",
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
                          ? `1.5px solid rgba(232,103,10,0.40)`
                          : "1.5px solid rgba(255,255,255,0.11)",
                    background: sel ? ORANGE : hov ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
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
          <label
            htmlFor="hf-tcpa"
            style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", userSelect: "none" }}
          >
            {/* Custom checkbox visual */}
            <div
              aria-hidden="true"
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `2px solid ${tcpa ? ORANGE : errors.tcpa ? ERR_RED : "rgba(255,255,255,0.35)"}`,
                background: tcpa ? ORANGE : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
                transition: "background 150ms ease, border-color 150ms ease",
              }}
            >
              {tcpa && <Check size={11} strokeWidth={3} style={{ color: WHITE }} />}
            </div>
            {/* Native checkbox — hidden but functional */}
            <input
              id="hf-tcpa"
              type="checkbox"
              checked={tcpa}
              onChange={(e) => { setTcpa(e.target.checked); clearErr("tcpa"); }}
              aria-describedby="hf-tcpa-text"
              aria-invalid={!!errors.tcpa}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
            />
            <span
              id="hf-tcpa-text"
              style={{ fontSize: 12, color: "rgba(245,240,235,0.50)", lineHeight: 1.5 }}
            >
              I agree to receive SMS/calls about my appointment. Reply STOP to opt out.
              Msg &amp; data rates may apply.
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
            textTransform: "uppercase",
            cursor: isSubmitting ? "wait" : "pointer",
            opacity: isSubmitting ? 0.80 : 1,
            boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(232,103,10,0.40)",
            transition: "background 180ms ease, transform 180ms ease, box-shadow 180ms ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.background = "#CF5C09"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ORANGE; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {isSubmitting
            ? <><Loader2 size={16} className="animate-spin" /> Booking…</>
            : ctaLabel
          }
        </button>

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
        color: "rgba(245,240,235,0.40)",
        fontSize: 12,
      }}>
        <Lock size={12} strokeWidth={2} aria-hidden />
        HIPAA secure · No spam, ever
      </div>
    </div>
  );
};

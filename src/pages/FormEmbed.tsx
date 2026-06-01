/**
 * FormEmbed — /form
 *
 * Ultra-lightweight standalone form page.
 * No header, no footer, no nav — just the lead capture card.
 * Designed for:
 *   - Modal embeds (iframe src="/form")
 *   - Mobile click-to-call landing pages
 *   - WordPress popups / overlay CTAs
 *
 * Query params supported:
 *   ?service=trt|wl|ed   — pre-selects service context
 *   ?location=richmond|virginia-beach|newport-news — pre-selects location
 *   ?source=modal|popup|wp-cta|...   — attribution source
 *   ?theme=light|dark    — surface theme (default: dark)
 */

import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Phone, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { heroLeadSchema, type HeroLeadInput } from "@/domain/leads/leadFormSchema";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import { FloatInput } from "@/components/landing/shared/FloatInput";
import { LocationSelector } from "@/components/landing/trt/LocationSelector";
import { TCPADisclaimer } from "@/components/landing/trt/TCPADisclaimer";
import { formatPhone, type LocationKey } from "@/data/croContent";
import { PHONE } from "@/lib/constants";
import { useUtmFields } from "@/hooks/useUtmFields";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Service = "trt" | "wl" | "ed";
type Theme   = "dark" | "light";

const SERVICE_LABELS: Record<Service, string> = {
  trt: "Testosterone Therapy",
  wl:  "Weight Loss",
  ed:  "ED Therapy",
};

const DARK_SURFACE  = "var(--brand-navy-deep)";
const LIGHT_SURFACE = "var(--brand-cream)";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FormEmbed() {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();

  const service  = (params.get("service")  as Service  | null) ?? "trt";
  const theme    = (params.get("theme")    as Theme    | null) ?? "dark";
  const source   = params.get("source") ?? "form-embed";
  const initLoc  = (params.get("location") as LocationKey | null) ?? "";
  // ?embed=1 or source=wp-* — suppress header copy when used inside an iframe embed
  const isEmbed  = params.get("embed") === "1" || source.startsWith("wp-");

  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState<LocationKey | "">(initLoc);
  const [tcpa,     setTcpa]     = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const nameRef  = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const isDark  = theme === "dark";
  const surface = isDark ? DARK_SURFACE : LIGHT_SURFACE;

  const controller = useLeadSubmitController<HeroLeadInput>({
    schema: heroLeadSchema,
    source,
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return {
        firstName: first || "Guest",
        lastName:  rest.join(" ") || undefined,
        email:     undefined,
        phone:     v.phone,
      };
    },
    onSuccess: (result, v) => {
      markSessionSubmitted();
      trackFunnelEvent("booking_started", { service, location: v.location });
      const [first, ...rest] = v.name.trim().split(/\s+/);
      enterBookingFunnel({
        identity: {
          firstName:     first || "Guest",
          lastName:      rest.join(" ") || undefined,
          email:         "",
          phone:         v.phone,
          ghlContactId:  result.contactId,
        },
        service,
        location: v.location,
        source,
        lpSlug: typeof window !== "undefined" ? window.location.pathname : undefined,
      }, navigate);
    },
    toastOnError: false,
  });

  // Sync field errors from controller
  const fe = controller.fieldErrors;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim())     next.name     = "Name is required";
    if (!phone.trim())    next.phone    = "Phone is required";
    if (!location)        next.location = "Please select a location";
    if (!tcpa)            next.tcpa     = "Consent required to continue";
    if (Object.keys(next).length) { setErrors(next); return; }
    setErrors({});
    controller.submit({ name, phone, location: location as LocationKey, tcpa });
  }

  function handlePhoneBlur() {
    if (phone.replace(/\D/g, "").length >= 7) {
      void capturePartialLead({ phone, name: name || undefined, source });
    }
  }

  const busy = controller.status === "submitting";
  const utmFields = useUtmFields();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Service label + headline — hidden in WP iframe embed mode */}
        {!isEmbed && (
          <>
            <p style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--brand-cta-accessible)",
              marginBottom: 12,
            }}>
              {SERVICE_LABELS[service] ?? "Men's Health"}
            </p>

            <h1 style={{
              fontFamily:  "Oswald, sans-serif",
              fontWeight:  700,
              fontSize:    "clamp(22px, 5vw, 30px)",
              lineHeight:  1.1,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              color:       isDark ? "var(--brand-cream)" : "var(--brand-navy-deep)",
              textAlign:   "center",
              marginBottom: 6,
            }}>
              Book in-person visit online
            </h1>

            <p style={{
              textAlign:  "center",
              fontSize:   14,
              color:      isDark ? "rgba(245,240,235,0.75)" : "rgba(11,16,41,0.65)",
              marginBottom: 24,
              lineHeight: 1.5,
            }}>
              Same-day availability · Licensed Virginia providers
            </p>
          </>
        )}

        {/* Card */}
        <div style={{
          background:   isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
          border:       isDark ? "1px solid rgba(255,255,255,0.35)" : "1px solid #E5E7EB",
          borderRadius: 16,
          padding:      "28px 24px",
          boxShadow:    isDark ? "none" : "0 4px 24px rgba(0,0,0,0.08)",
        }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Name */}
              <FloatInput
                id="fe-name"
                label="Full Name"
                autoComplete="name"
                value={name}
                onChange={(v) => { setName(v); setErrors((p) => ({ ...p, name: "" })); }}
                error={errors.name ?? fe.name}
                icon={<User size={16} strokeWidth={2} />}
                inputRef={nameRef}
                placeholder="John Smith"
              />

              {/* Phone */}
              <FloatInput
                id="fe-phone"
                label="Mobile Phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(v) => {
                  setPhone(formatPhone(v));
                  setErrors((p) => ({ ...p, phone: "" }));
                }}
                onBlur={handlePhoneBlur}
                error={errors.phone ?? fe.phone}
                icon={<Phone size={16} strokeWidth={2} />}
                inputRef={phoneRef}
                placeholder="(804) 555-0100"
              />

              {/* Location */}
              <div>
                <p style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: errors.location
                    ? "#DC2626"
                    : isDark ? "rgba(245,240,235,0.55)" : "rgba(11,16,41,0.50)",
                  marginBottom: 8, fontFamily: "Inter, sans-serif",
                }}>
                  Location
                </p>
                <LocationSelector
                  value={location}
                  onChange={(loc) => {
                    setLocation(loc);
                    setErrors((p) => ({ ...p, location: "" }));
                  }}
                />
                {(errors.location || fe.location) && (
                  <p role="alert" style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 12, color: "#DC2626", marginTop: 6,
                    fontFamily: "Inter, sans-serif",
                  }}>
                    <AlertCircle size={12} strokeWidth={2} />
                    {errors.location ?? fe.location}
                  </p>
                )}
              </div>

              {/* TCPA */}
              <TCPADisclaimer
                id="fe-tcpa"
                checked={tcpa}
                onChange={(v) => { setTcpa(v); setErrors((p) => ({ ...p, tcpa: "" })); }}
                error={errors.tcpa}
              />

              {/* Hidden UTM fields — read by pixels and tag managers on submit */}
              {Object.entries(utmFields).map(([key, val]) =>
                val ? <input key={key} type="hidden" name={key} value={val} /> : null
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            8,
                  width:          "100%",
                  height:         56,
                  background:     busy ? "var(--brand-cta-hover)" : "var(--brand-cta)",
                  color:          "#FFFFFF",
                  border:         "none",
                  borderRadius:   10,
                  fontSize:       16,
                  fontWeight:     700,
                  fontFamily:     "Inter, sans-serif",
                  letterSpacing:  "0.04em",
                  cursor:         busy ? "not-allowed" : "pointer",
                  transition:     "background 150ms ease",
                  marginTop:      4,
                }}
              >
                {busy
                  ? <><Loader2 size={18} className="animate-spin" /> Submitting…</>
                  : <>Book in-person visit online <ArrowRight size={18} strokeWidth={2.5} /></>
                }
              </button>

            </div>
          </form>
        </div>

        {/* Phone fallback */}
        <p style={{
          textAlign:  "center",
          marginTop:  16,
          fontSize:   13,
          color:      isDark ? "rgba(245,240,235,0.55)" : "rgba(11,16,41,0.50)",
        }}>
          Prefer to call?{" "}
          <a
            href={PHONE.tel}
            style={{
              color:          "var(--brand-cta-accessible)",
              fontWeight:     700,
              textDecoration: "none",
            }}
          >
            {PHONE.display}
          </a>
        </p>

      </div>
    </div>
  );
}

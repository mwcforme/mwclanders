
import { useState, useEffect, useRef } from "react";
import { Star, ChevronRight, Phone, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { TRTHeroForm } from "./TRTHeroForm";
import { LocationSelector } from "./LocationSelector";
import { TCPADisclaimer } from "./TCPADisclaimer";
import { formatPhone, type LocationKey, getLocationFromUrl } from "@/data/croContent";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { heroLeadSchema, type HeroLeadInput } from "@/domain/leads/leadFormSchema";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import { useNavigate } from "react-router-dom";

// Rotating services for home route only (desktop only — mobile uses static)
const ROTATING_SERVICES = ["TESTOSTERONE", "ED THERAPY", "WEIGHT LOSS", "MEN'S HEALTH"];

/** Read + sanitize a keyword from URL params. Returns null if absent/unsafe. */
function readKeyword(): string | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const raw = p.get("utm_term") ?? p.get("keyword") ?? p.get("kw") ?? p.get("term");
  if (!raw) return null;
  const decoded = decodeURIComponent(raw)
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-zA-Z0-9 '\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  if (!decoded) return null;
  return decoded.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Read service from URL params for mobile static headline */
function readService(): string | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const s = p.get("service") ?? p.get("utm_content");
  if (!s) return null;
  const map: Record<string, string> = {
    trt: "FOR TESTOSTERONE",
    ed: "FOR ED THERAPY",
    wl: "FOR WEIGHT LOSS",
    "weight-loss": "FOR WEIGHT LOSS",
    "weight_loss": "FOR WEIGHT LOSS",
  };
  return map[s.toLowerCase()] ?? null;
}

// Renders all words stacked — only active word visible via opacity.
const RotatingService = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ROTATING_SERVICES.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ display: "inline-block", position: "relative", whiteSpace: "nowrap" }}>
      <span aria-hidden="true" style={{ visibility: "hidden", whiteSpace: "nowrap" }}>TESTOSTERONE</span>
      {ROTATING_SERVICES.map((word, i) => (
        <span key={word} aria-hidden={i !== index} style={{
          position: "absolute", left: 0, top: 0, whiteSpace: "nowrap",
          opacity: i === index ? 1 : 0,
          transition: "opacity 300ms ease",
          willChange: "opacity",
        }}>{word}</span>
      ))}
    </span>
  );
};

const COLORS = {
  navyDeep: "var(--brand-navy-deep)",
  cream: "var(--brand-cream)",
  orange: "var(--brand-cta)",
};

// ── Mobile above-fold mini form (MWC-004/MWC-005) ─────────────────────────────
function MobileFoldForm() {
  const navigate = useNavigate();
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState<LocationKey | "">(() => getLocationFromUrl());
  const [tcpa,     setTcpa]     = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const controller = useLeadSubmitController<HeroLeadInput>({
    schema: heroLeadSchema,
    source: "mobile-fold-form",
    toLeadInput: (v) => ({
      firstName: "Guest",
      lastName: undefined,
      email: undefined,
      phone: v.phone,
    }),
    onSuccess: (result, v) => {
      markSessionSubmitted();
      trackFunnelEvent("booking_started", { location: v.location });
      enterBookingFunnel({
        identity: {
          firstName: "Guest",
          email: "",
          phone: v.phone,
          ghlContactId: result.contactId,
        },
        location: v.location,
        source: "mobile-fold-form",
        lpSlug: typeof window !== "undefined" ? window.location.pathname : undefined,
      }, navigate);
    },
    toastOnError: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!phone.trim())    next.phone    = "Phone required";
    if (!location)        next.location = "Select a location";
    if (!tcpa)            next.tcpa     = "Consent required";
    if (Object.keys(next).length) { setErrors(next); return; }
    setErrors({});
    controller.submit({ name: "Guest", phone, location: location as LocationKey, tcpa });
  }

  const busy = controller.status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate
      style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Phone */}
      <div style={{ position: "relative" }}>
        <Phone size={15} strokeWidth={2} style={{
          position: "absolute", left: 13, top: "50%",
          transform: "translateY(-50%)",
          // hardcoded-color-allow-next-line
          color: errors.phone ? "#DC2626" : "rgba(255,255,255,0.50)",
          pointerEvents: "none",
        }} />
        <input
          type="tel" inputMode="tel" autoComplete="tel"
          placeholder="Mobile phone"
          value={phone}
          onChange={e => { setPhone(formatPhone(e.target.value)); setErrors(p => ({ ...p, phone: "" })); }}
          onBlur={() => { if (phone.replace(/\D/g, "").length >= 7) void capturePartialLead({ phone, source: "mobile-fold-blur" }); }}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "13px 12px 13px 38px",
            borderRadius: 10,
            // hardcoded-color-allow-next-line
            border: `1.5px solid ${errors.phone ? "#DC2626" : "rgba(255,255,255,0.25)"}`,
            // hardcoded-color-allow-next-line
            background: "rgba(11,16,41,0.70)",
            backdropFilter: "blur(8px)",
            color: "#fff", fontSize: 15, fontFamily: "Inter, sans-serif",
            outline: "none",
          }}
        />
        {errors.phone && <p style={{ fontSize: 11, color: "#DC2626", marginTop: 3 }}>{errors.phone}</p>}
      </div>

      {/* Location */}
      <div>
        <LocationSelector
          value={location}
          onChange={k => { setLocation(k); setErrors(p => ({ ...p, location: "" })); }}
          error={errors.location}
        />
      </div>

      {/* TCPA */}
      <TCPADisclaimer
        checked={tcpa}
        onChange={v => { setTcpa(v); setErrors(p => ({ ...p, tcpa: "" })); }}
        error={errors.tcpa}
      />

      {/* Submit */}
      <button type="submit" disabled={busy} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: "100%", height: 54,
        background: busy ? "var(--brand-cta-hover)" : "var(--brand-cta)",
        color: "#fff", border: "none", borderRadius: 10,
        fontSize: 15, fontWeight: 700, fontFamily: "Inter, sans-serif",
        letterSpacing: "0.04em",
        cursor: busy ? "not-allowed" : "pointer",
        // hardcoded-color-allow-next-line
        boxShadow: "0 4px 20px rgba(232,103,10,0.40)",
      }}>
        {busy
          ? <><Loader2 size={16} className="animate-spin" /> Booking...</>
          : <>Book My No-Cost Consultation <ArrowRight size={16} strokeWidth={2.5} /></>
        }
      </button>
    </form>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TRTHeroProps {
  headline?: { line1: string; line2: string; line2Color?: string };
}

export const TRTHero = ({ headline }: TRTHeroProps = {}) => {
  const isStatic = !!headline;
  const h = headline ?? { line1: "VIRGINIA'S CHOICE", line2: "FOR MEN'S HEALTH", line2Color: COLORS.orange };

  const [keyword, setKeyword] = useState<string | null>(null);
  const [mobileService, setMobileService] = useState<string | null>(null);

  useEffect(() => {
    if (!isStatic) {
      setKeyword(readKeyword());
      setMobileService(readService());
    }
  }, [isStatic]);

  // Mobile second line — locked to service param, no rotation
  const mobileLine2 = isStatic
    ? h.line2
    : (mobileService ?? keyword ? `FOR ${keyword}` : "FOR MEN'S HEALTH");

  return (
    <section
      id="hero"
      className="relative flex items-start lg:items-center"
      style={{
        background: COLORS.navyDeep,
        minHeight: 720,
      }}
    >
      <a
        href="#hero-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:text-black focus:rounded"
      >
        Skip to lead form
      </a>

      {/* ── Mobile background image (hidden on lg+) ─────────────────────────── */}
      {/* MWC-004/MWC-010: New cinematic hero image as background on mobile */}
      <div
        aria-hidden="true"
        className="lg:hidden absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <picture>
          <source srcSet="/assets/lp/mwc-hero-mobile.webp" type="image/webp" />
          <img
            src="/assets/lp/mwc-hero-mobile.jpg"
            alt=""
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
              display: "block",
            }}
            width={600} height={900}
            loading="eager" decoding="async" fetchPriority="high"
          />
        </picture>
        {/* Overlay: #0B1029 at 62% — keeps contrast ratio >= 4.5:1 on white text */}
        <div style={{
          position: "absolute", inset: 0,
          // hardcoded-color-allow-next-line
          background: "linear-gradient(to bottom, rgba(11,16,41,0.62) 0%, rgba(11,16,41,0.78) 60%, rgba(11,16,41,0.95) 100%)",
        }} />
      </div>

      {/* Grain texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "220px 220px",
          zIndex: 1,
        }}
      />

      {/* ── Mobile layout (hidden on lg+) ── */}
      <div
        className="lg:hidden relative w-full px-5 pt-6 pb-8"
        style={{ zIndex: 2, minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}
      >
        {/* Static H1 locked to service — no rotation on mobile (MWC-004/MWC-009) */}
        <h1
          style={{
            fontFamily: "Oswald, 'Bebas Neue', Anton, sans-serif",
            fontSize: "clamp(38px, 10vw, 56px)",
            lineHeight: 1.0,
            letterSpacing: "-0.01em",
            color: COLORS.cream,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          <span style={{ display: "block", whiteSpace: "nowrap" }}>VIRGINIA&rsquo;S CHOICE</span>
          <span style={{ display: "block", color: COLORS.orange, whiteSpace: "nowrap" }}>
            {mobileLine2}
          </span>
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 15,
          // hardcoded-color-allow-next-line
          color: "rgba(245,240,235,0.82)",
          lineHeight: 1.5,
          marginBottom: 20,
        }}>
          No-cost 60-minute in-person visit. Same-day labs. No insurance needed.
        </p>

        {/* Mini form — phone + location + TCPA + CTA above fold */}
        <div style={{
          // hardcoded-color-allow-next-line
          background: "rgba(11,16,41,0.55)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 16,
          padding: "20px 16px",
          // hardcoded-color-allow-next-line
          border: "1px solid rgba(255,255,255,0.12)",
          marginBottom: 16,
        }}>
          <MobileFoldForm />
        </div>

        {/* Stars */}
        <a
          href={GBP_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <span style={{ display: "flex", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="#C9A961" stroke="#C9A961" />
            ))}
          </span>
          {/* hardcoded-color-allow-next-line */}
          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(245,240,235,0.70)", fontFamily: "Inter, sans-serif" }}>
            4.9 · 191 Google reviews
          </span>
        </a>
      </div>

      {/* ── Desktop layout (existing — hidden on mobile) ── */}
      <div className="hidden lg:grid relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 pt-32 pb-24 lg:grid-cols-[1fr_460px] gap-16 items-stretch">
        {/* LEFT */}
        <div className="flex flex-col">
          <h1
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, 'Bebas Neue', Anton, sans-serif",
              fontSize: "clamp(48px, 5vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: COLORS.cream,
              fontWeight: 700,
            }}
          >
            <span style={{ display: "block", whiteSpace: "nowrap" }}>VIRGINIA&rsquo;S CHOICE</span>
            {isStatic ? (
              <span style={{ display: "block", color: COLORS.orange, whiteSpace: "nowrap" }}>{h.line2}</span>
            ) : keyword ? (
              <span style={{
                display: "block", color: COLORS.orange,
                whiteSpace: "nowrap",
                fontSize: keyword.length > 22 ? "clamp(32px, 3.5vw, 64px)" : undefined,
              }}>FOR {keyword}</span>
            ) : (
              <span style={{ display: "block", color: COLORS.orange, whiteSpace: "nowrap" }}>
                FOR <RotatingService />
              </span>
            )}
          </h1>

          {/* Hero photo */}
          <div className="mt-6 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", position: "relative", flexShrink: 0 }}>
            <img
              src="/assets/lp/mwc-hero-mobile.webp"
              alt="Man at Men's Wellness Centers Virginia — in-person care, same-day labs"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%", display: "block" }}
              width={720} height={405} loading="eager" decoding="async"
            />
            <div aria-hidden style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
              background: "linear-gradient(to top, rgba(11,16,41,0.70) 0%, transparent 100%)", pointerEvents: "none",
            }} />
          </div>

          {/* Stars */}
          <a
            href={GBP_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <span style={{ display: "flex", gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#C9A961" stroke="#C9A961" />
              ))}
            </span>
            {/* hardcoded-color-allow-next-line */}
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(245,240,235,0.80)", fontFamily: "Inter, sans-serif" }}>4.9 · 191 verified Google reviews</span>
          </a>

          {/* Body copy */}
          <p
            className="mt-5 w-full"
            style={{
              // hardcoded-color-allow-next-line
              color: "rgba(245,240,235,0.88)",
              fontFamily: "Inter, sans-serif",
              fontSize: 19,
              lineHeight: 1.6,
            }}
          >
            You've been told your labs are normal. You don't feel normal. At Men's Wellness Centers, a licensed provider reviews your bloodwork and talks to you. Same visit. Same day. No referrals. No waiting rooms. No script.
          </p>

          {/* Chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {["Testosterone (TRT)", "ED Treatment", "Weight Loss"].map(label => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center",
                padding: "6px 14px", borderRadius: 999,
                border: "1.5px solid rgba(232,103,10,0.50)",
                background: "rgba(232,103,10,0.10)",
                fontFamily: "Inter, sans-serif",
                fontSize: 13, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: "rgba(245,240,235,0.90)",
              }}>{label}</span>
            ))}
            {["No insurance needed", "100% confidential", "Same-day availability"].map(label => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center",
                padding: "5px 12px", borderRadius: 999,
                border: "1.5px solid rgba(245,240,235,0.22)",
                background: "rgba(245,240,235,0.07)",
                fontFamily: "Inter, sans-serif",
                fontSize: 12, fontWeight: 600,
                letterSpacing: "0.04em",
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.75)",
              }}>{label}</span>
            ))}
          </div>

          {/* Symptom statements */}
          <div className="mt-6 flex flex-col gap-3">
            {[
              "Tired by noon. Coffee stopped working.",
              "Six months of training. Your body doesn't look like it.",
              "Sex drive is down. She\u2019s noticed too.",
              "Labs are fine. You\u2019re not.",
              "Forty-two years old and sleeping like you're eighty.",
            ].map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <ChevronRight size={16} strokeWidth={1.75} aria-hidden style={{ color: COLORS.orange, flexShrink: 0, marginTop: 3 }} />
                {/* hardcoded-color-allow-next-line */}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "rgba(245,240,235,0.88)", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - full form */}
        <div id="hero-form" className="w-full flex lg:justify-end">
          <div className="w-full">
            <TRTHeroForm formId="hero-trt" />
          </div>
        </div>
      </div>
    </section>
  );
};

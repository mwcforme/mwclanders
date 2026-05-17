/**
 * /product/trt/schedule — 2-step lead capture funnel
 *
 * Step 1: Location selector (3 radio cards)
 * Step 2: Lead form (First Name, Last Name, Phone + TCPA)
 *         → GHL upsert → navigate to /book/schedule with location pre-set
 *
 * Visual reference: MangoRx "TRT Online $99/Month" form card
 * MWC adaptation: no price, "No-cost consultation", provider image, our brand
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight, Check, Calendar } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { PHONE } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type LocationKey = "richmond" | "virginia-beach" | "newport-news";

const LOCATIONS: { key: LocationKey; label: string; address: string }[] = [
  { key: "richmond",      label: "Richmond",      address: "Glen Allen, VA" },
  { key: "virginia-beach", label: "Virginia Beach", address: "Virginia Beach, VA" },
  { key: "newport-news",  label: "Newport News",  address: "Newport News, VA" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductTRTSchedule() {
  const navigate = useNavigate();
  const setLocation = useBookingStore((s) => s.setLocation);
  const setIdentity = useBookingStore((s) => s.setIdentity);
  const resetStore  = useBookingStore((s) => s.reset);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLocation, setSelectedLocation] = useState<LocationKey | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [tcpa,      setTcpa]      = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(false);

  const clearErr = (k: string) => setErrors((p) => { const { [k]: _, ...r } = p; return r; });

  // ── Step 1 submit ────────────────────────────────────────────────────────
  const handleLocationNext = () => {
    if (!selectedLocation) {
      setErrors({ location: "Please choose a location." });
      return;
    }
    setErrors({});
    setStep(2);
  };

  // ── Step 2 submit ────────────────────────────────────────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!firstName.trim()) fe.firstName = "First name is required";
    if (!lastName.trim())  fe.lastName  = "Last name is required";
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) fe.phone = "Enter a valid 10-digit phone number";
    if (!tcpa) fe.tcpa = "Please agree to receive SMS to confirm your appointment";
    if (Object.keys(fe).length) { setErrors(fe); return; }

    setLoading(true);

    const formattedPhone = `+1${digits}`;

    // Seed booking store
    resetStore();
    setLocation(selectedLocation!);
    setIdentity({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      phone:     formattedPhone,
      email:     "",
    });

    // Fire-and-forget GHL upsert
    try {
      const { upsertContact } = await import("@/lib/ghlCalendars");
      const contactId = await upsertContact({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        phone:     formattedPhone,
        source:    "product-trt-funnel",
        tags:      ["product-trt"],
        customFields: { mwc_funnel_service: "trt" },
      });
      setIdentity({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        phone:     formattedPhone,
        email:     "",
        ghlContactId: contactId,
      });
    } catch {
      /* non-blocking — booking still proceeds */
    }

    setLoading(false);
    navigate("/book/schedule");
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F4F6FA" }}>
      <SEO
        title="Schedule Your Consultation | Men's Wellness Centers"
        description="Book your no-cost testosterone consultation at a Virginia Men's Wellness Centers location."
      />
      <TRTHeader />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 48px" }}>

        {/* ── STEP 1: Location selector ──────────────────────────────────── */}
        {step === 1 && (
          <div style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "40px 36px",
            width: "100%",
            maxWidth: 520,
            boxShadow: "0 8px 40px rgba(11,16,41,0.12)",
          }}>
            {/* Icon + heading */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "rgba(232,103,10,0.10)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <MapPin size={28} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />
              </div>
              <h1 style={{
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: 28, color: "var(--brand-navy)",
                lineHeight: 1.15, marginBottom: 8,
              }}>
                Choose Your Location
              </h1>
              <p style={{ fontSize: 15, color: "#666", lineHeight: 1.5 }}>
                Select the Men's Wellness Centers nearest to you.
              </p>
              <div style={{ width: 48, height: 3, background: "var(--brand-cta)", margin: "16px auto 0", borderRadius: 2 }} />
            </div>

            {/* Location radio cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {LOCATIONS.map(({ key, label, address }) => {
                const sel = selectedLocation === key;
                return (
                  <label
                    key={key}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 18px",
                      borderRadius: 10,
                      border: `2px solid ${sel ? "var(--brand-cta)" : "#E0E4EC"}`,
                      background: sel ? "rgba(232,103,10,0.04)" : "#FAFBFC",
                      cursor: "pointer",
                      transition: "border-color 150ms ease, background 150ms ease",
                      boxShadow: sel ? "0 0 0 3px rgba(232,103,10,0.12)" : "none",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="radio"
                      name="location"
                      value={key}
                      checked={sel}
                      onChange={() => { setSelectedLocation(key); clearErr("location"); }}
                      style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                    />
                    {/* Custom radio */}
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      border: `2px solid ${sel ? "var(--brand-cta)" : "#C0C8D8"}`,
                      background: "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "border-color 150ms",
                    }}>
                      {sel && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--brand-cta)" }} />}
                    </div>
                    <MapPin size={16} strokeWidth={2} style={{ color: sel ? "var(--brand-cta)" : "#8898AA", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--brand-navy)", lineHeight: 1.2 }}>{label}</div>
                      <div style={{ fontSize: 12, color: "#8898AA", marginTop: 2 }}>{address}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {errors.location && (
              <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{errors.location}</p>
            )}

            <button
              type="button"
              onClick={handleLocationNext}
              style={{
                width: "100%", height: 56, borderRadius: 999,
                background: "var(--brand-cta)", color: "#FFFFFF",
                border: "none", fontFamily: "Oswald, sans-serif",
                fontWeight: 700, fontSize: 17, letterSpacing: "0.04em",
                textTransform: "uppercase", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 20px rgba(232,103,10,0.35)",
              }}
            >
              Continue <ArrowRight size={18} strokeWidth={2.5} />
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "#9AA0AC", marginTop: 14 }}>
              No-cost consultation · Same-day labs · Virginia locations
            </p>
          </div>
        )}

        {/* ── STEP 2: Lead form (MangoRx-style) ──────────────────────────── */}
        {step === 2 && (
          <div style={{
            background: "#FFFFFF",
            borderRadius: 16,
            width: "100%",
            maxWidth: 520,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(11,16,41,0.12)",
          }}>
            {/* Provider image header — matches MangoRx doctor above form */}
            <div style={{
              position: "relative",
              height: 220,
              background: "#1a1a2e",
              overflow: "hidden",
            }}>
              <img
                src="/src/assets/lp/provider-headshot.webp"
                alt="Men's Wellness Centers licensed provider"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Dark overlay + title — MangoRx "TRT Online / $99/Month" equivalent */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(0deg, rgba(11,16,41,0.95) 0%, rgba(11,16,41,0.70) 60%, transparent 100%)",
                padding: "20px 24px 18px",
                textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "Oswald, sans-serif", fontWeight: 700,
                  fontSize: 26, color: "#FFFFFF", lineHeight: 1.1,
                }}>
                  TRT In-Person
                </div>
                <div style={{
                  fontFamily: "Oswald, sans-serif", fontWeight: 700,
                  fontSize: 22, color: "var(--brand-cta)", lineHeight: 1.1, marginTop: 2,
                }}>
                  No-Cost Consultation
                </div>
              </div>
            </div>

            {/* Form body */}
            <div style={{ padding: "24px 28px 28px" }}>
              {/* Promo banner — MangoRx's "Promo Applied: Free Testosterone Test" equivalent */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(22,163,74,0.08)",
                border: "1px solid rgba(22,163,74,0.25)",
                marginBottom: 20,
              }}>
                <Check size={15} strokeWidth={2.5} style={{ color: "#16a34a", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 700 }}>
                  Included: </span>
                <span style={{ fontSize: 13, color: "#374151" }}>
                  Free Same-Day Lab Panel · {LOCATIONS.find(l => l.key === selectedLocation)?.label}
                </span>
              </div>

              <form onSubmit={handleFormSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* First Name */}
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    autoComplete="given-name"
                    onChange={(e) => { setFirstName(e.target.value); clearErr("firstName"); }}
                    style={{
                      width: "100%", height: 52, borderRadius: 8,
                      border: `1.5px solid ${errors.firstName ? "#DC2626" : "#D1D5DB"}`,
                      padding: "0 16px", fontSize: 16, fontFamily: "Inter, sans-serif",
                      color: "#111", outline: "none", background: "#FAFBFC",
                      transition: "border-color 150ms",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-cta)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = errors.firstName ? "#DC2626" : "#D1D5DB")}
                  />
                  {errors.firstName && <p style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    autoComplete="family-name"
                    onChange={(e) => { setLastName(e.target.value); clearErr("lastName"); }}
                    style={{
                      width: "100%", height: 52, borderRadius: 8,
                      border: `1.5px solid ${errors.lastName ? "#DC2626" : "#D1D5DB"}`,
                      padding: "0 16px", fontSize: 16, fontFamily: "Inter, sans-serif",
                      color: "#111", outline: "none", background: "#FAFBFC",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-cta)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = errors.lastName ? "#DC2626" : "#D1D5DB")}
                  />
                  {errors.lastName && <p style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>{errors.lastName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="Phone Number *"
                    value={phone}
                    autoComplete="tel"
                    onChange={(e) => { setPhone(formatPhone(e.target.value)); clearErr("phone"); }}
                    style={{
                      width: "100%", height: 52, borderRadius: 8,
                      border: `1.5px solid ${errors.phone ? "#DC2626" : "#D1D5DB"}`,
                      padding: "0 16px", fontSize: 16, fontFamily: "Inter, sans-serif",
                      color: "#111", outline: "none", background: "#FAFBFC",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-cta)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = errors.phone ? "#DC2626" : "#D1D5DB")}
                  />
                  {errors.phone && <p style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
                </div>

                {/* TCPA */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={tcpa}
                    onChange={(e) => { setTcpa(e.target.checked); clearErr("tcpa"); }}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    border: `2px solid ${tcpa ? "var(--brand-cta)" : (errors.tcpa ? "#DC2626" : "#D1D5DB")}`,
                    background: tcpa ? "var(--brand-cta)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 150ms",
                  }}>
                    {tcpa && <Check size={12} strokeWidth={3} style={{ color: "#FFFFFF" }} />}
                  </div>
                  <span style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
                    I agree to receive SMS/texts about my appointment. Reply STOP to opt out. Msg &amp; data rates may apply. Not a condition of service.{" "}
                    <a href="/privacy-policy" style={{ color: "var(--brand-cta)", textDecoration: "none" }}>Privacy Policy</a>
                  </span>
                </label>
                {errors.tcpa && <p style={{ color: "#DC2626", fontSize: 12, marginTop: -4 }}>{errors.tcpa}</p>}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", height: 56, borderRadius: 999, marginTop: 8,
                    background: loading ? "rgba(232,103,10,0.6)" : "var(--brand-cta)",
                    color: "#FFFFFF", border: "none",
                    fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 17,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 4px 20px rgba(232,103,10,0.35)",
                  }}
                >
                  {loading ? "Setting up…" : "Continue"}
                </button>

                {/* Legal line — MangoRx pattern */}
                <p style={{ fontSize: 11, color: "#9AA0AC", textAlign: "center", lineHeight: 1.5, marginTop: 4 }}>
                  By clicking Continue, you agree to our{" "}
                  <a href="/terms-of-service" style={{ color: "#666", textDecoration: "underline" }}>Terms &amp; Conditions</a>
                  {" "}&amp;{" "}
                  <a href="/privacy-policy" style={{ color: "#666", textDecoration: "underline" }}>Privacy Policy</a>
                </p>
              </form>

              {/* Back link */}
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "#9AA0AC", fontSize: 13, cursor: "pointer", marginTop: 8, display: "block", width: "100%", textAlign: "center" }}
              >
                ← Change location
              </button>
            </div>
          </div>
        )}
      </main>

      <TRTFooter />
    </div>
  );
}

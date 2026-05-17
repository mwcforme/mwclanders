/**
 * /book/contact — Step 1 of the new booking funnel.
 *
 * Collects first name + phone + SMS consent.
 * Immediately upserts the GHL contact so we have the lead even on abandonment.
 * Navigates to /book/location on success.
 */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { PHONE } from "@/lib/constants";

const ERROR_RED = "#DC2626";
const ORANGE = "#E8670A";
const NAVY = "#0B1029";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function rawDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

const BookContact = () => {
  const navigate = useNavigate();
  const patch = useBookingStore((s) => s.patch);
  const setIdentity = useBookingStore((s) => s.setIdentity);
  const existingSource = useBookingStore((s) => s.source);
  const existingService = useBookingStore((s) => s.service);

  // Pre-populate from store if short form already captured phone
  const existingIdentity = useBookingStore((s) => s.identity);
  const existingPhone = existingIdentity?.phone ?? "";
  // Format stored E.164 (+1XXXXXXXXXX) back to display format for the field
  const prefilledPhone = existingPhone.startsWith("+1")
    ? formatPhone(existingPhone.slice(2))
    : formatPhone(existingPhone);

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState(prefilledPhone);
  const [smsConsent, setSmsConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const phoneRef = useRef<HTMLInputElement>(null);

  const clearError = (field: string) =>
    setErrors((prev) => { const { [field]: _, ...rest } = prev; return rest; });

  const validate = (): boolean => {
    const fe: Record<string, string> = {};
    if (!firstName.trim()) fe.firstName = "First name is required";
    const digits = rawDigits(phone);
    if (digits.length !== 10) fe.phone = "Enter a valid 10-digit phone number";
    if (!smsConsent) fe.smsConsent = "Please agree to receive texts";
    setErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const digits = rawDigits(phone);
    const formattedPhone = `+1${digits}`;

    try {
      let contactId = existingIdentity?.ghlContactId;

      if (contactId) {
        // Already have a GHL contact (from short form) — just update name
        const { supabase } = await import("@/integrations/supabase/client");
        supabase.functions.invoke("ghl-proxy", {
          body: {
            path: `/contacts/${contactId}`,
            method: "PUT",
            body: { firstName: firstName.trim() },
            __env: (await import("@/lib/env")).APP_ENV,
          },
        }).catch(() => { /* non-blocking */ });
      } else {
        // No prior contact — upsert via phone (idempotent)
        const { upsertContact } = await import("@/lib/ghlCalendars");
        contactId = await upsertContact({
          firstName: firstName.trim(),
          phone: formattedPhone,
          source: existingSource || "mwc-book-funnel",
          tags: ["funnel-contact"],
          customFields: existingService
            ? { mwc_funnel_service: existingService }
            : undefined,
        });
      }

      setIdentity({
        firstName: firstName.trim(),
        phone: formattedPhone,
        email: "", // collected on confirmation page
        ghlContactId: contactId,
      });

      patch({ source: existingSource || "mwc-book-funnel" });
      navigate("/book/location");
    } catch (err) {
      console.error("[BookContact] upsert error", err);
      // Even on GHL failure, allow progression — coordinator can recover
      setIdentity({
        firstName: firstName.trim(),
        phone: formattedPhone,
        email: "",
        ghlContactId: existingIdentity?.ghlContactId,
      });
      navigate("/book/location");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%",
    height: 54,
    borderRadius: 10,
    border: `2px solid #3A4258`,
    background: "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Inter, sans-serif",
    padding: "0 16px",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <BookLayout page="contact" title="Book Your Consultation | Men's Wellness Centers">
      <div className="px-4 md:px-8 py-6 md:py-10 flex flex-col items-center" style={{ minHeight: "70vh" }}>
        <div className="w-full" style={{ maxWidth: 480 }}>

          {/* Progress */}
          <div className="flex gap-1 mb-2" role="progressbar" aria-label="Step 1 of 3" aria-valuemin={0} aria-valuemax={3} aria-valuenow={1}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1"
                style={{ height: 3, borderRadius: 2, background: i === 0 ? ORANGE : "rgba(255,255,255,0.15)" }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter, sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>
            Step 1 of 3
          </p>

          {/* Heading */}
          <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "clamp(22px, 4vw, 30px)", color: "#FFFFFF", marginBottom: 8, lineHeight: 1.2 }}>
            Let's get you set up.
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "rgba(255,255,255,0.60)", marginBottom: 32, lineHeight: 1.5 }}>
            We'll text you a reminder before your visit.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.80)", fontFamily: "Inter, sans-serif", marginBottom: 6, letterSpacing: "0.03em" }}
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="John"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ORANGE)}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.firstName ? ERROR_RED : "#3A4258")}
                style={{ ...inp, borderColor: errors.firstName ? ERROR_RED : "#3A4258" }}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
              />
              {errors.firstName && (
                <p id="firstName-error" style={{ color: ERROR_RED, fontSize: 13, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{errors.firstName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.80)", fontFamily: "Inter, sans-serif", marginBottom: 6, letterSpacing: "0.03em" }}
              >
                Phone Number
              </label>
              <input
                id="phone"
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => { setPhone(formatPhone(e.target.value)); clearError("phone"); }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ORANGE)}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.phone ? ERROR_RED : "#3A4258")}
                style={{ ...inp, borderColor: errors.phone ? ERROR_RED : "#3A4258" }}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p id="phone-error" style={{ color: ERROR_RED, fontSize: 13, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{errors.phone}</p>
              )}
            </div>

            {/* SMS Consent */}
            <label
              style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => { setSmsConsent(e.target.checked); clearError("smsConsent"); }}
                style={{ marginTop: 3, accentColor: ORANGE, width: 18, height: 18, flexShrink: 0 }}
              />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                I agree to receive appointment reminders and health updates via text. Message &amp; data rates may apply. Reply STOP to opt out.
              </span>
            </label>
            {errors.smsConsent && (
              <p style={{ color: ERROR_RED, fontSize: 13, marginTop: -8, fontFamily: "Inter, sans-serif" }}>{errors.smsConsent}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 56,
                background: loading ? "rgba(232,103,10,0.5)" : ORANGE,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 16px rgba(232,103,10,0.40)",
                transition: "background 0.2s, box-shadow 0.2s",
                marginTop: 4,
              }}
            >
              {loading ? "Setting up…" : <span className="inline-flex items-center gap-2">Continue <ArrowRight size={18} strokeWidth={2.5} /></span>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Need help?{" "}
            <a href={PHONE.tel} style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>
              {PHONE.display}
            </a>
          </p>
        </div>
      </div>
    </BookLayout>
  );
};

export default BookContact;

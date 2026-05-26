import { useState } from "react";
import { Send } from "lucide-react";
import { contactUpdater } from "@/services/contactUpdater";
import { useBookingStore } from "@/domain/booking/bookingStore";

// Exact computed styles from mwclocked.pplx.app/#/confirmed:
// - "Your email address" label: color rgb(10,15,41) size 17px weight 600
// - Input: white bg, dark border
// - "Send to my email" button: orange bg, white text, uppercase, weight 700

interface Props {
  contactId?: string;
  onComplete: () => void;
}

export function EmailCapture({ contactId, onComplete }: Props) {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const setIdentity = useBookingStore((s) => s.setIdentity);
  const identity    = useBookingStore((s) => s.identity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Valid email required");
      return;
    }
    setError("");
    setLoading(true);
    if (identity) setIdentity({ ...identity, email: trimmed });
    if (contactId) contactUpdater.updateContact(contactId, { email: trimmed }).catch(() => {});
    setLoading(false);
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* "Your email address" label — rgb(10,15,41) weight 600 */}
      {/* Label: 17px weight 600 per mockup */}
      <label htmlFor="email-capture-input" style={{
        fontSize: 17, fontWeight: 600,
        // hardcoded-color-allow-next-line
        color: "#0A0F29", fontFamily: "Inter, sans-serif",
      }}>
        Your email address
      </label>
      <input
        type="email"
        id="email-capture-input"
        aria-label="Email address"
        aria-invalid={!!error}
        aria-describedby={error ? "email-capture-error" : undefined}
        placeholder="you@example.com"
        value={email}
        autoComplete="email"
        inputMode="email"
        onChange={(e) => { setEmail(e.target.value); setError(""); }}
        style={{
          width: "100%", height: 52, borderRadius: 10, boxSizing: "border-box",
          // hardcoded-color-allow-next-line
          border: `1.5px solid ${error ? "#dc2626" : "rgba(10,15,41,0.20)"}`,
          background: "#FFFFFF",
          // hardcoded-color-allow-next-line
          color: "#0A0F29",
          fontSize: 17, fontFamily: "Inter, sans-serif", padding: "0 16px", outline: "none",
        }}
      />
      {/* "SEND TO MY EMAIL" button — orange full-width uppercase */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%", height: 52,
          background: "var(--brand-cta)", color: "#FFFFFF",
          border: "none", borderRadius: 10,
          fontFamily: "Montserrat, Inter, sans-serif",
          fontSize: 17, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          // hardcoded-color-allow-next-line
          boxShadow: "0 8px 20px -6px rgba(232,103,10,0.40)",
        }}
      >
        <Send size={16} strokeWidth={2} aria-hidden /> Send to my email
      </button>
      {error && (
        <p id="email-capture-error" role="alert" style={{
          // hardcoded-color-allow-next-line
          color: "#dc2626", fontSize: 14, margin: 0, fontFamily: "Inter, sans-serif",
        }}>
          {error}
        </p>
      )}
    </form>
  );
}

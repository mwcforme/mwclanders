import { useState } from "react";
import { Send } from "lucide-react";
import { contactUpdater } from "@/services/contactUpdater";
import { useBookingStore } from "@/domain/booking/bookingStore";

interface Props {
  contactId?: string;
  onComplete: () => void;
}

export function EmailCapture({ contactId, onComplete }: Props) {
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
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
          border: `1.5px solid ${error ? "#f87171" : "rgba(255,255,255,0.15)"}`,
          // hardcoded-color-allow-next-line
          background: "rgba(255,255,255,0.07)",
          // hardcoded-color-allow-next-line
          color: "rgba(255,255,255,0.92)",
          fontSize: 16, fontFamily: "Inter, sans-serif", padding: "0 16px", outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%", height: 52, background: "var(--brand-cta)", color: "#FFF",
          border: "none", borderRadius: 10, fontFamily: "Montserrat, Inter, sans-serif",
          fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          // hardcoded-color-allow-next-line
          boxShadow: "0 8px 20px -6px rgba(232,103,10,0.45)",
        }}
      >
        <Send size={16} strokeWidth={2} aria-hidden /> Send to my email
      </button>
      {error && (
        <p id="email-capture-error" role="alert" style={{
          // hardcoded-color-allow-next-line
          color: "#f87171", fontSize: 14, margin: 0, fontFamily: "Inter, sans-serif",
        }}>
          {error}
        </p>
      )}
    </form>
  );
}

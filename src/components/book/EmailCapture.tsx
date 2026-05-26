import { useState } from "react";
import { Send } from "lucide-react";
import { contactUpdater } from "@/services/contactUpdater";
import { useBookingStore } from "@/domain/booking/bookingStore";

// Mockup source: display:flex; gap:8px (inline input + button side by side)
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
    <div>
      {/* Mockup: form display:flex gap:8px — inline layout */}
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          id="email-capture-input"
          aria-label="Email address"
          aria-invalid={!!error}
          aria-describedby={error ? "email-capture-error" : undefined}
          placeholder="your@email.com"
          value={email}
          autoComplete="email"
          inputMode="email"
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          style={{
            flex: 1, height: 44, borderRadius: 8,
            // hardcoded-color-allow-next-line
            border: `1.5px solid ${error ? "#f87171" : "rgba(255,255,255,0.15)"}`,
            // hardcoded-color-allow-next-line
            background: "rgba(255,255,255,0.07)",
            // hardcoded-color-allow-next-line
            color: "rgba(255,255,255,0.92)",
            fontSize: 16, fontFamily: "Inter, sans-serif", padding: "0 14px", outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 44, padding: "0 18px", background: "var(--brand-cta)", color: "#FFF",
            border: "none", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 14,
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}
        >
          <Send size={14} strokeWidth={2} /> Send
        </button>
      </form>
      {error && (
        <p id="email-capture-error" role="alert" style={{
          // hardcoded-color-allow-next-line
          color: "#f87171", fontSize: 14, marginTop: 4, fontFamily: "Inter, sans-serif",
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

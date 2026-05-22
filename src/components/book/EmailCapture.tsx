import { useState } from "react";
import { Send } from "lucide-react";
import { contactUpdater } from "@/services/contactUpdater";
import { useBookingStore } from "@/domain/booking/bookingStore";

interface Props {
  contactId?: string;
  onComplete: () => void;
}

export function EmailCapture({ contactId, onComplete }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setIdentity = useBookingStore((s) => s.setIdentity);
  const identity = useBookingStore((s) => s.identity);

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
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#374151", marginBottom: 10 }}>
        We'll send your appointment details and a reminder.
      </p>
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          autoComplete="email"
          inputMode="email"
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          style={{
            flex: 1, height: 44, borderRadius: 8,
            border: `1.5px solid ${error ? "var(--c-error-on-light)" : "#D1D5DB"}`,
            background: "#F9FAFB", color: "#111827",
            fontSize: 15, fontFamily: "Inter, sans-serif", padding: "0 14px", outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 44, padding: "0 18px", background: "var(--brand-cta)", color: "#FFF",
            border: "none", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 13,
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}
        >
          <Send size={14} strokeWidth={2} /> Send
        </button>
      </form>
      {error && <p style={{ color: "var(--c-error-on-light)", fontSize: 12, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{error}</p>}
    </div>
  );
}

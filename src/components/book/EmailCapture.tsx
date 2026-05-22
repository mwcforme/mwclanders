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
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: "20px 20px" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(245,243,240,0.80)", marginBottom: 4 }}>
        Want a copy of your confirmation?
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
            border: `1.5px solid ${error ? "#FF6B7A" : "rgba(255,255,255,0.15)"}`,
            background: "rgba(255,255,255,0.07)", color: "var(--brand-cream)",
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
      {error && <p style={{ color: "#FF6B7A", fontSize: 12, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{error}</p>}
    </div>
  );
}

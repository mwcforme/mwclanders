import { Check, FlaskConical, Stethoscope, ClipboardList } from "lucide-react";

/** "What Is Included" glassmorphic card shown above the hero form in ProductTRT. */
export const TRTIncludedCard = () => (
  <div style={{
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  }}>
    <div style={{
      padding: "12px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(11,16,41,0.60)",
    }}>
      <span style={{
        fontFamily: "Oswald, sans-serif",
        fontWeight: 700,
        fontSize: 13,
        color: "#fff",
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
      }}>
        What Is Included
      </span>
    </div>
    {([
      { icon: <FlaskConical size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Full Hormone Lab Panel" },
      { icon: <Stethoscope  size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Provider Visitsultation" },
      { icon: <ClipboardList size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Personalized Treatment Plan" },
    ] as const).map(({ icon, title }) => (
      <div key={title} style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {icon}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#fff" }}>{title}</span>
        <span style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--c-success-on-dark)",
        }}>
          <Check size={12} strokeWidth={3} color="var(--c-success-on-dark)" />
          Included
        </span>
      </div>
    ))}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 20px",
      background: "rgba(11,16,41,0.80)",
    }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>Total</span>
      <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--brand-cta)" }}>
        $0 No-cost visit
      </span>
    </div>
  </div>
);

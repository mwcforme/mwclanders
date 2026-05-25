import { ChevronRight, LucideIcon } from "lucide-react";

interface OptionRowProps {
  icon?: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const OptionRow = ({ icon: Icon, label, selected, onClick }: OptionRowProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    style={{
      width: "100%",
      minHeight: 64,
      background: selected ? "rgba(232,103,10,0.10)" : "rgba(255,255,255,0.04)",
      border: selected ? "1px solid var(--brand-cta)" : "1px solid rgba(255,255,255,0.10)",
      borderLeft: selected ? "4px solid var(--brand-cta)" : "4px solid transparent",
      borderRadius: 14,
      padding: Icon ? "0 18px 0 16px" : "0 18px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 14,
      textAlign: "left",
      transition: "background 150ms ease-out, border-color 150ms ease-out",
      WebkitTapHighlightColor: "transparent",
    }}
  >
    {Icon && (
      <Icon
        size={20}
        strokeWidth={1.75}
        style={{ color: selected ? "var(--brand-cta)" : "rgba(255,255,255,0.40)", flexShrink: 0 }}
        aria-hidden
      />
    )}
    <span style={{
      fontFamily: "Inter, sans-serif",
      fontSize: 17,
      fontWeight: 500,
      color: selected ? "var(--brand-cream)" : "rgba(255,255,255,0.85)",
      flex: 1,
      lineHeight: 1.4,
    }}>
      {label}
    </span>
    {selected && <ChevronRight size={16} style={{ color: "var(--brand-cta)", flexShrink: 0 }} aria-hidden />}
  </button>
);

export default OptionRow;

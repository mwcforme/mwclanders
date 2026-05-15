import { ChevronRight, LucideIcon } from "lucide-react";

interface OptionRowProps {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * Refined survey option row.
 * - Soft default border (#E5E7EB) — clean, not boxy
 * - Hover lifts and tints the icon chip
 * - Selection: orange ring + warm cream fill, no thick border jump
 * - 17/20px Inter, 600 weight, generous tap target
 */
const OptionRow = ({ icon: Icon, label, selected, onClick }: OptionRowProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    data-selected={selected}
    className="group flex w-full items-center gap-3 md:gap-4 transition-all focus:outline-none focus-visible:ring-4 min-h-[68px] md:min-h-[84px] px-4 md:px-5 py-3 md:py-4 hover:-translate-y-[1px]"
    style={{
      borderRadius: 14,
      border: `2px solid ${selected ? "#E8670A" : "#8B92A0"}`,
      background: selected ? "#FFF7F0" : "#FFFFFF",
      cursor: "pointer",
      transition: "border-color 160ms, background-color 160ms, box-shadow 160ms, transform 160ms",
      outlineColor: "#E8670A",
      outlineOffset: 2,
      boxShadow: selected
        ? "0 0 0 4px rgba(232,103,10,0.15), 0 6px 16px -8px rgba(232,103,10,0.35)"
        : "0 1px 2px rgba(15,23,42,0.04)",
      WebkitTapHighlightColor: "transparent",
    }}
  >
    <span
      aria-hidden="true"
      className="flex items-center justify-center flex-shrink-0 w-11 h-11 md:w-12 md:h-12 transition-colors group-hover:bg-[#FFEDDD]"
      style={{
        borderRadius: 10,
        background: selected ? "#E8670A" : "#FFF1E3",
      }}
    >
      <Icon
        size={22}
        strokeWidth={2.25}
        style={{ color: selected ? "#FFFFFF" : "#E8670A" }}
      />
    </span>
    <span
      className="flex-1 text-left text-[17px] md:text-[19px]"
      style={{
        color: "#0B1029",
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.005em",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {label}
    </span>
    <ChevronRight
      size={22}
      strokeWidth={2.25}
      className="transition-transform group-hover:translate-x-0.5"
      style={{ color: selected ? "#E8670A" : "#6B7280", flexShrink: 0 }}
      aria-hidden="true"
    />
  </button>
);

export default OptionRow;

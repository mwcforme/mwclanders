import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { isSundayInTimeZone } from "@/lib/etDate";
import { TIMEZONE } from "@/lib/ghlCalendars";
import { INK, MUTED, LINE, BORDER, SURFACE, ORANGE, ymd, fmtDayShort, fmtMonthDay, fmtTimeParts, fmtFullDay, isTodayET, isTomorrowET } from "./ghlAccordionHelpers";

// ─── SlotButton ───────────────────────────────────────────────────────────────

interface SlotButtonProps {
  iso: string;
  selected: boolean;
  onSelect: (iso: string) => void;
}

const SlotButton = memo(function SlotButton({ iso, selected, onSelect }: SlotButtonProps) {
  const { time, ampm } = fmtTimeParts(iso);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(iso)}
      style={{
        background: selected ? ORANGE : SURFACE,
        border: selected ? "1px solid transparent" : `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "16px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: selected ? "var(--c-text-on-dark)" : INK,
        cursor: "pointer",
        textAlign: "center",
        transition: "background-color 120ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.01em" }}>
          {time}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: selected ? INK : MUTED }}>
          {ampm}
        </span>
      </div>
    </button>
  );
});

// ─── AccordionDay ─────────────────────────────────────────────────────────────

export interface AccordionDayProps {
  day: Date;
  slots: string[];
  expanded: boolean;
  selectedSlot: string | null;
  onToggle: (key: string, isExpanded: boolean) => void;
  onSelectSlot: (iso: string) => void;
}

export const AccordionDay = memo(function AccordionDay({
  day,
  slots,
  expanded,
  selectedSlot,
  onToggle,
  onSelectSlot,
}: AccordionDayProps) {
  const key = ymd(day);
  const isSunday = isSundayInTimeZone(day, TIMEZONE);
  const count = slots.length;
  const available = count > 0 && !isSunday;
  const isExpanded = expanded && available;
  const isToday = isTodayET(day);
  const isTomorrow = isTomorrowET(day);
  const ribbon = isToday ? "TODAY" : isTomorrow ? "TMRW" : null;
  const headerBg = isExpanded ? ORANGE : INK;
  // WCAG AA: INK (#0B1029) on #B84A08 = 3.74:1 FAILS for 11px text.
  // white on #B84A08 = 5.22:1 ✅; white on INK = 19.5:1 ✅ — use white always.
  const headerColor = "var(--c-text-on-dark)";
  const disabled = !available;
  const badgeText = isSunday ? "Closed" : !available ? "Full" : `${count} slots`;

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: isExpanded ? "none" : `1px solid ${LINE}` }}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={isExpanded}
        aria-label={`${fmtFullDay(day)} — ${badgeText}`}
        onClick={() => { if (!disabled) onToggle(key, isExpanded); }}
        style={{
          width: "100%",
          // hardcoded-color-allow-next-line
          background: disabled ? "#F1F2F6" : headerBg,
          color: disabled ? MUTED : headerColor,
          border: 0, padding: "14px 16px", display: "flex", alignItems: "center",
          justifyContent: "space-between", cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left", opacity: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ribbon && (
            <span style={{
              display: "inline-block", alignSelf: "flex-start",
              background: isExpanded ? INK : ORANGE, color: "var(--c-text-on-dark)",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
              padding: "2px 6px", borderRadius: 4, marginBottom: 2,
            }}>
              {ribbon}
            </span>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>{fmtDayShort(day)}</span>
          <span style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.02em" }}>
            {fmtMonthDay(day)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>{badgeText}</span>
          {!disabled && (
            <span style={{ display: "inline-flex", transition: "transform 280ms ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              <ChevronDown size={18} />
            </span>
          )}
        </div>
      </button>

      <div style={{ display: "grid", gridTemplateRows: isExpanded ? "1fr" : "0fr", transition: "grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            background: SURFACE, borderLeft: `1px solid ${ORANGE}`, borderRight: `1px solid ${ORANGE}`,
            borderBottom: `1px solid ${ORANGE}`, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 14,
          }}>
            <div className="grid grid-cols-2 gap-3">
              {slots.map((iso) => (
                <SlotButton key={iso} iso={iso} selected={iso === selectedSlot} onSelect={onSelectSlot} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

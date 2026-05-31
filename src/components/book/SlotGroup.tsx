/**
 * SlotGroup — renders a labeled group of time slots (Morning / Afternoon / Evening).
 * Matches mwclocked.pplx.app/#/ reference design.
 */
import { type TimeSlot } from "@/lib/scheduleUtils";

interface SlotGroupProps {
  title: string;
  slots: TimeSlot[];
  startIdx: number;
  selected: string | null;
  setSelected: (v: string) => void;
  slotRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  onKey: (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => void;
}

export function SlotGroup({
  title, slots, startIdx, selected, setSelected, slotRefs, onKey,
}: SlotGroupProps) {
  if (slots.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.1em] text-panel-muted">
        {title}
      </h3>
      <div role="radiogroup" aria-label={`${title} time slots`}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {slots.map((s, i) => {
          const idx = startIdx + i;
          const isSelected = selected === s.iso;
          return (
            <button
              key={s.iso}
              ref={el => (slotRefs.current[idx] = el)}
              type="button" role="radio" aria-checked={isSelected}
              data-testid={`slot-${s.display.replace(/[: ]/g, "").replace(/\./g, "")}${s.meridiem}`}
              onKeyDown={e => onKey(e, idx)}
              onClick={() => setSelected(s.iso)}
              className={[
                "min-h-[48px] rounded-xl px-3 py-2.5 flex items-center justify-between transition-colors border-2",
                isSelected
                  ? "bg-primary text-white border-primary shadow-cta"
                  : "bg-panel text-panel-foreground border-panel-border hover:border-primary",
              ].join(" ")}
            >
              <span className="font-display text-base font-bold leading-none">
                {s.display}
                <span className="ml-1 text-xs font-bold uppercase tracking-wider">{s.meridiem}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

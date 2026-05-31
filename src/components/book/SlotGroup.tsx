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
      <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-panel-foreground">
        {title}
      </h3>
      <div role="radiogroup" aria-label={`${title} time slots`}
        className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                "min-h-[64px] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors border-2",
                isSelected
                  ? "bg-primary text-white border-primary shadow-cta"
                  : "bg-panel text-panel-foreground border-panel-border hover:border-primary",
              ].join(" ")}
            >
              <span className="font-display text-2xl font-bold leading-none">
                {s.display}
                <span className="ml-1.5 text-base font-bold uppercase tracking-wider">{s.meridiem}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

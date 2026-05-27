/**
 * SlotGroup — renders a labeled group of time slots (Morning / Afternoon / Evening).
 * Extracted from BookSchedule.tsx (OPT 1).
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
      <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-panel-foreground">
        {title}
      </h3>
      <div className="h-px bg-panel-divider mb-2.5" aria-hidden />
      <div role="radiogroup" aria-label={`${title} time slots`}
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {slots.map((s, i) => {
          const idx = startIdx + i;
          const isSelected = selected === s.iso;
          return (
            <button
              key={s.iso}
              ref={el => (slotRefs.current[idx] = el)}
              type="button" role="radio" aria-checked={isSelected}
              onKeyDown={e => onKey(e, idx)}
              onClick={() => setSelected(s.iso)}
              className={[
                "h-[50px] rounded-xl px-2 inline-flex items-center justify-center transition-colors border-[1.5px]",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-cta"
                  : "bg-panel text-panel-foreground border-panel-border hover:border-primary",
              ].join(" ")}
            >
              <span className="font-display text-base font-bold leading-none">
                {s.display}
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider opacity-75">{s.meridiem}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

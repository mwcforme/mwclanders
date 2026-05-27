/**
 * DayPill — individual day selector pill in the booking schedule.
 * Extracted from BookSchedule.tsx (OPT 1).
 */
import { type DayCell, formatLong } from "@/lib/scheduleUtils";

const DOW_UPPER = ["SUN","MON","TUE","WED","THU","FRI","SAT"] as const;

const BASE =
  "relative flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-center select-none transition-colors min-h-[72px] cursor-pointer";

interface DayPillProps {
  day: DayCell;
  selected: boolean;
  onSelect: () => void;
}

export function DayPill({ day, selected, onSelect }: DayPillProps) {
  const disabled = day.full || day.closed;
  const dow = DOW_UPPER[day.date.getDay()];

  if (disabled) {
    return (
      <div
        role="radio" aria-checked={false} aria-disabled
        aria-label={`${formatLong(day.date)} — ${day.full ? "Fully booked" : "Closed"}`}
        className={`${BASE} bg-disabled-light text-disabled-light-foreground`}
      >
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em]">{dow}</p>
        <p className="font-display text-xl font-bold leading-none">{day.date.getDate()}</p>
        <p className="text-[9px] font-bold uppercase">{day.full ? "Full" : "Closed"}</p>
      </div>
    );
  }

  if (selected) {
    return (
      <button type="button" onClick={onSelect} role="radio" aria-checked
        className={`${BASE} bg-primary text-white shadow-cta`}>
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em] opacity-90">{dow}</p>
        <p className="font-display text-xl font-bold leading-none">{day.date.getDate()}</p>
        <span className="h-[5px] w-[5px] rounded-full bg-white" aria-hidden />
      </button>
    );
  }

  return (
    <button type="button" onClick={onSelect} role="radio" aria-checked={false}
      aria-label={`${formatLong(day.date)} — ${day.slotsLeft} slots available`}
      className={`${BASE} bg-panel text-panel-foreground border-[1.5px] border-panel-border hover:border-primary`}>
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-panel-muted">{dow}</p>
      <p className="font-display text-xl font-bold leading-none">{day.date.getDate()}</p>
      <span className="h-[5px] w-[5px] rounded-full bg-primary" aria-hidden />
    </button>
  );
}

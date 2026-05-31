/**
 * DayPill — individual day selector card in the booking schedule.
 * Matches mwclocked.pplx.app/#/ reference design.
 */
import { type DayCell, formatLong } from "@/lib/scheduleUtils";

const DOW_UPPER = ["SUN","MON","TUE","WED","THU","FRI","SAT"] as const;

const BASE =
  "snap-center relative flex-shrink-0 w-[112px] sm:w-auto rounded-2xl p-3 text-center select-none transition-colors";

interface DayPillProps {
  day: DayCell;
  selected: boolean;
  onSelect: () => void;
}

export function DayPill({ day, selected, onSelect }: DayPillProps) {
  const disabled = day.full || day.closed;
  const dow = DOW_UPPER[day.date.getDay()];
  const dateNum = day.date.getDate();

  if (disabled) {
    return (
      <div
        role="radio" aria-checked={false} aria-disabled
        aria-label={`${formatLong(day.date)} — ${day.full ? "Fully booked" : "Closed"}`}
        data-testid={`day-${dateNum}`}
        className={`${BASE} bg-disabled-light text-disabled-light-foreground`}
      >
        <p className="font-display text-base font-bold uppercase tracking-wider">{dow}</p>
        <p className="font-display text-3xl font-bold leading-none mt-1.5">{dateNum}</p>
        <p className="mt-2 text-sm font-semibold">{day.full ? "Full" : "Closed"}</p>
      </div>
    );
  }

  if (selected) {
    return (
      <button type="button" onClick={onSelect} role="radio" aria-checked
        data-testid={`day-${dateNum}`}
        className={`${BASE} bg-primary text-white shadow-cta`}>
        <p className="font-display text-base font-bold uppercase tracking-wider">{dow}</p>
        <p className="font-display text-3xl font-bold leading-none mt-1.5">{dateNum}</p>
        <p className="mt-2 text-sm font-bold">{day.slotsLeft} slots</p>
      </button>
    );
  }

  return (
    <button type="button" onClick={onSelect} role="radio" aria-checked={false}
      data-testid={`day-${dateNum}`}
      aria-label={`${formatLong(day.date)} — ${day.slotsLeft} slots available`}
      className={`${BASE} bg-background text-foreground border-2 border-border-subtle hover:border-primary`}>
      <p className="font-display text-base font-bold uppercase tracking-wider text-text-muted">{dow}</p>
      <p className="font-display text-3xl font-bold leading-none mt-1.5">{dateNum}</p>
      <p className="mt-2 text-sm font-semibold text-text-muted">{day.slotsLeft} slots</p>
    </button>
  );
}

/**
 * ReviewSheet — bottom sheet confirmation dialog for the selected slot.
 * Extracted from BookSchedule.tsx (OPT 1).
 *
 * BUG 1 fix: Renders booking error and redirect countdown when confirmCtl fails.
 * BUG 7/OPT 4 fix: Uses MONTHS_UPPER directly instead of MONTHS_SHORT + .toUpperCase().
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Calendar, Clock, Lock, X } from "lucide-react";
import { TIMEZONE } from "@/lib/ghlCalendars";
import {
  type DayCell,
  DOW_SHORT, MONTHS_UPPER, MONTHS_SHORT,
  HOLD_SECONDS,
  fmtTimeParts, formatLongFull,
} from "@/lib/scheduleUtils";

export interface RedirectState {
  url: string;
  totalMs: number;
  remainingMs: number;
}

export interface ReviewSheetProps {
  firstName: string;
  slotIso: string;
  day: DayCell;
  onCommit: () => void;
  onChangeTime: () => void;
  /** Combined isSubmitting state: hookSubmitting || localConfirming (BUG 2 fix applied in parent). */
  confirming: boolean;
  /** Booking error message to display (BUG 1 fix). */
  error?: string | null;
  /** Active redirect countdown state (BUG 1 fix). */
  redirect?: RedirectState | null;
}

export function ReviewSheet({
  firstName, slotIso, day, onCommit, onChangeTime,
  confirming, error, redirect,
}: ReviewSheetProps) {
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);

  useEffect(() => {
    const id = window.setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const { display: slotDisplay, meridiem } = fmtTimeParts(slotIso);
  const slotLabel = `${slotDisplay} ${meridiem}`;

  const endTimeLabel = useMemo(() => {
    const d = new Date(slotIso);
    const end = new Date(d.getTime() + 60 * 60 * 1000);
    return end.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
    }).replace(/\u202f/g, " ");
  }, [slotIso]);

  const dayLong = formatLongFull(day.date);
  const minutes = Math.floor(secondsLeft / 60);
  const secs    = secondsLeft % 60;
  const timer   = `${minutes}:${secs.toString().padStart(2, "0")}`;
  const redirectSecs = redirect ? Math.ceil(redirect.remainingMs / 1000) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog" aria-modal aria-labelledby="review-title">
      <button type="button" aria-label="Close" onClick={onChangeTime}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-panel text-panel-foreground rounded-t-3xl sm:rounded-3xl sm:mb-8 shadow-card"
        style={{ animation: "slideUp 280ms cubic-bezier(0.22,1,0.36,1)" }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="h-1 w-10 rounded-full bg-panel-divider" aria-hidden />
        </div>

        {/* Desktop close button */}
        <button type="button" onClick={onChangeTime}
          className="hidden sm:inline-flex absolute top-4 right-4 h-9 w-9 items-center justify-center rounded-full text-panel-muted hover:bg-panel-divider"
          aria-label="Close">
          <X className="h-5 w-5" aria-hidden />
        </button>

        {/* Slot heading */}
        <div className="px-6 pt-2 pb-4 text-center">
          <p id="review-title" className="font-display text-2xl font-bold uppercase tracking-[0.05em] text-panel-foreground">
            {/* OPT 4/BUG 7 fix: use MONTHS_UPPER directly, no .toUpperCase() call */}
            {DOW_SHORT[day.date.getDay()]}, {MONTHS_UPPER[day.date.getMonth()]} {day.date.getDate()}{" "}
            <span className="text-primary">·</span> {slotLabel}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-primary">
            <Clock className="h-3.5 w-3.5" aria-hidden /> Holding your slot · {timer}
          </p>
        </div>

        <div className="h-px bg-panel-divider" aria-hidden />

        {/* Appointment detail row */}
        <div className="px-6 py-5 flex items-start gap-4">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary" aria-hidden>
            <Calendar className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-base font-bold uppercase tracking-wide text-panel-foreground">Consultation</p>
            <p className="mt-1 text-sm leading-snug text-panel-foreground">
              {dayLong}<br />
              {slotLabel} <span className="text-panel-muted">to</span> {endTimeLabel}{" "}
              <span className="text-panel-muted">(60-minute visit)</span>
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-panel-muted">
              Physician-led · In-person · Labs drawn on-site
            </p>
            <p className="mt-2 text-xs text-panel-muted leading-snug">
              Your provider's time is being held. Please arrive 5 minutes early.
            </p>
          </div>
        </div>

        {/* CTA area */}
        <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-5 border-t border-panel-divider">
          {/* BUG 1 fix: Show booking error when the slot was just taken */}
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 text-center">
              {error}
            </p>
          )}
          {/* BUG 1 fix: Show redirect countdown when error triggers navigation */}
          {redirect && redirectSecs !== null && (
            <p className="mb-3 text-sm font-semibold text-panel-muted text-center">
              Redirecting you now… ({redirectSecs}s)
            </p>
          )}

          <button type="button" onClick={onCommit} disabled={confirming}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-display font-bold uppercase tracking-wider text-lg bg-primary text-white hover:bg-primary-hover shadow-cta disabled:opacity-60 disabled:cursor-wait">
            <Lock className="h-5 w-5" aria-hidden strokeWidth={2.5} />
            {confirming ? "Booking…" : firstName ? `Lock it in, ${firstName}` : "Lock it in"}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" onClick={onChangeTime}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-panel-muted hover:text-panel-foreground">
            Change time
          </button>
        </div>
      </div>
    </div>
  );
}

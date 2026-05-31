/**
 * ReviewSheet — bottom sheet confirmation dialog for the selected slot.
 * Extracted from BookSchedule.tsx (OPT 1).
 *
 * BUG 1 fix: Renders booking error and redirect countdown when confirmCtl fails.
 * BUG 7/OPT 4 fix: Uses MONTHS_UPPER directly instead of MONTHS_SHORT + .toUpperCase().
 */
import { useEffect, useMemo, useState, useRef } from "react";
import { ArrowRight, Calendar, Clock, Lock, X, Mail } from "lucide-react";
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
  onCommit: (email?: string) => void;
  onChangeTime: () => void;
  /** Combined isSubmitting state: hookSubmitting || localConfirming (BUG 2 fix applied in parent). */
  confirming: boolean;
  /** Booking error message to display (BUG 1 fix). */
  error?: string | null;
  /** Active redirect countdown state (BUG 1 fix). */
  redirect?: RedirectState | null;
  /** Location label e.g. "Richmond" or "Newport News" */
  locationLabel?: string | null;
  /** Full street address */
  locationAddress?: string | null;
}

export function ReviewSheet({
  firstName, slotIso, day, onCommit, onChangeTime,
  confirming, error, redirect, locationLabel, locationAddress,
}: ReviewSheetProps) {
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  const [email, setEmail] = useState("");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog" aria-modal aria-labelledby="review-title">
      <button type="button" aria-label="Close" onClick={onChangeTime}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md mx-4 bg-panel text-panel-foreground rounded-3xl shadow-card"
        style={{ animation: "slideUp 280ms cubic-bezier(0.22,1,0.36,1)" }}>
        <style>{`
          @keyframes slideUp { from { transform: translateY(12px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        `}</style>

        {/* Close button */}
        <button type="button" onClick={onChangeTime}
          className="absolute top-3 right-3 h-8 w-8 inline-flex items-center justify-center rounded-full text-panel-muted hover:bg-panel-divider"
          aria-label="Close">
          <X className="h-4 w-4" aria-hidden />
        </button>

        {/* Header — date/time + timer */}
        <div className="px-5 pt-5 pb-4">
          <p id="review-title" className="font-display text-xl font-bold uppercase tracking-[0.04em] text-panel-foreground leading-tight">
            {DOW_SHORT[day.date.getDay()]}, {MONTHS_UPPER[day.date.getMonth()]} {day.date.getDate()}
            <span className="text-primary"> · </span>{slotLabel}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-primary">
            <Clock className="h-3 w-3" aria-hidden /> Holding your slot · {timer}
          </p>
        </div>

        <div className="h-px bg-panel-divider" aria-hidden />

        {/* Appointment details */}
        <div className="px-5 py-4 space-y-3">

          {/* Date + duration row */}
          <div>
            <p className="text-sm font-bold text-panel-foreground">{dayLong}</p>
            <p className="mt-0.5 text-sm text-panel-muted flex items-center gap-2">
              {slotLabel} – {endTimeLabel}
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">60 min</span>
            </p>
          </div>

          {/* Location row */}
          {(locationLabel || locationAddress) && (
            <div className="flex items-start gap-2.5">
              <svg className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              <div>
                {locationLabel && <p className="text-sm font-bold text-panel-foreground">{locationLabel} Center</p>}
                {locationAddress && <p className="text-xs text-panel-muted mt-0.5 leading-snug">{locationAddress}</p>}
              </div>
            </div>
          )}

          {/* Arrival note */}
          <p className="text-xs text-panel-muted leading-snug border-t border-panel-divider pt-3">
            Arrive 5 minutes early. Your provider will be ready.
          </p>
        </div>

        {/* CTA area */}
        <div className="px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-panel-divider">
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

          {/* MWC-005: Optional email capture before committing */}
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="rs-email" style={{
              display: "block", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--panel-muted, rgba(255,255,255,0.55))",
              marginBottom: 6, fontFamily: "Inter, sans-serif",
            }}>
              Email <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} strokeWidth={2} style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)",
                color: "var(--brand-cta)", pointerEvents: "none",
              }} />
              <input
                id="rs-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                aria-label="Email address for confirmation and reminders"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 14px 12px 38px",
                  borderRadius: 12,
                  border: "2px solid var(--brand-cta, #E8670A)",
                  background: "var(--panel-bg, rgba(255,255,255,0.06))",
                  color: "var(--panel-foreground, #fff)",
                  fontSize: 15, fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxShadow: "0 0 0 0px var(--brand-cta)",
                  transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                }}
                onFocus={e => {
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,103,10,0.25)";
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = "0 0 0 0px var(--brand-cta)";
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--panel-muted, rgba(255,255,255,0.50))", marginTop: 5, fontFamily: "Inter, sans-serif" }}>
              We'll send your confirmation + reminders here.
            </p>
          </div>

          <button type="button" onClick={() => onCommit(email.trim() || undefined)} disabled={confirming}
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

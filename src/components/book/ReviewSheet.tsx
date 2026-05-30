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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog" aria-modal aria-labelledby="review-title">
      <button type="button" aria-label="Close" onClick={onChangeTime}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-panel text-panel-foreground rounded-t-3xl sm:rounded-3xl sm:mb-0 shadow-card"
        style={{ animation: "slideUp 280ms cubic-bezier(0.22,1,0.36,1)" }}>
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @media (min-width: 640px) {
            @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          }
        `}</style>

        {/* Drag handle — hidden on desktop */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
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

        {/* Appointment card */}
        <div className="mx-4 sm:mx-6 my-4 rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--panel-divider)" }}>

          {/* Card header — type badge */}
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "var(--panel-divider)" }}>
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-panel-foreground">In-Person Consultation</span>
          </div>

          {/* Card body */}
          <div className="px-4 py-4">

            {/* Date + time */}
            <p className="text-base font-bold text-panel-foreground">{dayLong}</p>
            <p className="mt-0.5 text-sm text-panel-muted">
              {slotLabel} – {endTimeLabel}
              <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">60 min</span>
            </p>

            {/* Divider */}
            <div className="my-3 h-px bg-panel-divider" />

            {/* Location */}
            {(locationLabel || locationAddress) && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: "var(--panel-divider)" }}>
                <svg className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <div>
                  {locationLabel && <p className="text-xs font-bold text-panel-foreground">{locationLabel} Center</p>}
                  {locationAddress && <p className="text-xs text-panel-muted mt-0.5">{locationAddress}</p>}
                </div>
              </div>
            )}

            {/* Arrival note */}
            <p className="mt-3 text-xs text-panel-muted leading-snug">
              Please arrive 5 minutes early. Your provider will be ready for you.
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
              <Mail size={14} strokeWidth={2} style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                color: "var(--brand-cta)", pointerEvents: "none",
              }} />
              <input
                id="rs-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 12px 10px 34px",
                  borderRadius: 10,
                  border: "1.5px solid var(--panel-divider, rgba(255,255,255,0.12))",
                  background: "var(--panel-bg, rgba(255,255,255,0.05))",
                  color: "var(--panel-foreground, #fff)",
                  fontSize: 14, fontFamily: "Inter, sans-serif",
                  outline: "none",
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--panel-muted, rgba(255,255,255,0.40))", marginTop: 4, fontFamily: "Inter, sans-serif" }}>
              Where should we send your confirmation and reminders?
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

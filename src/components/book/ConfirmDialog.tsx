/**
 * ConfirmDialog — booking confirmation modal.
 * Extracted from GHLDayView as part of P2-1 component split.
 */
import { Loader2, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TIMEZONE } from "@/lib/ghlCalendars";
import type { RedirectState } from "@/domain/booking/useConfirmAppointment";

// Brand tokens
const INK    = "#0B1029";
const MUTED  = "#4B5563";
const LINE   = "#E5E7EB";
const SURFACE = "#FFFFFF";
const CANVAS  = "#F7F8FB";
const ORANGE  = "#E8670A";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtTimeParts = (iso: string): { time: string; ampm: string } => {
  const s = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const [time, ampm] = s.split(" ");
  return { time, ampm };
};

const fmtFullDay = (d: Date): string =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TIMEZONE });

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: string | null;
  /** Human-readable clinic label (e.g. "Richmond Center"). */
  calLabel: string;
  /** Patient full name for the booking summary row. */
  fullName: string;
  submitting: boolean;
  submitError: string | null;
  redirect: RedirectState | null;
  onConfirm: () => void;
  /** Called when the user clicks "Change time" or dismisses the dialog. */
  onCancel: () => void;
  onCancelRedirect: () => void;
}

const DIALOG_TITLE_ID = "book-confirm-title";

// ─── Component ────────────────────────────────────────────────────────────────

const ConfirmDialog = ({
  open,
  onOpenChange,
  selectedSlot,
  calLabel,
  fullName,
  submitting,
  submitError,
  redirect,
  onConfirm,
  onCancel,
  onCancelRedirect,
}: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={(o) => { if (!submitting) onOpenChange(o); }}>
    <DialogContent
      className="sm:max-w-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby={DIALOG_TITLE_ID}
      style={{ background: SURFACE, color: INK, border: `1px solid ${LINE}`, fontFamily: "Inter, sans-serif" }}
    >
      <DialogHeader>
        <DialogTitle
          id={DIALOG_TITLE_ID}
          style={{ color: INK, fontFamily: "Oswald, Inter, sans-serif", letterSpacing: "0.02em" }}
        >
          Confirm your appointment
        </DialogTitle>
      </DialogHeader>

      {/* Booking summary card */}
      <div style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, marginTop: 4 }}>
        <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
          You're booking
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          New Patient Consultation (60 min)
        </div>
        {selectedSlot && (
          <div style={{ fontSize: 15, color: INK, marginBottom: 4 }}>
            {fmtFullDay(new Date(selectedSlot))} · {fmtTimeParts(selectedSlot).time} {fmtTimeParts(selectedSlot).ampm}
          </div>
        )}
        <div style={{ fontSize: 14, color: MUTED }}>{calLabel}, In-person</div>
        {fullName && (
          <div style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>
            For: <strong style={{ color: INK }}>{fullName}</strong>
          </div>
        )}
      </div>

      {/* Error / redirect countdown */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: 12, padding: "12px 14px",
            background: "#FEF2F2", border: "1px solid #EF4444",
            borderRadius: 8, color: "#B91C1C", fontSize: 13, lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 600 }}>{submitError}</div>
          {redirect && (
            <>
              <div style={{ marginTop: 8, fontSize: 12, color: "#7F1D1D", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span>
                  Connecting you with a coordinator in{" "}
                  <strong>{Math.max(1, Math.ceil(redirect.remainingMs / 1000))}s</strong>
                </span>
                <button
                  type="button"
                  onClick={onCancelRedirect}
                  style={{
                    background: "transparent", border: "1px solid #B91C1C",
                    color: "#7F1D1D", borderRadius: 6, padding: "4px 10px",
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={redirect.totalMs}
                aria-valuenow={redirect.totalMs - redirect.remainingMs}
                style={{ marginTop: 8, height: 4, background: "#FECACA", borderRadius: 999, overflow: "hidden" }}
              >
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, ((redirect.totalMs - redirect.remainingMs) / redirect.totalMs) * 100)}%`,
                  background: "#B91C1C",
                  transition: "width 100ms linear",
                }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting || !!redirect}
          style={{
            width: "100%", minHeight: 52,
            background: ORANGE, color: "#FFFFFF",
            border: 0, borderRadius: 12, fontSize: 15, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: (submitting || redirect) ? "wait" : "pointer",
            opacity: (submitting || redirect) ? 0.85 : 1,
            fontFamily: "Oswald, Inter, sans-serif",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 10px 24px -10px rgba(232,103,10,0.55)",
          }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Booking..." : "Confirm booking"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            width: "100%", minHeight: 44, background: "transparent",
            color: MUTED, border: 0, fontSize: 14, fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}
        >
          <ChevronLeft size={14} /> Change time
        </button>
      </div>
    </DialogContent>
  </Dialog>
);

export default ConfirmDialog;

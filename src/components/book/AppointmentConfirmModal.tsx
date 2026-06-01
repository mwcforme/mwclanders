import { Loader2, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type CENTER_CALENDARS } from "@/lib/ghlCalendars";
import { type useConfirmAppointment } from "@/domain/booking/useConfirmAppointment";
import { INK, MUTED, LINE, SURFACE, ORANGE, fmtTimeParts, fmtFullDay } from "./ghlAccordionHelpers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: string | null;
  fullName: string;
  cal: (typeof CENTER_CALENDARS)[keyof typeof CENTER_CALENDARS];
  confirmCtl: ReturnType<typeof useConfirmAppointment>;
  onConfirm: () => void;
}

export function AppointmentConfirmModal({ open, onOpenChange, selectedSlot, fullName, cal, confirmCtl, onConfirm }: Props) {
  const submitting = confirmCtl.isSubmitting;
  const submitError = confirmCtl.error;

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md" style={{ background: SURFACE, color: INK, border: `1px solid ${LINE}`, fontFamily: "Inter, sans-serif" }}>
        <DialogHeader>
          <DialogTitle style={{ color: INK, fontFamily: "Oswald, Inter, sans-serif", letterSpacing: "0.02em" }}>
            Confirm your appointment
          </DialogTitle>
        </DialogHeader>
        {/* hardcoded-color-allow-next-line */}
        <div style={{ background: "#F7F8FB", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, marginTop: 4 }}>
          <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
            You're booking
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            New Patient Appointment (60 min)
          </div>
          {selectedSlot && (
            <div style={{ fontSize: 16, color: INK, marginBottom: 4 }}>
              {fmtFullDay(new Date(selectedSlot))} · {fmtTimeParts(selectedSlot).time} {fmtTimeParts(selectedSlot).ampm}
            </div>
          )}
          <div style={{ fontSize: 14, color: MUTED }}>{cal.label}, In-person</div>
          {fullName && (
            <div style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>
              For: <strong style={{ color: INK }}>{fullName}</strong>
            </div>
          )}
        </div>

        {submitError && (
          <div role="alert" style={{
            marginTop: 12, padding: "12px 14px",
            // hardcoded-color-allow-next-line
            background: "#FEF2F2",
            // hardcoded-color-allow-next-line
            border: "1px solid #EF4444",
            // hardcoded-color-allow-next-line
            borderRadius: 8, color: "var(--c-error-on-light)", fontSize: 16, fontFamily: "Inter, sans-serif",
          }}>
            {submitError}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || !!confirmCtl.redirect}
            style={{
              width: "100%", minHeight: 52, background: ORANGE, color: "var(--c-text-on-dark)",
              border: 0, borderRadius: 12, fontSize: 16, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.6 : 1,
              fontFamily: "Oswald, Inter, sans-serif",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              // hardcoded-color-allow-next-line
              boxShadow: "0 10px 24px -10px rgba(232,103,10,0.55)",
            }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Booking..." : "Confirm booking"}
          </button>
          <button
            type="button"
            onClick={() => { if (!submitting) { confirmCtl.cancelRedirect(); onOpenChange(false); } }}
            style={{
              width: "100%", minHeight: 44, background: "transparent", color: MUTED,
              border: 0, fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}
          >
            <ChevronLeft size={14} /> Change time
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



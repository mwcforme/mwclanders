import { useEffect, useMemo, useRef, useState, memo, useCallback } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CENTER_CALENDARS, TIMEZONE, type LocationKey } from "@/lib/ghlCalendars";
import { addDaysInTimeZone, dateFromYmdInTimeZone, isSundayInTimeZone, ymdInTimeZone } from "@/lib/etDate";
const getSupabase = () => import("@/integrations/supabase/client").then(m => m.supabase);
import { useConfirmAppointment } from "@/domain/booking/useConfirmAppointment";

// banned-wording-allow-next-line — GHL API table/endpoint name
const fetchCachedSlots = async (
  calendarId: string,
  start: Date,
  end: Date,
): Promise<Record<string, string[]>> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("ghl_free_slots")
    .select("slot_start")
    .eq("calendar_id", calendarId)
    .gte("slot_start", start.toISOString())
    .lt("slot_start", end.toISOString())
    .order("slot_start", { ascending: true })
    .limit(1000);
  if (error) throw new Error(error.message);
  const out: Record<string, string[]> = {};
  for (const row of data || []) {
    const iso = row.slot_start as string;
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date(iso));
    (out[key] ||= []).push(iso);
  }
  return out;
};

interface Props {
  location: LocationKey;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** @deprecated PHI: do not pass — clinical context flows via `customFields`. */
  notes?: string;
  source?: string;
  customFields?: import("@/services/contracts/ILeadSubmitter").MwcCustomFields;
  onBooked?: (slotIso: string) => void;
}

const INK = "#0B1029";
const MUTED = "#4B5563";
const LINE = "#E5E7EB";
const BORDER = "#8B92A0";
const SURFACE = "#FFFFFF";
const ORANGE = "#E8670A";

const ymd = (d: Date) => ymdInTimeZone(d, TIMEZONE);

const fmtDayShort = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", timeZone: TIMEZONE }).toUpperCase();
const fmtMonthDay = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();
const fmtTimeParts = (iso: string) => {
  const s = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const [time, ampm] = s.split(" ");
  return { time, ampm };
};
const fmtFullDay = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TIMEZONE });

const todayET = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

const isTodayET = (day: Date): boolean => todayET() === ymd(day);
const isTomorrowET = (day: Date): boolean => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const tom = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(t);
  return tom === ymd(day);
};

const dateFromEtYmd = (s: string): Date => dateFromYmdInTimeZone(s, TIMEZONE);

const dropPastSlots = (day: Date, slots: string[]): string[] => {
  if (!isTodayET(day)) return slots;
  const cutoffMs = Date.now();
  return slots.filter((iso) => new Date(iso).getTime() > cutoffMs);
};

/* ───── memoized slot button ───── */
interface SlotButtonProps {
  iso: string;
  selected: boolean;
  onSelect: (iso: string) => void;
}

const SlotButton = memo(function SlotButton({ iso, selected, onSelect }: SlotButtonProps) {
  const { time, ampm } = fmtTimeParts(iso);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(iso)}
      style={{
        background: selected ? ORANGE : SURFACE,
        border: selected ? "1px solid transparent" : `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "16px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: selected ? "#FFFFFF" : INK,
        cursor: "pointer",
        textAlign: "center",
        transition: "background-color 120ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.01em" }}>
          {time}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: selected ? INK : MUTED }}>
          {ampm}
        </span>
      </div>
    </button>
  );
});

/* ───── memoized day row ───── */
interface AccordionDayProps {
  day: Date;
  slots: string[];
  expanded: boolean;
  selectedSlot: string | null;
  onToggle: (key: string, isExpanded: boolean) => void;
  onSelectSlot: (iso: string) => void;
}

const AccordionDay = memo(function AccordionDay({
  day,
  slots,
  expanded,
  selectedSlot,
  onToggle,
  onSelectSlot,
}: AccordionDayProps) {
  const key = ymd(day);
  const isSunday = isSundayInTimeZone(day, TIMEZONE);
  const count = slots.length;
  const available = count > 0 && !isSunday;
  const isExpanded = expanded && available;
  const isToday = isTodayET(day);
  const isTomorrow = isTomorrowET(day);
  const ribbon = isToday ? "TODAY" : isTomorrow ? "TMRW" : null;

  const headerBg = isExpanded ? ORANGE : INK;
  const headerColor = isExpanded ? INK : "#FFFFFF";
  const disabled = !available;
  const badgeText = isSunday ? "Closed" : !available ? "Full" : `${count} slots`;

  const handleToggle = () => {
    if (disabled) return;
    onToggle(key, isExpanded);
  };

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: isExpanded ? "none" : `1px solid ${LINE}` }}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={isExpanded}
        aria-label={`${fmtFullDay(day)} — ${badgeText}`}
        onClick={handleToggle}
        style={{
          width: "100%",
          background: disabled ? "#F1F2F6" : headerBg,
          color: disabled ? MUTED : headerColor,
          border: 0,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          opacity: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ribbon && (
            <span
              style={{
                display: "inline-block",
                alignSelf: "flex-start",
                background: isExpanded ? INK : ORANGE,
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.06em",
                padding: "2px 6px",
                borderRadius: 4,
                marginBottom: 2,
              }}
            >
              {ribbon}
            </span>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
            {fmtDayShort(day)}
          </span>
          <span style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.02em" }}>
            {fmtMonthDay(day)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
            {badgeText}
          </span>
          {!disabled && (
            <span style={{ display: "inline-flex", transition: "transform 280ms ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              <ChevronDown size={18} />
            </span>
          )}
        </div>
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: isExpanded ? "1fr" : "0fr",
          transition: "grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              background: SURFACE,
              borderLeft: `1px solid ${ORANGE}`,
              borderRight: `1px solid ${ORANGE}`,
              borderBottom: `1px solid ${ORANGE}`,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              padding: 14,
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              {slots.map((iso) => (
                <SlotButton key={iso} iso={iso} selected={iso === selectedSlot} onSelect={onSelectSlot} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const GHLAccordionView = ({ location, firstName, lastName, email, phone, source, customFields, onBooked }: Props) => {
  const today = useMemo(() => dateFromEtYmd(todayET()), []);
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDaysInTimeZone(today, i, TIMEZONE));
  }, [today]);

  const [slotsByDay, setSlotsByDay] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const confirmCtl = useConfirmAppointment({ onBooked: (slot) => onBooked?.(slot) });
  const submitting = confirmCtl.isSubmitting;
  const submitError = confirmCtl.error;
  const initialised = useRef(false);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedSlot) return;
    const btn = confirmBtnRef.current;
    if (!btn) return;
    btn.focus({ preventScroll: true });
    const r = btn.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const fullyVisible = r.top >= 0 && r.bottom <= vh;
    if (!fullyVisible) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [selectedSlot]);

  const cal = CENTER_CALENDARS[location];

  /* stable callbacks so memoized children don't re-render unnecessarily */
  const handleToggleDay = useCallback((key: string, isExpanded: boolean) => {
    setExpandedDay(isExpanded ? null : key);
    setSelectedSlot(null);
  }, []);

  const handleSelectSlot = useCallback((iso: string) => {
    setSelectedSlot(iso);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = new Date(today);
    const end = addDaysInTimeZone(today, 7, TIMEZONE);
    setLoading(true); setLoadError(null);
    fetchCachedSlots(cal.calendarId, start, end)
      .then((parsed) => {
        if (cancelled) return;
        const out: Record<string, string[]> = {};
        days.forEach((d) => {
          const key = ymd(d);
          const slots = dropPastSlots(d, parsed[key] || []);
          if (slots.length > 0) out[key] = slots;
        });
        setSlotsByDay(out);
        if (!initialised.current) {
          const firstWith = days.find((d) => !isSundayInTimeZone(d, TIMEZONE) && out[ymd(d)]?.length);
          if (firstWith) setExpandedDay(ymd(firstWith));
          initialised.current = true;
        }
      })
      .catch((e: Error) => { if (!cancelled) setLoadError(e.message || "Could not load times."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const canConfirm = Boolean(selectedSlot);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const handleFinalConfirm = async () => {
    if (!selectedSlot) return;
    const ok = await confirmCtl.confirm({
      slotIso: selectedSlot,
      location, firstName, lastName, email, phone, source, customFields,
    });
    if (ok) setModalOpen(false);
  };

  return (
    <>
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${LINE}`,
          borderRadius: 16,
          overflow: "hidden",
          color: INK,
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 1px 2px rgba(11,16,41,0.04), 0 24px 48px -24px rgba(11,16,41,0.18)",
        }}
      >
        <div style={{ padding: 16, position: "relative" }}>
          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", zIndex: 1 }}>
              <Loader2 size={22} className="animate-spin" color={INK} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {days.map((d) => (
              <AccordionDay
                key={ymd(d)}
                day={d}
                slots={slotsByDay[ymd(d)] || []}
                expanded={expandedDay === ymd(d)}
                selectedSlot={selectedSlot}
                onToggle={handleToggleDay}
                onSelectSlot={handleSelectSlot}
              />
            ))}
          </div>

          {loadError && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#B91C1C" }}>{loadError}</div>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${LINE}`, background: SURFACE, padding: 16 }}>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => canConfirm && setModalOpen(true)}
            disabled={!canConfirm}
            style={{
              width: "100%", minHeight: 56,
              background: canConfirm ? ORANGE : "#E5E7EB",
              color: canConfirm ? "#FFFFFF" : "#5B6271",
              border: 0, borderRadius: 12, fontSize: 15, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: canConfirm ? "pointer" : "not-allowed",
              fontFamily: "Oswald, Inter, sans-serif",
              boxShadow: canConfirm ? "0 10px 24px -10px rgba(232,103,10,0.55)" : "none",
            }}
          >
            {canConfirm && selectedSlot
              ? (() => {
                  const dayLabel = new Date(selectedSlot).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();
                  const { time, ampm } = fmtTimeParts(selectedSlot);
                  return `Confirm ${dayLabel} · ${time} ${ampm} →`;
                })()
              : "Tap a time above to continue"}
          </button>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(o) => !submitting && setModalOpen(o)}>
        <DialogContent className="sm:max-w-md" style={{ background: SURFACE, color: INK, border: `1px solid ${LINE}`, fontFamily: "Inter, sans-serif" }}>
          <DialogHeader>
            <DialogTitle style={{ color: INK, fontFamily: "Oswald, Inter, sans-serif", letterSpacing: "0.02em" }}>
              Confirm your appointment
            </DialogTitle>
          </DialogHeader>
          <div style={{ background: "#F7F8FB", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, marginTop: 4 }}>
            <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
              You're booking
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              New Patient Consultation (60 min)
            </div>
            {selectedSlot && (
              <div style={{ fontSize: 15, color: INK, marginBottom: 4 }}>
                {fmtFullDay(new Date(selectedSlot))} · {fmtTimeParts(selectedSlot).time} {fmtTimeParts(selectedSlot).ampm} ET
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
            <div role="alert" style={{ marginTop: 12, padding: "12px 14px", background: "#FEF2F2", border: "1px solid #EF4444", borderRadius: 8, color: "#B91C1C", fontSize: 13 }}>
              {submitError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={handleFinalConfirm}
              disabled={submitting || !!confirmCtl.redirect}
              style={{
                width: "100%", minHeight: 52,
                background: ORANGE, color: "#FFFFFF",
                border: 0, borderRadius: 12, fontSize: 15, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.6 : 1,
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
              onClick={() => { if (!submitting) { confirmCtl.cancelRedirect(); setModalOpen(false); } }}
              style={{ width: "100%", minHeight: 44, background: "transparent", color: MUTED, border: 0, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              ← Change time
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GHLAccordionView;

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { CENTER_CALENDARS, TIMEZONE, type LocationKey } from "@/lib/ghlCalendars";
import { addDaysInTimeZone, dateFromYmdInTimeZone, isSundayInTimeZone } from "@/lib/etDate";
import { useConfirmAppointment } from "@/domain/booking/useConfirmAppointment";
import { AccordionDay } from "./GHLAccordionParts";
import { AppointmentConfirmModal } from "./AppointmentConfirmModal";
import { INK, LINE, SURFACE, ORANGE, ymd, todayET, dropPastSlots, fmtTimeParts } from "./ghlAccordionHelpers";

const getSupabase = () => import("@/integrations/supabase/legacy").then(m => m.supabase);

async function fetchCachedSlots(calendarId: string, start: Date, end: Date): Promise<Record<string, string[]>> {
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
}

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

const dateFromEtYmd = (s: string): Date => dateFromYmdInTimeZone(s, TIMEZONE);

const GHLAccordionView = ({ location, firstName, lastName, email, phone, source, customFields, onBooked }: Props) => {
  const today = useMemo(() => dateFromEtYmd(todayET()), []);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDaysInTimeZone(today, i, TIMEZONE)), [today]);

  const [slotsByDay, setSlotsByDay] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const confirmCtl = useConfirmAppointment({ onBooked: (slot) => onBooked?.(slot) });
  const initialised = useRef(false);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedSlot || !confirmBtnRef.current) return;
    const btn = confirmBtnRef.current;
    btn.focus({ preventScroll: true });
    const r = btn.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < 0 || r.bottom > vh) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [selectedSlot]);

  const cal = CENTER_CALENDARS[location];

  const handleToggleDay = useCallback((key: string, isExpanded: boolean) => {
    setExpandedDay(isExpanded ? null : key);
    setSelectedSlot(null);
  }, []);

  const handleSelectSlot = useCallback((iso: string) => setSelectedSlot(iso), []);

  useEffect(() => {
    let cancelled = false;
    const start = new Date(today);
    const end = addDaysInTimeZone(today, 7, TIMEZONE);
    setLoading(true);
    setLoadError(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-fetch when location changes
  }, [location]);

  const canConfirm = Boolean(selectedSlot);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const handleFinalConfirm = async () => {
    if (!selectedSlot) return;
    const ok = await confirmCtl.confirm({ slotIso: selectedSlot, location, firstName, lastName, email, phone, source, customFields });
    if (ok) setModalOpen(false);
  };

  return (
    <>
      <div style={{
        background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden",
        color: INK, fontFamily: "Inter, system-ui, sans-serif",
        // hardcoded-color-allow-next-line
        boxShadow: "0 1px 2px rgba(11,16,41,0.04), 0 24px 48px -24px rgba(11,16,41,0.18)",
      }}>
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
          {loadError && <div role="alert" style={{ marginTop: 10, fontSize: 16, color: "var(--c-error-on-light)", fontFamily: "Inter, sans-serif" }}>{loadError}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${LINE}`, background: SURFACE, padding: 16 }}>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => canConfirm && setModalOpen(true)}
            disabled={!canConfirm}
            style={{
              width: "100%", minHeight: 56,
              // hardcoded-color-allow-next-line
              background: canConfirm ? ORANGE : "#E5E7EB",
              // hardcoded-color-allow-next-line
              color: canConfirm ? "var(--c-text-on-dark)" : "#5B6271",
              border: 0, borderRadius: 12, fontSize: 16, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: canConfirm ? "pointer" : "not-allowed",
              fontFamily: "Oswald, Inter, sans-serif",
              // hardcoded-color-allow-next-line
              boxShadow: canConfirm ? "0 10px 24px -10px rgba(232,103,10,0.55)" : "none",
            }}
          >
            {canConfirm && selectedSlot
              ? (() => {
                  const dayLabel = new Date(selectedSlot).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();
                  const { time, ampm } = fmtTimeParts(selectedSlot);
                  return `Confirm ${dayLabel} · ${time} ${ampm}`;
                })()
              : "Tap a time above to continue"}
          </button>
        </div>
      </div>

      <AppointmentConfirmModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        selectedSlot={selectedSlot}
        fullName={fullName}
        cal={cal}
        confirmCtl={confirmCtl}
        onConfirm={handleFinalConfirm}
      />
    </>
  );
};

export default GHLAccordionView;

/**
 * /book/location — Step 2 of the new booking funnel.
 *
 * Three large tap-target rows (Richmond / Virginia Beach / Newport News).
 * Tapping a row sets location in the store and auto-advances to /book/schedule.
 * Updates GHL contact with selected location tag.
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { contactUpdater } from "@/services/contactUpdater";
import type { LocationKey } from "@/lib/ghlCalendars";
import { trackFunnelEvent } from "@/hooks/useAnalytics";

interface LocationOption {
  key: LocationKey;
  label: string;
  address: string;
  driveTime: string;
}

const OPTIONS: LocationOption[] = [
  {
    key: "richmond",
    label: "Richmond",
    address: "Glen Allen, VA",
    driveTime: "5 min from I-64",
  },
  {
    key: "virginia-beach",
    label: "Virginia Beach",
    address: "Virginia Beach, VA",
    driveTime: "5 min from I-264",
  },
  {
    key: "newport-news",
    label: "Newport News",
    address: "Newport News, VA",
    driveTime: "3 min from I-64, Exit 258A",
  },
];

const BookLocation = () => {
  const navigate = useNavigate();
  const setLocation = useBookingStore((s) => s.setLocation);
  const identity = useBookingStore((s) => s.identity);
  const existingLocation = useBookingStore((s) => s.location) as LocationKey | undefined;
  const [selected, setSelected] = useState<LocationKey | null>(existingLocation ?? null);
  const [advancing, setAdvancing] = useState(false);

  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimerRef.current !== null) clearTimeout(advanceTimerRef.current);
  }, []);

  const handleSelect = async (key: LocationKey) => {
    if (advancing) return;
    setSelected(key);
    setAdvancing(true);
    setLocation(key);

    // Fire-and-forget: update GHL contact with location tag
    if (identity?.ghlContactId) {
      contactUpdater.addTag(identity.ghlContactId, `location-${key}`).catch(() => { /* non-blocking */ });
    }

    // Track conversion event (no PII — only the location key, not contact info)
    trackFunnelEvent("location_selected", { location: key });

    // Brief visual confirmation then advance
    if (advanceTimerRef.current !== null) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(() => { navigate("/book/schedule"); }, 300);
  };

  const firstName = identity?.firstName;

  return (
    <BookLayout page="location" title="Choose Your Location | Men's Wellness Centers">
      <div className="flex flex-col min-h-[calc(100dvh-64px)]">
        {/* Back */}
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Back to contact info"
            className="inline-flex items-center gap-1.5 text-base font-semibold text-panel-foreground hover:text-primary transition-colors py-2 min-h-[44px]"
          >
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        </div>

        {/* Heading */}
        <div className="px-5 pt-7 pb-5">
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-2 py-1 inline-block mb-3">
            Book Your Visit
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,7vw,40px)] text-panel-foreground uppercase leading-tight">
            {firstName ? `${firstName}, choose` : "Choose"} your location.
          </h1>
        </div>

        {/* Location options */}
        <div className="px-5 pb-8 flex flex-col gap-2.5 flex-1">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelect(opt.key)}
                disabled={advancing}
                aria-pressed={isSelected}
                className={[
                  "w-full min-h-[80px] text-left rounded-2xl px-4 py-4 flex justify-between items-center",
                  "border-[1.5px] bg-panel shadow-card transition-all duration-200",
                  isSelected
                    ? "border-primary -translate-y-0.5"
                    : "border-panel-border hover:border-primary",
                  advancing ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                ].join(" ")}
              >
                <div>
                  <div className="font-display font-bold text-xl text-panel-foreground uppercase tracking-wide">
                    {opt.label}
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: "var(--c-text-on-light-muted)" }}>
                    {opt.address}
                  </div>
                  <div className="text-xs mt-1 font-semibold text-primary">
                    {opt.driveTime}
                  </div>
                </div>
                {isSelected && <Check size={18} className="text-primary flex-shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    </BookLayout>
  );
};

export default BookLocation;

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore, type UrgencyTier, type Duration } from "@/domain/booking/bookingStore";

const OPTIONS = [
  { value: "lt6mo", label: "Less than 6 months", urgency: "early" as UrgencyTier },
  { value: "6to12mo", label: "6 to 12 months", urgency: "building" as UrgencyTier },
  { value: "1to2yr", label: "1 to 2 years", urgency: "overdue" as UrgencyTier },
  { value: "gt2yr", label: "More than 2 years", urgency: "long_overdue" as UrgencyTier },
] as const;

const BookDuration = () => {
  const navigate = useNavigate();
  const symptom = useBookingStore((s) => s.symptom);
  const storedDuration = useBookingStore((s) => s.duration);
  const setDuration = useBookingStore((s) => s.setDuration);
  const [selected, setSelected] = useState<string>(storedDuration || "");
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!symptom) navigate("/book/symptom", { replace: true });
  }, [symptom, navigate]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  if (!symptom) return null;

  const handleSelect = (value: Duration, urgency: UrgencyTier) => {
    if (advanceTimer.current) return;
    setSelected(value);
    setDuration(value, urgency);
    advanceTimer.current = window.setTimeout(() => {
      navigate("/book/schedule");
    }, 300);
  };

  return (
    <BookLayout page="duration" title="How long has this been going on? | Men's Wellness Centers">
      <div className="flex flex-col min-h-[calc(100dvh-64px)]">
        {/* Back */}
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={() => navigate("/book/symptom")}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-panel-foreground hover:text-primary transition-colors py-2 min-h-[44px]"
          >
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        </div>

        {/* Heading */}
        <div className="px-5 pt-7 pb-5">
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-2 py-1 inline-block mb-3">
            Preparing Your Visit
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,7vw,40px)] text-panel-foreground uppercase leading-tight mb-2">
            When did you first notice this?
          </h1>
          <p className="text-base" style={{ color: "var(--c-text-on-light-muted)" }}>
            This helps your provider prepare for your visit. A rough estimate is fine.
          </p>
        </div>

        {/* Options */}
        <div className="px-5 pb-8 flex flex-col gap-2.5 flex-1">
          {OPTIONS.map((o) => {
            const isSelected = selected === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => handleSelect(o.value as Duration, o.urgency)}
                aria-pressed={isSelected}
                className={[
                  "w-full min-h-[64px] text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5",
                  "border-[1.5px] bg-panel transition-all",
                  isSelected
                    ? "border-primary shadow-cta"
                    : "border-panel-border hover:border-primary shadow-card",
                  "cursor-pointer",
                ].join(" ")}
              >
                <span className="font-display text-base font-bold uppercase tracking-wide text-panel-foreground flex-1">
                  {o.label}
                </span>
                {isSelected && <ChevronRight size={16} className="text-primary flex-shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    </BookLayout>
  );
};

export default BookDuration;

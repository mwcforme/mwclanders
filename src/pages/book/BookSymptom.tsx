import { useState, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { Zap, Heart, Scale, HelpCircle, ArrowLeft, ChevronRight, Star } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";

import { useBookingStore } from "@/domain/booking/bookingStore";

const OPTIONS = [
  { value: "energy", label: "Low energy or fatigue", icon: Zap },
  { value: "sexual", label: "ED or sexual health", icon: Heart },
  { value: "weight", label: "Trouble losing weight", icon: Scale },
  { value: "other", label: "Something else", icon: HelpCircle },
] as const;

const BookSymptom = () => {
  const navigate = useNavigate();
  const storedSymptom = useBookingStore((s) => s.symptom);
  const storedNote = useBookingStore((s) => s.note);
  const setSymptom = useBookingStore((s) => s.setSymptom);
  const [selected, setSelected] = useState<string>(storedSymptom || "");
  const [otherNote, setOtherNote] = useState<string>(storedNote || "");
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  // Prefetch next funnel steps while user is reading options
  useEffect(() => {
    void import("../book/BookDuration");
    void import("../book/BookSchedule");
    void import("@/components/book/GHLDayView");
  }, []);

  const handleSelect = (value: string) => {
    if (advanceTimer.current) return;
    setSelected(value);

    if (value === "other") {
      setSymptom("other", otherNote);
      return;
    }

    setSymptom(value as "energy" | "sexual" | "weight");
    advanceTimer.current = window.setTimeout(() => {
      navigate("/book/duration");
    }, 300);
  };

  const handleOtherContinue = () => {
    const note = otherNote.trim();
    if (note.length < 3) return;
    setSymptom("other", note);
    navigate("/book/duration");
  };

  const showOtherPanel = selected === "other";

  return (
    <BookLayout page="symptom" title="What brings you in? | Men's Wellness Centers">
      <div className="flex flex-col min-h-[calc(100dvh-64px)]">
        {/* Back */}
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-panel-foreground hover:text-primary transition-colors py-2 min-h-[44px]"
          >
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        </div>

        {/* Heading */}
        <div className="px-5 pt-7 pb-5">
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-2 py-1 inline-block mb-3">
            Your Provider Will Review This
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,7vw,40px)] text-panel-foreground uppercase leading-tight mb-2">
            What brings you in?
          </h1>
          <p className="text-base" style={{ color: "var(--c-text-on-light-muted)" }}>
            Your provider will see this before your visit. Pick the one that fits best.
          </p>

          {/* Trust strip */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} fill="var(--brand-cta)" stroke="var(--brand-cta)" aria-hidden />
              ))}
            </div>
            <span className="text-xs font-semibold" style={{ color: "var(--c-text-on-light-muted)" }}>
              4.9 · 191 Google reviews
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--c-text-on-light-muted)" }}>· Same-day availability</span>
          </div>
        </div>

        {/* Options */}
        <div className="px-5 pb-8 flex flex-col gap-2.5 flex-1">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            const isSelected = selected === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => handleSelect(o.value)}
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
                <Icon
                  size={20}
                  strokeWidth={1.75}
                  className={isSelected ? "text-primary flex-shrink-0" : "text-panel-muted flex-shrink-0"}
                  aria-hidden
                />
                <span className="font-display text-base font-bold uppercase tracking-wide text-panel-foreground flex-1">
                  {o.label}
                </span>
                {isSelected && <ChevronRight size={16} className="text-primary flex-shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>

        {/* "Other" text panel */}
        {showOtherPanel && (
          <div className="px-5 pb-8">
            <textarea
              id="other-note"
              rows={3}
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              placeholder="Tell us briefly what's going on..."
              className="w-full rounded-xl border-[1.5px] border-panel-border bg-panel text-panel-foreground placeholder:text-panel-muted px-4 py-3.5 text-base resize-none outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={handleOtherContinue}
              disabled={otherNote.trim().length < 3}
              className={[
                "mt-3 w-full h-14 rounded-2xl font-display font-bold uppercase tracking-wider text-base transition-colors",
                otherNote.trim().length < 3
                  ? "bg-disabled-light text-disabled-light-foreground cursor-not-allowed"
                  : "bg-primary text-white shadow-cta cursor-pointer",
              ].join(" ")}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </BookLayout>
  );
};

export default BookSymptom;

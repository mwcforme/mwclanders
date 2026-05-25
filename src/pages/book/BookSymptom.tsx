import { useState, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { Zap, Heart, Scale, HelpCircle } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";

import SurveyCard from "@/components/book/SurveyCard";
import OptionRow from "@/components/book/OptionRow";
import { useBookingStore } from "@/domain/booking/bookingStore";

const OPTIONS = [
  { value: "energy", label: "Low energy or fatigue", icon: Zap },
  { value: "sexual", label: "Sexual health concerns", icon: Heart },
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
      <SurveyCard
        progressLabel="Almost done. 2 quick questions"
        filledSegments={1}
        totalSegments={3}
        title="What brings you in?"
        subtitle="Pick the one that fits best."
        helperText="This helps us prepare your personalized consultation."
        prevLabel="Back"
        onPrev={() => navigate("/")}
      >
        {OPTIONS.map((o) => (
          <OptionRow
            key={o.value}
            icon={o.icon}
            label={o.label}
            selected={selected === o.value}
            onClick={() => handleSelect(o.value)}
          />
        ))}

        {showOtherPanel && (
          <div
            className="mt-4 p-4 md:p-5"
            style={{
              // hardcoded-color-allow-next-line
              background: "#FFF7F0",
              // hardcoded-color-allow-next-line
              border: "1px solid #FCD9B6",
              borderRadius: 12,
            }}
          >
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "var(--brand-navy-deep)",
                marginBottom: 6,
              }}
            >
              Tell us a bit more
            </h2>
            <label
              htmlFor="other-note"
              style={{
                display: "block",
                fontSize: 16,
                color: "var(--c-text-on-light-muted)",
                marginBottom: 8,
                fontFamily: "Inter, sans-serif",
              }}
            >
              What's the main thing you'd like help with?
            </label>
            <textarea
              id="other-note"
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              placeholder="e.g., sleep issues, mood, focus, recovery..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                // hardcoded-color-allow-next-line
                border: "2px solid #E5E7EB",
                fontFamily: "Inter, sans-serif",
                fontSize: 16,
                color: "var(--brand-navy-deep)",
                outline: "none",
                resize: "vertical",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-cta)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
            <button
              type="button"
              onClick={handleOtherContinue}
              disabled={otherNote.trim().length < 3}
              style={{
                marginTop: 12,
                width: "100%",
                minHeight: 52,
                background: otherNote.trim().length < 3 ? "var(--c-btn-disabled-bg)" : "var(--brand-cta)",
                color: otherNote.trim().length < 3 ? "var(--c-btn-disabled-fg)" : "var(--c-text-on-dark)",
                border: 0,
                borderRadius: 10,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                cursor: otherNote.trim().length < 3 ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow:
                  otherNote.trim().length < 3
                    ? "none"
                    // hardcoded-color-allow-next-line
                    : "0 2px 6px rgba(232,103,10,0.35)",
              }}
            >
              Continue
            </button>
          </div>
        )}
      </SurveyCard>
    </BookLayout>
  );
};

export default BookSymptom;

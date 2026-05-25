import { useState, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { Zap, Heart, Scale, HelpCircle, ArrowLeft } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";

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
      <div style={{ minHeight: "100dvh", background: "var(--brand-navy-deep)", display: "flex", flexDirection: "column" }}>
        {/* Back */}
        <div style={{ padding: "16px 20px 0" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 0", minHeight: 44 }}
          >
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        </div>

        {/* Heading */}
        <div style={{ padding: "28px 20px 24px" }}>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 7vw, 40px)", color: "var(--brand-cream)", textTransform: "uppercase", lineHeight: 1.05, letterSpacing: "0.01em", marginBottom: 8 }}>
            What brings you in?
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            Pick the one that fits best.
          </p>
        </div>

        {/* Options */}
        <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {OPTIONS.map((o) => (
            <OptionRow
              key={o.value}
              icon={o.icon}
              label={o.label}
              selected={selected === o.value}
              onClick={() => handleSelect(o.value)}
            />
          ))}
        </div>

        {/* "Other" text panel */}
        {showOtherPanel && (
          <div style={{ padding: "0 20px 32px" }}>
            <textarea
              id="other-note"
              rows={3}
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              placeholder="Tell us briefly what's going on..."
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12, padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: 16, color: "var(--brand-cream)", lineHeight: 1.5, resize: "none", outline: "none" }}
            />
            <button
              type="button"
              onClick={handleOtherContinue}
              disabled={otherNote.trim().length < 3}
              style={{ marginTop: 12, width: "100%", height: 56, background: otherNote.trim().length < 3 ? "rgba(255,255,255,0.10)" : "var(--brand-cta)", color: otherNote.trim().length < 3 ? "rgba(255,255,255,0.35)" : "#fff", border: "none", borderRadius: 12, fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 700, cursor: otherNote.trim().length < 3 ? "not-allowed" : "pointer" }}
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

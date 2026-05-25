import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import OptionRow from "@/components/book/OptionRow";
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
      <div style={{ minHeight: "100dvh", background: "var(--brand-navy-deep)", display: "flex", flexDirection: "column" }}>
        {/* Back */}
        <div style={{ padding: "16px 20px 0" }}>
          <button
            type="button"
            onClick={() => navigate("/book/symptom")}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 0", minHeight: 44 }}
          >
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        </div>

        {/* Heading */}
        <div style={{ padding: "28px 20px 24px" }}>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 7vw, 40px)", color: "var(--brand-cream)", textTransform: "uppercase", lineHeight: 1.05, letterSpacing: "0.01em", marginBottom: 8 }}>
            When did you first notice this?
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            A rough estimate is fine.
          </p>
        </div>

        {/* Options */}
        <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {OPTIONS.map((o) => (
            <OptionRow
              key={o.value}
              label={o.label}
              selected={selected === o.value}
              onClick={() => handleSelect(o.value as Duration, o.urgency)}
            />
          ))}
        </div>
      </div>
    </BookLayout>
  );
};

export default BookDuration;

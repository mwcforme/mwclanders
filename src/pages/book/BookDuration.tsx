import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, CalendarDays, CalendarRange, History } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import SurveyCard from "@/components/book/SurveyCard";
import OptionRow from "@/components/book/OptionRow";
import { useBookingStore, type UrgencyTier, type Duration } from "@/domain/booking/bookingStore";

const OPTIONS = [
  { value: "lt6mo", label: "Less than 6 months", icon: CalendarClock, urgency: "early" as UrgencyTier },
  { value: "6to12mo", label: "6 to 12 months", icon: CalendarDays, urgency: "building" as UrgencyTier },
  { value: "1to2yr", label: "1 to 2 years", icon: CalendarRange, urgency: "overdue" as UrgencyTier },
  { value: "gt2yr", label: "More than 2 years", icon: History, urgency: "long_overdue" as UrgencyTier },
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
      <SurveyCard
        progressLabel="Almost done. 2 quick questions"
        filledSegments={2}
        totalSegments={3}
        title="How long has this been going on?"
        subtitle="A rough estimate is fine."
        prevLabel="Back"
        onPrev={() => navigate("/book/symptom")}
      >
        {OPTIONS.map((o) => (
          <OptionRow
            key={o.value}
            icon={o.icon}
            label={o.label}
            selected={selected === o.value}
            onClick={() => handleSelect(o.value as Duration, o.urgency)}
          />
        ))}
      </SurveyCard>
    </BookLayout>
  );
};

export default BookDuration;

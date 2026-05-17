/**
 * /product/trt/bloodwork — Recent labs yes/no
 * Step 5 of the 10-step TRT funnel.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, Check, Minus, ArrowRight } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { contactUpdater } from "@/services/contactUpdater";

const ORANGE = "#E8670A";
const NAVY   = "#0B1029";

type LabChoice = "yes" | "no" | null;

export default function TRTBloodwork() {
  const navigate   = useNavigate();
  const identity   = useBookingStore((s) => s.identity);
  const [choice, setChoice] = useState<LabChoice>(null);

  const handleSelect = (value: "yes" | "no") => {
    setChoice(value);
    // Tag contact immediately on selection — fire-and-forget
    const contactId = identity?.ghlContactId;
    if (contactId) {
      const tag = value === "yes" ? "has-recent-labs" : "labs-needed";
      contactUpdater.addTag(contactId, tag).catch(() => {});
    }
  };

  const handleContinue = () => {
    if (!choice) return;
    if (choice === "yes") navigate("/product/trt/bloodwork/lab-requisition");
    else navigate("/product/trt/success");
  };

  const ChoiceCard = ({
    value,
    title,
    icon,
  }: {
    value: "yes" | "no";
    title: string;
    icon: React.ReactNode;
  }) => {
    const sel = choice === value;
    return (
      <button
        type="button"
        onClick={() => handleSelect(value)}
        style={{
          width: "100%", padding: "20px 24px",
          border: `2px solid ${sel ? ORANGE : "#E5E7EB"}`,
          borderRadius: 12,
          background: sel ? "rgba(232,103,10,0.04)" : "#FAFAFA",
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 16,
          textAlign: "left",
          boxShadow: sel ? "0 0 0 3px rgba(232,103,10,0.12)" : "none",
          transition: "all 150ms ease",
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: sel ? ORANGE : "#F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 150ms ease",
        }}>
          <span style={{ color: sel ? "#FFFFFF" : "#9CA3AF" }}>{icon}</span>
        </div>
        <span style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700,
          fontSize: 17, color: sel ? NAVY : "#374151",
          letterSpacing: "0.01em",
        }}>
          {title}
        </span>
        {sel && (
          <div style={{ marginLeft: "auto" }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: ORANGE,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Check size={13} strokeWidth={3} style={{ color: "#FFFFFF" }} />
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
      <SEO
        title="Lab Results | Men's Wellness Centers"
        description="Do you have recent testosterone or hormone labs? Let us know before your consultation."
      />
      <TRTHeader minimal />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 48px" }}>
        <div style={{
          width: "100%", maxWidth: 480,
          background: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(11,16,41,0.10)",
          padding: "40px 32px",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
        }}>

          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(232,103,10,0.10)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <FlaskConical size={40} strokeWidth={1.75} style={{ color: ORANGE }} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "Oswald, sans-serif", fontWeight: 700,
            fontSize: "clamp(22px, 4vw, 28px)", color: NAVY,
            marginBottom: 10, lineHeight: 1.15,
          }}>
            Do You Have Recent Lab Results?
          </h1>
          <p style={{ color: "#6B7280", fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>
            If you've had testosterone or hormone labs in the past 90 days, you can upload them.
            Otherwise, we'll draw labs at your visit.
          </p>

          {/* Choices */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, textAlign: "left" }}>
            <ChoiceCard
              value="yes"
              title="Yes, I have recent labs"
              icon={<Check size={20} strokeWidth={2.5} />}
            />
            <ChoiceCard
              value="no"
              title="No, draw labs at my visit"
              icon={<Minus size={20} strokeWidth={2.5} />}
            />
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!choice}
            style={{
              width: "100%", height: 52, borderRadius: 999,
              background: choice ? ORANGE : "#E5E7EB",
              color: choice ? "#FFFFFF" : "#9CA3AF",
              border: "none",
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: 17, letterSpacing: "0.04em", textTransform: "uppercase",
              cursor: choice ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: choice ? "0 4px 16px rgba(232,103,10,0.30)" : "none",
              transition: "background 150ms ease, color 150ms ease",
            }}
          >
            Continue <ArrowRight size={17} strokeWidth={2.5} />
          </button>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}

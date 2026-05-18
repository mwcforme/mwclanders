/**
 * /product/trt/medical-protocol — Confirmation + countdown + provider card
 * Step 2 of the 10-step TRT funnel.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { contactUpdater } from "@/services/contactUpdater";

const ORANGE = "var(--brand-cta)";
const NAVY   = "var(--brand-navy-deep)";

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

const STEPS = [
  "Complete your medical intake",
  "Your provider reviews your case",
  "Begin your personalized protocol",
];

export default function TRTMedicalProtocol() {
  const navigate   = useNavigate();
  const countdown  = useCountdown(30 * 60); // 30 minutes
  const identity   = useBookingStore((s) => s.identity);

  // Tag contact on mount — fire-and-forget
  useEffect(() => {
    const contactId = identity?.ghlContactId;
    if (contactId) contactUpdater.addTag(contactId, "intake-started").catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-white)" }}>
      <SEO
        title="Consultation Being Prepared | Men's Wellness Centers"
        description="Your Virginia TRT provider is reviewing your request. Complete your medical intake to proceed."
      />
      <TRTHeader minimal />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 48px" }}>
        <div style={{
          width: "100%", maxWidth: 540,
          background: "var(--bg-white)",
          borderRadius: 16,
          // hardcoded-color-allow-next-line
          boxShadow: "0 8px 40px rgba(11,16,41,0.10)",
          padding: "40px 36px",
          fontFamily: "Inter, sans-serif",
        }}>

          {/* Eyebrow pill */}
          <style>{`
            @keyframes pulseOrangeDot {
              0%, 100% { opacity: 1; transform: scale(1); }
              50%       { opacity: 0.5; transform: scale(0.75); }
            }
            .pulsing-dot {
              animation: pulseOrangeDot 1.5s ease-in-out infinite;
            }
          `}</style>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              // hardcoded-color-allow-next-line
              background: "rgba(232,103,10,0.10)",
              color: ORANGE,
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: 999,
              // hardcoded-color-allow-next-line
              border: `1px solid rgba(232,103,10,0.25)`,
            }}>
              <span
                className="pulsing-dot"
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: ORANGE, flexShrink: 0,
                  display: "inline-block",
                }}
                aria-hidden="true"
              />
              APPOINTMENT PENDING
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(22px, 4vw, 30px)",
            color: NAVY,
            textAlign: "center",
            marginBottom: 10,
            lineHeight: 1.15,
          }}>
            Your Consultation is Being Prepared
          </h1>
          <p style={{ textAlign: "center", color: "var(--c-text-on-light-muted)", fontSize: 15, marginBottom: 28 }}>
            One of our Virginia providers is reviewing your request.
          </p>

          {/* Countdown timer */}
          <div style={{
            background: NAVY,
            borderRadius: 12,
            padding: "20px 24px",
            textAlign: "center",
            marginBottom: 28,
          }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Reservation expires in
            </p>
            <span style={{
              fontFamily: "'Courier New', 'Courier', monospace",
              fontWeight: 700,
              fontSize: "clamp(44px, 10vw, 60px)",
              color: ORANGE,
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}>
              {countdown}
            </span>
          </div>

          {/* Provider card */}
          <div style={{
            // hardcoded-color-allow-next-line
            border: "1.5px solid #E5E7EB",
            borderRadius: 12,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
            flexWrap: "wrap",
          }}>
            {/* Avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
              background: NAVY,
              border: `2.5px solid ${ORANGE}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: 20, color: "var(--c-text-on-dark)", letterSpacing: "0.04em",
              }}>
                DC
              </span>
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 3 }}>
                Dr. Douglas Christianson, NMD
              </p>
              <p style={{ color: "var(--c-text-on-light-muted)", fontSize: 13 }}>
                Licensed Virginia Provider · Men's Health Specialist
              </p>
            </div>
            {/* Badges */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
              <span style={{
                // hardcoded-color-allow-next-line
                background: "rgba(232,103,10,0.10)",
                color: ORANGE,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "4px 10px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}>
                Your Assigned Provider
              </span>
              <span style={{
                // hardcoded-color-allow-next-line
                background: "#DCFCE7",
                // hardcoded-color-allow-next-line
                color: "#16A34A",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "4px 10px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  // hardcoded-color-allow-next-line
                  background: "#16A34A", display: "inline-block",
                }} aria-hidden="true" />
                Online Now
              </span>
            </div>
          </div>

          {/* Next steps */}
          <div style={{ marginBottom: 28 }}>
            {STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  marginBottom: i < STEPS.length - 1 ? 14 : 0,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: ORANGE,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: "Oswald, sans-serif", fontWeight: 700,
                    fontSize: 14, color: "var(--c-text-on-dark)",
                  }}>
                    {i + 1}
                  </span>
                </div>
                <span style={{ fontSize: 15, color: NAVY, fontWeight: 500 }}>{step}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => navigate("/product/trt/questionnaire")}
            style={{
              width: "100%", height: 56, borderRadius: 999,
              background: ORANGE, color: "var(--c-text-on-dark)", border: "none",
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              // hardcoded-color-allow-next-line
              boxShadow: "0 4px 20px rgba(232,103,10,0.35)",
            }}
          >
            Complete Medical Intake <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-placeholder-light)", marginTop: 14 }}>
            No obligation. Cancel anytime.
          </p>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}

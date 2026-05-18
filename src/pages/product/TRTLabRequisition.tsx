/**
 * /product/trt/bloodwork/lab-requisition — Lab req confirmation
 * Step 6 of the 10-step TRT funnel.
 */

import { useNavigate } from "react-router-dom";
import { FileText, ExternalLink } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";

const ORANGE = "var(--brand-cta)";
const NAVY   = "var(--brand-navy-deep)";

export default function TRTLabRequisition() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--c-text-on-dark)" }}>
      <SEO
        title="Lab Requisition Ready | Men's Wellness Centers"
        description="Your TRT lab requisition is ready. Visit any LabCorp or Quest Diagnostics location near you."
      />
      <TRTHeader minimal />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 48px" }}>
        <div style={{
          width: "100%", maxWidth: 480,
          background: "var(--c-text-on-dark)",
          borderRadius: 16,
          // hardcoded-color-allow-next-line
          boxShadow: "0 8px 40px rgba(11,16,41,0.10)",
          padding: "40px 32px",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
        }}>

          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            // hardcoded-color-allow-next-line
            background: "rgba(232,103,10,0.10)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <FileText size={40} strokeWidth={1.75} style={{ color: ORANGE }} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "Oswald, sans-serif", fontWeight: 700,
            fontSize: "clamp(22px, 4vw, 28px)", color: NAVY,
            marginBottom: 10, lineHeight: 1.15,
          }}>
            Lab Requisition Ready
          </h1>
          // hardcoded-color-allow-next-line
          <p style={{ color: "#6B7280", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
            Your provider has prepared a lab requisition. Visit any LabCorp or Quest Diagnostics
            location near you.
          </p>

          {/* Info box */}
          <div style={{
            // hardcoded-color-allow-next-line
            background: "rgba(232,103,10,0.06)",
            // hardcoded-color-allow-next-line
            border: `1.5px solid rgba(232,103,10,0.25)`,
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 24,
            textAlign: "left",
          }}>
            // hardcoded-color-allow-next-line
            <p style={{ fontSize: 13, color: "#92400E", fontWeight: 600, lineHeight: 1.6 }}>
              Your requisition includes:{" "}
              // hardcoded-color-allow-next-line
              <span style={{ fontWeight: 400, color: "#78350F" }}>
                Testosterone Total &amp; Free, LH, FSH, PSA, CBC, CMP
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <button
              type="button"
              disabled
              title="Lab requisition download coming soon"
              style={{
                width: "100%", height: 52, borderRadius: 999,
                // hardcoded-color-allow-next-line
                background: "#E5E7EB", color: "#9CA3AF", border: "none",
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase",
                cursor: "not-allowed",
              }}
            >
              Download Lab Requisition
            </button>

            <a
              href="https://www.labcorp.com/labs-and-appointments"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "100%", height: 52, borderRadius: 999,
                background: "transparent",
                border: `2px solid ${NAVY}`,
                color: NAVY,
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              Find a Lab Near Me <ExternalLink size={15} strokeWidth={2} />
            </a>
          </div>

          {/* Skip link */}
          <button
            type="button"
            onClick={() => navigate("/product/trt/success")}
            style={{
              background: "none", border: "none",
              // hardcoded-color-allow-next-line
              color: "#9CA3AF", fontSize: 14, cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              textDecoration: "underline",
              padding: "8px 0",
            }}
          >
            Continue without uploading →
          </button>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}

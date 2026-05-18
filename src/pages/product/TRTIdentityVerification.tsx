/**
 * /product/trt/identity-verification — ID upload (skippable)
 * Step 4 of the 10-step TRT funnel.
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Upload } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { contactUpdater } from "@/services/contactUpdater";

const ORANGE = "var(--brand-cta)";
const NAVY   = "var(--brand-navy-deep)";

export default function TRTIdentityVerification() {
  const navigate   = useNavigate();
  const identity   = useBookingStore((s) => s.identity);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (f) setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = () => {
    // No actual file upload backend yet — just tag the contact
    const contactId = identity?.ghlContactId;
    if (contactId) contactUpdater.addTag(contactId, "id-uploaded").catch(() => {});
    navigate("/product/trt/bloodwork");
  };

  const handleSkip = () => {
    const contactId = identity?.ghlContactId;
    if (contactId) contactUpdater.addTag(contactId, "id-skipped").catch(() => {});
    navigate("/product/trt/bloodwork");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--c-text-on-dark)" }}>
      <SEO
        title="Verify Your Identity | Men's Wellness Centers"
        description="Optional ID upload to help your provider prepare for your testosterone consultation."
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
            <ShieldCheck size={40} strokeWidth={1.75} style={{ color: ORANGE }} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "Oswald, sans-serif", fontWeight: 700,
            fontSize: "clamp(22px, 4vw, 28px)", color: NAVY,
            marginBottom: 10, lineHeight: 1.15,
          }}>
            Verify Your Identity
          </h1>
          // hardcoded-color-allow-next-line
          <p style={{ color: "#6B7280", fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>
            Uploading your ID helps your provider prepare for your visit. This step is optional.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              // hardcoded-color-allow-next-line
              border: `2px dashed ${dragOver ? ORANGE : "#D0D5DD"}`,
              borderRadius: 16,
              padding: "48px 24px",
              cursor: "pointer",
              // hardcoded-color-allow-next-line
              background: dragOver ? "rgba(232,103,10,0.03)" : "#FAFAFA",
              transition: "border-color 150ms ease, background 150ms ease",
              marginBottom: 20,
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
              aria-label="Upload ID document"
            />
            // hardcoded-color-allow-next-line
            <div style={{ marginBottom: 12, color: dragOver ? ORANGE : "#9CA3AF" }}>
              <Upload size={40} strokeWidth={1.5} />
            </div>
            {file ? (
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>{file.name}</p>
            ) : (
              <>
                <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 4 }}>
                  Drag &amp; drop your ID here
                </p>
                // hardcoded-color-allow-next-line
                <p style={{ color: "#9CA3AF", fontSize: 13 }}>or click to browse</p>
              </>
            )}
          </div>

          {/* Upload button (only when file selected) */}
          {file && (
            <button
              type="button"
              onClick={handleUpload}
              style={{
                width: "100%", height: 52, borderRadius: 999,
                background: ORANGE, color: "var(--c-text-on-dark)", border: "none",
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: 17, letterSpacing: "0.04em", textTransform: "uppercase",
                cursor: "pointer", marginBottom: 14,
                // hardcoded-color-allow-next-line
                boxShadow: "0 4px 16px rgba(232,103,10,0.30)",
              }}
            >
              Upload ID
            </button>
          )}

          {/* Skip link */}
          <button
            type="button"
            onClick={handleSkip}
            style={{
              background: "none", border: "none",
              // hardcoded-color-allow-next-line
              color: "#9CA3AF", fontSize: 14, cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              textDecoration: "underline",
              padding: "8px 0",
            }}
          >
            Skip for now →
          </button>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}

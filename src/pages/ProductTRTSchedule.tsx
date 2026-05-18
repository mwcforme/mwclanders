/**
 * /product/trt/schedule — Location → Calendar flow
 *
 * Step 1: Location selector (3 radio cards)
 * Step 2: GHL calendar for selected location → onBooked → /book/confirmed
 *
 * No lead form — user already gave name/phone on the LP form (TRTHeroForm).
 * If coming fresh from /product/trt CTA with no identity, we collect
 * just phone inline before showing the calendar.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { useBookingStore } from "@/domain/booking/bookingStore";
import GHLDayView from "@/components/book/GHLDayView";
import { CENTER_CALENDARS, type LocationKey } from "@/lib/ghlCalendars";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";

const LOCATIONS: { key: LocationKey; label: string; address: string }[] = [
  { key: "richmond",       label: "Richmond",       address: "Glen Allen, VA" },
  { key: "virginia-beach", label: "Virginia Beach",  address: "Virginia Beach, VA" },
  { key: "newport-news",   label: "Newport News",    address: "Newport News, VA" },
];

export default function ProductTRTSchedule() {
  const navigate    = useNavigate();
  const setLocation = useBookingStore((s) => s.setLocation);
  const setApptTime = useBookingStore((s) => s.setAppointmentTime);
  const identity    = useBookingStore((s) => s.identity);
  const storeLocation = useBookingStore((s) => s.location);

  const [step, setStep] = useState<"location" | "calendar">(
    storeLocation ? "calendar" : "location"
  );
  const [selected, setSelected] = useState<LocationKey | null>(
    (storeLocation as LocationKey) ?? null
  );
  const [locationError, setLocationError] = useState("");
  const [nextAvail, setNextAvail] = useState<string | null>(null);
  const handleNextAvail = useCallback((iso: string | null) => setNextAvail(iso), []);

  const nextAvailLabel = nextAvail ? (() => {
    const d = new Date(nextAvail);
    const day = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "America/New_York" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
    return `${day} at ${time}`;
  })() : null;

  const handleLocationNext = () => {
    if (!selected) { setLocationError("Please choose a location."); return; }
    setLocation(selected);
    setLocationError("");
    setStep("calendar");
  };

  const handleBooked = (slotIso: string) => {
    setApptTime(slotIso);
    navigate("/product/trt/medical-protocol");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F4F6FA" }}>
      <SEO
        title="Schedule Your Consultation | Men's Wellness Centers"
        description="Book your no-cost testosterone consultation at a Virginia Men's Wellness Centers location."
      />
      <TRTHeader />

      <main style={{ flex: 1, padding: "80px 16px 48px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* ── STEP 1: Location ─────────────────────────────────────────── */}
          {step === "location" && (
            <div style={{
              // hardcoded-color-allow-next-line
              background: "var(--bg-white)", borderRadius: 16, padding: "40px 36px",
              // hardcoded-color-allow-next-line
              boxShadow: "0 8px 40px rgba(11,16,41,0.10)",
            }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  // hardcoded-color-allow-next-line
                  background: "rgba(232,103,10,0.10)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <MapPin size={28} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />
                </div>
                <h1 style={{
                  fontFamily: "Oswald, sans-serif", fontWeight: 700,
                  fontSize: "clamp(22px, 4vw, 30px)", color: "var(--brand-navy)",
                  lineHeight: 1.15, marginBottom: 8,
                }}>
                  Choose Your Location
                </h1>
                <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)" }}>
                  Select the Men's Wellness Centers nearest to you.
                </p>
                <div style={{ width: 48, height: 3, background: "var(--brand-cta)", margin: "14px auto 0", borderRadius: 2 }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {LOCATIONS.map(({ key, label, address }) => {
                  const sel = selected === key;
                  return (
                    <label key={key} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 18px", borderRadius: 10, cursor: "pointer",
                      // hardcoded-color-allow-next-line
                      border: `2px solid ${sel ? "var(--brand-cta)" : "#E0E4EC"}`,
                      // hardcoded-color-allow-next-line
                      background: sel ? "rgba(232,103,10,0.04)" : "#FAFBFC",
                      // hardcoded-color-allow-next-line
                      boxShadow: sel ? "0 0 0 3px rgba(232,103,10,0.10)" : "none",
                      transition: "all 150ms ease", userSelect: "none",
                    }}>
                      <input
                        type="radio" name="location" value={key}
                        checked={sel}
                        onChange={() => { setSelected(key); setLocationError(""); }}
                        style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                      />
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        // hardcoded-color-allow-next-line
                        border: `2px solid ${sel ? "var(--brand-cta)" : "#C0C8D8"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {sel && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--brand-cta)" }} />}
                      </div>
                      <MapPin size={16} strokeWidth={2} style={{ color: sel ? "var(--brand-cta)" : "var(--c-placeholder-light)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--brand-navy)" }}>{label}</div>
                        <div style={{ fontSize: 12, color: "var(--c-placeholder-light)", marginTop: 2 }}>{address}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {locationError && (
                <p style={{ color: "var(--c-error-on-light)", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{locationError}</p>
              )}

              <button type="button" onClick={handleLocationNext} style={{
                width: "100%", height: 56, borderRadius: 999,
                // hardcoded-color-allow-next-line
                background: "var(--brand-cta)", color: "var(--c-text-on-dark)", border: "none",
                fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 17,
                letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                // hardcoded-color-allow-next-line
                boxShadow: "0 4px 20px rgba(232,103,10,0.35)",
              }}>
                See Available Times <ArrowRight size={18} strokeWidth={2.5} />
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-placeholder-light)", marginTop: 14 }}>
                No-cost consultation · Same-day labs · Virginia locations
              </p>
            </div>
          )}

          {/* ── STEP 2: Calendar ──────────────────────────────────────────── */}
          {step === "calendar" && selected && (
            <div style={{ background: "var(--bg-white)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(11,16,41,0.10)" }}>
              {/* Header */}
              <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid #F0F2F5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <button type="button" onClick={() => setStep("location")} style={{
                    // hardcoded-color-allow-next-line
                    background: "none", border: "none", color: "var(--c-placeholder-light)",
                    fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif",
                    padding: 0, display: "flex", alignItems: "center", gap: 4,
                  }}>
                    ← Change location
                  </button>
                </div>
                <h2 style={{
                  fontFamily: "Oswald, sans-serif", fontWeight: 600,
                  fontSize: "clamp(20px, 3vw, 26px)", color: "var(--brand-navy)",
                  textTransform: "uppercase", marginBottom: 4,
                }}>
                  Your 60-Minute Assessment
                </h2>
                <p style={{ fontSize: 14, color: "var(--c-placeholder-light)" }}>
                  {LOCATIONS.find(l => l.key === selected)?.label} · Licensed provider, same-day labs
                </p>
                {nextAvailLabel && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    // hardcoded-color-allow-next-line
                    background: "rgba(232,103,10,0.08)", border: "1px solid rgba(232,103,10,0.25)",
                    borderRadius: 999, padding: "4px 12px", marginTop: 10,
                  }}>
                    <Clock size={13} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-cta)" }}>
                      Next: {nextAvailLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* GHL Calendar */}
              <BookingErrorBoundary>
                <GHLDayView
                  location={selected}
                  firstName={identity?.firstName || ""}
                  lastName={identity?.lastName || ""}
                  email={identity?.email || ""}
                  phone={identity?.phone || ""}
                  source="product-trt-funnel"
                  customFields={{ mwc_funnel_service: "trt" }}
                  onNextAvailable={handleNextAvail}
                  onBooked={handleBooked}
                />
              </BookingErrorBoundary>
            </div>
          )}

        </div>
      </main>

      <TRTFooter />
    </div>
  );
}

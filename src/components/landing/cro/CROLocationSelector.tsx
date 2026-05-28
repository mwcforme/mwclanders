/**
 * CROLocationSelector — radio group for clinic location selection.
 */
import { MapPin, Check, AlertCircle } from "lucide-react";
import { LOCATIONS, type LocationKey } from "@/data/croContent";

// hardcoded-color-allow-next-line
const ERR_RED = "#DC2626";
const ORANGE  = "var(--brand-cta)";
const WHITE   = "var(--bg-white)";

interface CROLocationSelectorProps {
  formId: string;
  value: LocationKey | "";
  onChange: (key: LocationKey) => void;
  error?: string;
}

export const CROLocationSelector = ({ formId, value, onChange, error }: CROLocationSelectorProps) => {
  return (
    <div role="radiogroup" aria-label="Select center location" aria-required="true">
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
        // hardcoded-color-allow-next-line
        color: error ? ERR_RED : "rgba(245,240,235,0.65)", marginBottom: 8,
      }}>
        Location
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {LOCATIONS.map(({ key, label }) => {
          const sel = value === key;
          return (
            <label key={key} style={{
              display: "flex", alignItems: "center", height: 48, borderRadius: 8,
              padding: "0 14px", gap: 10, cursor: "pointer", userSelect: "none",
              border: sel ? `2px solid ${ORANGE}` : error
                // hardcoded-color-allow-next-line
                ? `1.5px solid ${ERR_RED}` : `1.5px solid rgba(255,255,255,0.11)`,
              // hardcoded-color-allow-next-line
              background: sel ? ORANGE : "rgba(255,255,255,0.05)",
              // hardcoded-color-allow-next-line
              boxShadow: sel ? `0 4px 16px rgba(232,103,10,0.30)` : "none",
              transition: "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
            }}>
              <input
                type="radio" name={`${formId}-location`} value={key} checked={sel}
                onChange={() => onChange(key)} aria-label={label}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
              />
              <MapPin size={16} strokeWidth={2} aria-hidden
                style={{ flexShrink: 0, color: sel ? WHITE : ORANGE, transition: "color 150ms ease" }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: WHITE, lineHeight: 1 }}>
                {label}
              </span>
              {sel && <Check size={15} strokeWidth={2.5} aria-hidden style={{ flexShrink: 0, color: WHITE }} />}
            </label>
          );
        })}
      </div>
      {error && (
        <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED, marginTop: 6 }}>
          <AlertCircle size={12} strokeWidth={2} /> {error}
        </p>
      )}
      <style>{`label:has(input[name="${formId}-location"]:focus-visible){outline:2px solid ${ORANGE};outline-offset:2px}`}</style>
    </div>
  );
};

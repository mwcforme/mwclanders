/**
 * TCPADisclaimer — TCPA consent checkbox with disclaimer copy.
 */
import { Check, AlertCircle } from "lucide-react";

// hardcoded-color-allow-next-line
const ERR_RED = "#DC2626";
const ORANGE  = "var(--brand-cta)";
const WHITE   = "var(--bg-white)";

interface TCPADisclaimerProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export const TCPADisclaimer = ({ id = "hf-tcpa", checked, onChange, error }: TCPADisclaimerProps) => (
  <div>
    <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      aria-describedby={`${id}-text`} aria-invalid={!!error}
      style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} />
    <label htmlFor={id} style={{
      display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", userSelect: "none",
      padding: "10px 12px", margin: "0 -12px", borderRadius: 8,
    }}>
      <div aria-hidden="true" style={{
        width: 24, height: 24, borderRadius: 5,
        // hardcoded-color-allow-next-line
        border: `2px solid ${checked ? ORANGE : error ? ERR_RED : "rgba(255,255,255,0.40)"}`,
        background: checked ? ORANGE : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
        transition: "background 150ms ease, border-color 150ms ease",
      }}>
        {checked && <Check size={14} strokeWidth={3} style={{ color: WHITE }} />}
      </div>
      <span id={`${id}-text`} style={{ fontSize: 11, color: "rgba(245,240,235,0.50)", lineHeight: 1.4 }}>
        I agree to receive SMS/calls & texts from Men&rsquo;s Wellness Centers. Msg & data rates may apply. Reply STOP to opt out.{" "}
        Not a condition of service. HIPAA Compliant.{" "}
        <a href="/privacy-policy" style={{ color: ORANGE, textDecoration: "none" }}>Privacy Policy</a>
      </span>
    </label>
    {error && (
      <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED, marginTop: 6 }}>
        <AlertCircle size={12} strokeWidth={2} /> {error}
      </p>
    )}
  </div>
);

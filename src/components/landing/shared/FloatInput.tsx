/**
 * FloatInput — labelled text/tel input for CRO hero forms.
 */
import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";

// hardcoded-color-allow-next-line
const ERR_RED = "#DC2626";
const ORANGE  = "var(--brand-cta)";
const NAVY    = "var(--brand-navy-deep)";
const WHITE   = "var(--bg-white)";

export interface FloatInputProps {
  id: string;
  name?: string;
  label: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  icon: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
  placeholder?: string;
  ariaInvalid?: boolean;
}

export const FloatInput = ({
  id, name, label, type = "text", inputMode, autoComplete,
  value, onChange, onFocus, onBlur,
  error, icon, inputRef, placeholder, ariaInvalid,
}: FloatInputProps) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <label htmlFor={id} style={{
        display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase",
        // hardcoded-color-allow-next-line
        color: error ? ERR_RED : focused ? ORANGE : "rgba(245,240,235,0.55)",
        marginBottom: 6, fontFamily: "Inter, sans-serif", transition: "color 150ms ease",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div aria-hidden style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          // hardcoded-color-allow-next-line
          color: error ? ERR_RED : focused ? ORANGE : "rgba(11,16,41,0.58)",
          transition: "color 150ms ease", pointerEvents: "none", display: "flex",
        }}>
          {icon}
        </div>
        <input
          id={id} name={name ?? id} ref={inputRef} type={type} inputMode={inputMode} autoComplete={autoComplete}
          placeholder={focused ? placeholder : ""} value={value} aria-invalid={ariaInvalid}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { setFocused(true); onFocus?.(); }}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{
            width: "100%", height: 56, background: WHITE,
            // hardcoded-color-allow-next-line
            border: `2px solid ${error ? ERR_RED : focused ? ORANGE : "rgba(0,0,0,0.14)"}`,
            borderRadius: 8, padding: "0 16px 0 44px", fontSize: 16,
            color: NAVY, outline: "none", fontFamily: "Inter, sans-serif",
            transition: "border-color 150ms ease", WebkitAppearance: "none",
          }}
        />
        {type === "tel" && value.replace(/\D/g, "").length === 10 && !error && (
          <div style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            // hardcoded-color-allow-next-line
            color: "#16A34A",
          }}>
            <Check size={18} strokeWidth={2.5} />
          </div>
        )}
      </div>
      {error && (
        <p role="alert" style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 12, color: ERR_RED, marginTop: 5, fontFamily: "Inter, sans-serif",
        }}>
          <AlertCircle size={12} strokeWidth={2} /> {error}
        </p>
      )}
    </div>
  );
};

/**
 * Shared form input components for medical intake questionnaires.
 * All stateless — callers manage selected values and change handlers.
 */

/** Brand token aliases used across all intake form inputs. */
const ORANGE = "var(--brand-cta)";
const NAVY = "var(--brand-navy-deep)";

/** Single-select radio button group styled with brand tokens. */
export function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map((opt) => {
        const sel = value === opt;
        return (
          <label
            key={opt}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${sel ? ORANGE : "#E5E7EB"}`,
              borderLeft: sel ? `4px solid ${ORANGE}` : `1.5px solid #E5E7EB`,
              background: sel ? "rgba(232,103,10,0.07)" : "#FAFAFA",
              transition: "all 150ms ease", userSelect: "none",
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={sel}
              onChange={() => onChange(opt)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            />
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${sel ? ORANGE : "#D0D5DD"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {sel && <div style={{ width: 10, height: 10, borderRadius: "50%", background: ORANGE }} />}
            </div>
            <span style={{ fontSize: 15, color: NAVY, fontWeight: sel ? 600 : 400 }}>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

/** Multi-select checkbox group styled with brand tokens. */
export function CheckGroup({
  options,
  values,
  onChange,
}: {
  options: readonly string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((x) => x !== opt));
    else onChange([...values, opt]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map((opt) => {
        const sel = values.includes(opt);
        return (
          <label
            key={opt}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${sel ? ORANGE : "#E5E7EB"}`,
              borderLeft: sel ? `4px solid ${ORANGE}` : `1.5px solid #E5E7EB`,
              background: sel ? "rgba(232,103,10,0.07)" : "#FAFAFA",
              transition: "all 150ms ease", userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={sel}
              onChange={() => toggle(opt)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            />
            <div style={{
              width: 20, height: 20, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${sel ? ORANGE : "#D0D5DD"}`,
              background: sel ? ORANGE : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 150ms ease, border-color 150ms ease",
            }}>
              {sel && (
                <svg viewBox="0 0 12 9" width={12} fill="none">
                  <polyline points="1,5 4,8 11,1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 15, color: NAVY, fontWeight: sel ? 600 : 400 }}>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

/** Numeric 1–10 range slider with labeled endpoints. */
export function SliderInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "var(--c-text-on-light-muted)" }}>1 — Poor</span>
        <span style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700,
          fontSize: 28, color: ORANGE,
        }}>
          {value}
        </span>
        <span style={{ fontSize: 13, color: "var(--c-text-on-light-muted)" }}>10 — Excellent</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{
          width: "100%",
          accentColor: ORANGE,
          height: 8,
          cursor: "pointer",
        }}
      />
      <p style={{ textAlign: "center", marginTop: 8, fontSize: 14, color: NAVY, fontWeight: 600 }}>
        {label}: {value}/10
      </p>
    </div>
  );
}

/** Styled native select dropdown. */
export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", height: 56, border: `1.5px solid #D0D5DD`,
        borderRadius: 8, padding: "0 16px", fontSize: 16,
        color: value ? NAVY : "var(--c-placeholder-light)",
        fontFamily: "Inter, sans-serif",
        background: "var(--bg-white)", outline: "none", cursor: "pointer",
        appearance: "none",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

import { Check, X, Minus } from "lucide-react";
import { Eyebrow } from "@/components/landing/trt/TRTProductHelpers";

const COMPARE_ROWS: {
  label: string;
  mwc: string;
  mwcType: "check" | "text";
  primary: string;
  primaryType: "x" | "partial" | "text";
  tele: string;
  teleType: "x" | "partial" | "text";
}[] = [
  {
    label: "On-Site Labs",
    mwc: "Included",       mwcType: "check",
    primary: "Separate",   primaryType: "x",
    tele: "Not available", teleType: "x",
  },
  {
    label: "Same-Day Results",
    mwc: "Same visit",   mwcType: "check",
    primary: "Days later", primaryType: "x",
    tele: "Days later",    teleType: "x",
  },
  {
    label: "Personalized Protocol",
    mwc: "In-person",    mwcType: "check",
    primary: "Sometimes",  primaryType: "partial",
    tele: "Script only",   teleType: "partial",
  },
  {
    label: "In-Person Provider",
    mwc: "Always",       mwcType: "check",
    primary: "Limited",    primaryType: "partial",
    tele: "Remote only",   teleType: "x",
  },
  {
    label: "Typical Wait Time",
    mwc: "Under 1 week",  mwcType: "text",
    primary: "3-6 weeks",   primaryType: "text",
    tele: "1-2 weeks",      teleType: "text",
  },
  {
    label: "Pricing Transparency",
    mwc: "In writing",   mwcType: "check",
    primary: "Varies",     primaryType: "partial",
    tele: "Online",        teleType: "partial",
  },
];

const CellIcon = ({ type }: { type: "check" | "x" | "partial" | "text" }) => {
  if (type === "check")   return <Check size={18} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />;
  if (type === "x")       return <X     size={18} strokeWidth={2.5} style={{ color: "var(--c-text-on-light-muted-2)", flexShrink: 0 }} />;
  if (type === "partial") return <Minus size={18} strokeWidth={2.5} style={{ color: "var(--c-text-on-light-muted-2)", flexShrink: 0 }} />;
  return null;
};

export const TRTComparisonTable = () => (
  <section style={{ background: "#fff", padding: "80px 24px" }}>
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <Eyebrow onLight>WHY MEN CHOOSE MWC</Eyebrow>
      </div>
      <h2
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(26px, 4vw, 40px)",
          fontWeight: 700,
          color: "var(--brand-navy)",
          marginBottom: 8,
          lineHeight: 1.15,
        }}
      >
        MWC vs. Primary Care vs. Telehealth
      </h2>
      <p style={{ fontSize: 15, color: "var(--c-text-on-light-muted)", marginBottom: 40, maxWidth: 600 }}>
        Most men have already tried their GP. Here's why they come to us instead.
      </p>

      <div className="compare-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              <th style={{
                textAlign: "left",
                padding: "14px 20px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--c-text-on-light-muted)",
                background: "#F8F9FB",
                borderRadius: "8px 0 0 0",
                borderBottom: "2px solid #E5E7EB",
              }}>
                Feature
              </th>
              {/* MWC — featured column */}
              <th style={{
                textAlign: "center",
                padding: "14px 16px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#fff",
                background: "var(--brand-cta)",
                borderBottom: "2px solid var(--brand-cta)",
              }}>
                MWC
              </th>
              <th style={{
                textAlign: "center",
                padding: "14px 16px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--c-text-on-light-muted)",
                background: "#F8F9FB",
                borderBottom: "2px solid #E5E7EB",
              }}>
                Primary Care
              </th>
              <th style={{
                textAlign: "center",
                padding: "14px 16px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--c-text-on-light-muted)",
                background: "#F8F9FB",
                borderRadius: "0 8px 0 0",
                borderBottom: "2px solid #E5E7EB",
              }}>
                Telehealth
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row, i) => (
              <tr
                key={row.label}
                className="compare-row"
                style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }}
              >
                <td style={{
                  padding: "14px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--brand-navy)",
                  borderBottom: "1px solid #F0F2F5",
                  whiteSpace: "nowrap",
                }}>
                  {row.label}
                </td>
                {/* MWC — orange-tinted */}
                <td style={{
                  textAlign: "center",
                  padding: "14px 16px",
                  background: "rgba(232,103,10,0.05)",
                  borderBottom: "1px solid rgba(232,103,10,0.10)",
                  borderLeft: "1px solid rgba(232,103,10,0.15)",
                  borderRight: "1px solid rgba(232,103,10,0.15)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CellIcon type={row.mwcType} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: row.mwcType === "text" ? "var(--brand-cta)" : "var(--brand-navy)" }}>
                      {row.mwc}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: "center", padding: "14px 16px", borderBottom: "1px solid #F0F2F5" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CellIcon type={row.primaryType} />
                    <span style={{ fontSize: 13, color: "var(--c-text-on-light-muted)" }}>{row.primary}</span>
                  </div>
                </td>
                <td style={{ textAlign: "center", padding: "14px 16px", borderBottom: "1px solid #F0F2F5" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CellIcon type={row.teleType} />
                    <span style={{ fontSize: 13, color: "var(--c-text-on-light-muted)" }}>{row.tele}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

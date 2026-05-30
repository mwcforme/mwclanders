/**
 * LocationContextBar — compact visit context shown on BookSchedule.
 *
 * Desktop (≥640px): always-visible single row — address, directions, visit type, phone.
 * Mobile (<640px):  collapsed pill with chevron toggle → expands to full detail.
 *
 * Uses a <style> tag + CSS classes for responsive behaviour so it doesn't
 * depend on Tailwind purging new utility classes in the build.
 */
import { useState } from "react";
import { MapPin, Phone, Navigation, Clock, ChevronDown, ChevronUp, User } from "lucide-react";
import type { Location } from "@/data/locations";
import { getMapsSearchUrl } from "@/data/locations";

interface LocationContextBarProps {
  location: Location;
}

export function LocationContextBar({ location: loc }: LocationContextBarProps) {
  const [expanded, setExpanded] = useState(false);
  const mapsUrl = getMapsSearchUrl(loc);

  const ICON  = "var(--brand-cta)";
  const DIM   = "rgba(255,255,255,0.55)";
  const ON    = "rgba(255,255,255,0.88)";
  const EDGE  = "rgba(255,255,255,0.10)";
  const BG    = "rgba(255,255,255,0.04)";

  return (
    <>
      <style>{`
        .lcb-wrap {
          border-radius: 10px;
          border: 1px solid ${EDGE};
          background: ${BG};
          font-family: Inter, sans-serif;
          margin-top: 12px;
          overflow: hidden;
        }
        /* Mobile: show toggle row, hide desktop row */
        .lcb-mobile { display: flex; }
        .lcb-desktop { display: none; }

        /* Desktop: hide toggle row, show desktop row */
        @media (min-width: 640px) {
          .lcb-mobile { display: none !important; }
          .lcb-mobile-expanded { display: none !important; }
          .lcb-desktop { display: flex !important; }
        }
      `}</style>

      <div className="lcb-wrap">

        {/* ── Mobile collapsed toggle row ── */}
        <button
          type="button"
          onClick={() => setExpanded(p => !p)}
          aria-expanded={expanded}
          className="lcb-mobile"
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 12px",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            gap: 8,
            color: ON,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, overflow: "hidden", flex: 1, minWidth: 0 }}>
            <MapPin size={13} strokeWidth={2} style={{ color: ICON, flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {loc.address}, {loc.cityStateZip}
            </span>
            <span style={{ color: DIM, flexShrink: 0 }}>·</span>
            <User size={12} strokeWidth={2} style={{ color: ICON, flexShrink: 0 }} />
            <span style={{ color: DIM, flexShrink: 0, whiteSpace: "nowrap" }}>In-person · 60 min</span>
          </span>
          {expanded
            ? <ChevronUp size={14} strokeWidth={2.5} style={{ color: DIM, flexShrink: 0 }} />
            : <ChevronDown size={14} strokeWidth={2.5} style={{ color: DIM, flexShrink: 0 }} />
          }
        </button>

        {/* ── Mobile expanded detail ── */}
        {expanded && (
          <div
            className="lcb-mobile-expanded"
            style={{
              borderTop: `1px solid ${EDGE}`,
              padding: "10px 12px",
              flexDirection: "column",
              gap: 8,
              display: "flex",
            }}
          >
            <DetailRow icon={<MapPin size={13} strokeWidth={2} />} color={ICON}>
              <span style={{ fontSize: 12, color: ON }}>{loc.address}</span>
              <span style={{ fontSize: 12, color: DIM }}>{loc.cityStateZip}</span>
            </DetailRow>
            <DetailRow icon={<Navigation size={13} strokeWidth={2} />} color={ICON}>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 700, color: ICON, textDecoration: "none" }}>
                Get directions
              </a>
              <span style={{ fontSize: 12, color: DIM }}>{loc.driveTime}</span>
            </DetailRow>
            <DetailRow icon={<Phone size={13} strokeWidth={2} />} color={ICON}>
              <a href={loc.phoneHref}
                style={{ fontSize: 12, fontWeight: 700, color: ON, textDecoration: "none" }}>
                {loc.phone}
              </a>
            </DetailRow>
            <DetailRow icon={<Clock size={13} strokeWidth={2} />} color={ICON}>
              <span style={{ fontSize: 11, color: DIM, lineHeight: 1.4 }}>{loc.hours}</span>
            </DetailRow>
          </div>
        )}

        {/* ── Desktop always-visible row ── */}
        <div
          className="lcb-desktop"
          style={{
            alignItems: "center",
            padding: "9px 14px",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={13} strokeWidth={2} style={{ color: ICON, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: ON, fontWeight: 500 }}>
              {loc.address}, {loc.cityStateZip}
            </span>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: ICON, textDecoration: "none", marginLeft: 4 }}>
              <Navigation size={11} strokeWidth={2.5} />
              Directions
            </a>
          </span>

          <Dot />

          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <User size={13} strokeWidth={2} style={{ color: ICON, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: DIM }}>In-person · 60 min · Labs on-site</span>
          </span>

          <Dot />

          <a href={loc.phoneHref} style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <Phone size={13} strokeWidth={2} style={{ color: ICON, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: ON }}>{loc.phone}</span>
          </a>
        </div>

      </div>
    </>
  );
}

function DetailRow({ icon, color, children }: { icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ color, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>{children}</span>
    </div>
  );
}

function Dot() {
  return <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.20)", flexShrink: 0, display: "inline-block" }} />;
}

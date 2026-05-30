/**
 * LocationContextBar — compact visit context shown on BookSchedule.
 *
 * Desktop (≥640px): always-visible single row — address, directions, visit type, phone.
 * Mobile (<640px):  collapsed pill with chevron toggle → expands to full detail.
 */
import { useState, useEffect } from "react";
import { MapPin, Phone, Navigation, Clock, ChevronDown, ChevronUp, User } from "lucide-react";
import type { Location } from "@/data/locations";
import { getMapsSearchUrl } from "@/data/locations";

interface LocationContextBarProps {
  location: Location;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 640 : true
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    setIsDesktop(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export function LocationContextBar({ location: loc }: LocationContextBarProps) {
  const [expanded, setExpanded] = useState(false);
  const isDesktop = useIsDesktop();
  const mapsUrl = getMapsSearchUrl(loc);

  // ── Design tokens ──────────────────────────────────────────────────────────
  const ICON   = "var(--brand-cta)";           // orange
  const BRIGHT = "rgba(255,255,255,0.92)";      // primary text
  const DIM    = "rgba(255,255,255,0.60)";      // secondary text — boosted contrast
  const EDGE   = "rgba(255,255,255,0.14)";      // border
  const BG     = "rgba(255,255,255,0.06)";      // card bg

  const wrap: React.CSSProperties = {
    borderRadius: 10,
    border: `1px solid ${EDGE}`,
    background: BG,
    fontFamily: "Inter, sans-serif",
    marginTop: 12,
    overflow: "hidden",
  };

  // ── Desktop — single always-visible row ────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={wrap}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          gap: 18,
          flexWrap: "wrap",
        }}>
          {/* Address + directions */}
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <MapPin size={14} strokeWidth={2} style={{ color: ICON, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: BRIGHT, fontWeight: 600 }}>
              {loc.address}, {loc.cityStateZip}
            </span>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: ICON, textDecoration: "none", marginLeft: 2 }}>
              <Navigation size={12} strokeWidth={2.5} />
              Directions
            </a>
          </span>

          <Dot />

          {/* Visit type */}
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <User size={14} strokeWidth={2} style={{ color: ICON, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: DIM, fontWeight: 500 }}>In-person visit · 60 min · Labs on-site</span>
          </span>

          <Dot />

          {/* Local phone */}
          <a href={loc.phoneHref} style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
            <Phone size={14} strokeWidth={2} style={{ color: ICON, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: BRIGHT }}>{loc.phone}</span>
          </a>
        </div>
      </div>
    );
  }

  // ── Mobile — collapsed toggle ──────────────────────────────────────────────
  return (
    <div style={wrap}>
      {/* Collapsed pill row */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "transparent",
          border: 0,
          cursor: "pointer",
          gap: 8,
          color: BRIGHT,
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

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${EDGE}`,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <Row icon={<MapPin size={14} strokeWidth={2} />} color={ICON}>
            <span style={{ fontSize: 13, color: BRIGHT, fontWeight: 600 }}>{loc.address}</span>
            <span style={{ fontSize: 12, color: DIM }}>{loc.cityStateZip}</span>
          </Row>
          <Row icon={<Navigation size={14} strokeWidth={2} />} color={ICON}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, fontWeight: 700, color: ICON, textDecoration: "none" }}>
              Get directions
            </a>
            <span style={{ fontSize: 12, color: DIM }}>{loc.driveTime}</span>
          </Row>
          <Row icon={<Phone size={14} strokeWidth={2} />} color={ICON}>
            <a href={loc.phoneHref}
              style={{ fontSize: 13, fontWeight: 700, color: BRIGHT, textDecoration: "none" }}>
              {loc.phone}
            </a>
          </Row>
          <Row icon={<Clock size={14} strokeWidth={2} />} color={ICON}>
            <span style={{ fontSize: 12, color: DIM, lineHeight: 1.4 }}>{loc.hours}</span>
          </Row>
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Row({ icon, color, children }: { icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ color, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>{children}</span>
    </div>
  );
}

function Dot() {
  return (
    <span style={{
      width: 3, height: 3, borderRadius: "50%",
      background: "rgba(255,255,255,0.25)",
      flexShrink: 0, display: "inline-block", alignSelf: "center",
    }} />
  );
}

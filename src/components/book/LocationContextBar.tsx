/**
 * LocationContextBar — compact visit context shown on BookSchedule.
 *
 * Desktop: single always-visible row — address, visit type, local phone, directions link.
 * Mobile:  collapsed single-line summary with chevron toggle → expands to full detail.
 *
 * No emojis. Icon-only. Maximises vertical space on mobile.
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

  const ICON_COLOR  = "var(--brand-cta)";
  const TEXT_DIM    = "rgba(255,255,255,0.55)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.88)";
  const BORDER      = "rgba(255,255,255,0.10)";
  const BG          = "rgba(255,255,255,0.04)";

  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${BORDER}`,
      background: BG,
      fontFamily: "Inter, sans-serif",
      marginTop: 12,
      overflow: "hidden",
    }}>

      {/* ── Mobile collapsed row (hidden on sm+) ── */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        aria-expanded={expanded}
        className="sm:hidden"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 12px",
          background: "transparent",
          border: 0,
          cursor: "pointer",
          gap: 8,
          color: TEXT_BRIGHT,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, overflow: "hidden" }}>
          <MapPin size={13} strokeWidth={2} style={{ color: ICON_COLOR, flexShrink: 0 }} />
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {loc.address}, {loc.cityStateZip}
          </span>
          <span style={{ color: TEXT_DIM, flexShrink: 0 }}>·</span>
          <User size={12} strokeWidth={2} style={{ color: ICON_COLOR, flexShrink: 0 }} />
          <span style={{ color: TEXT_DIM, flexShrink: 0, whiteSpace: "nowrap" }}>In-person · 60 min</span>
        </span>
        {expanded
          ? <ChevronUp size={14} strokeWidth={2.5} style={{ color: TEXT_DIM, flexShrink: 0 }} />
          : <ChevronDown size={14} strokeWidth={2.5} style={{ color: TEXT_DIM, flexShrink: 0 }} />
        }
      </button>

      {/* ── Mobile expanded detail ── */}
      {expanded && (
        <div className="sm:hidden" style={{
          borderTop: `1px solid ${BORDER}`,
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <Row icon={<MapPin size={13} strokeWidth={2} />} color={ICON_COLOR}>
            <span style={{ fontSize: 12, color: TEXT_BRIGHT }}>{loc.address}</span>
            <span style={{ fontSize: 12, color: TEXT_DIM }}>{loc.cityStateZip}</span>
          </Row>
          <Row icon={<Navigation size={13} strokeWidth={2} />} color={ICON_COLOR}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 700, color: ICON_COLOR, textDecoration: "none" }}>
              Get directions
            </a>
            <span style={{ fontSize: 12, color: TEXT_DIM }}>{loc.driveTime}</span>
          </Row>
          <Row icon={<Phone size={13} strokeWidth={2} />} color={ICON_COLOR}>
            <a href={loc.phoneHref}
              style={{ fontSize: 12, fontWeight: 700, color: TEXT_BRIGHT, textDecoration: "none" }}>
              {loc.phone}
            </a>
          </Row>
          <Row icon={<Clock size={13} strokeWidth={2} />} color={ICON_COLOR}>
            <span style={{ fontSize: 11, color: TEXT_DIM, lineHeight: 1.4 }}>{loc.hours}</span>
          </Row>
        </div>
      )}

      {/* ── Desktop always-visible row (hidden on mobile) ── */}
      <div className="hidden sm:flex" style={{
        alignItems: "center",
        padding: "9px 14px",
        gap: 20,
        flexWrap: "wrap",
      }}>
        {/* Address + directions */}
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={13} strokeWidth={2} style={{ color: ICON_COLOR, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: TEXT_BRIGHT, fontWeight: 500 }}>
            {loc.address}, {loc.cityStateZip}
          </span>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: ICON_COLOR, textDecoration: "none", marginLeft: 4 }}>
            <Navigation size={11} strokeWidth={2.5} />
            Directions
          </a>
        </span>

        <Dot />

        {/* Visit type */}
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <User size={13} strokeWidth={2} style={{ color: ICON_COLOR, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: TEXT_DIM }}>In-person visit · 60 min · Labs on-site</span>
        </span>

        <Dot />

        {/* Local phone */}
        <a href={loc.phoneHref} style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
          <Phone size={13} strokeWidth={2} style={{ color: ICON_COLOR, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_BRIGHT }}>{loc.phone}</span>
        </a>
      </div>

    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function Row({ icon, color, children }: { icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ color, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>{children}</span>
    </div>
  );
}

function Dot() {
  return <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.20)", flexShrink: 0 }} />;
}

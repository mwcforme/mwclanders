import { Copy, ExternalLink } from "lucide-react";
import { type LandingPageEntry } from "@/data/landingPages";

const COLORS = {
  orange: "var(--brand-cta)",
  cream: "var(--brand-cream)",
};

const STATUS_STYLES: Record<LandingPageEntry["status"], { bg: string; fg: string; label: string }> = {
  // hardcoded-color-allow-next-line
  live: { bg: "rgba(34,197,94,0.15)", fg: "#4ADE80", label: "LIVE" },
  // hardcoded-color-allow-next-line
  draft: { bg: "rgba(245,158,11,0.15)", fg: "#FBBF24", label: "DRAFT" },
  // hardcoded-color-allow-next-line
  scaffold: { bg: "rgba(148,163,184,0.15)", fg: "#94A3B8", label: "SCAFFOLD" },
};

function buildUtmUrl(slug: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}${slug}?utm_source=meta&utm_medium=paid_social&utm_campaign=test&utm_content=${encodeURIComponent(slug.replace(/^\//, ""))}`;
}

interface Props {
  pages: LandingPageEntry[];
  onCopy: (text: string, label: string) => void;
}

export function LpCards({ pages, onCopy }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
      {pages.map((lp) => {
        const utm = buildUtmUrl(lp.slug);
        const styles = STATUS_STYLES[lp.status];
        return (
          <div
            key={lp.slug}
            className="rounded-xl p-5"
            style={{
              // hardcoded-color-allow-next-line
              background: "rgba(255,255,255,0.04)",
              // hardcoded-color-allow-next-line
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="uppercase font-bold" style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, letterSpacing: "0.04em" }}>
                {lp.name}
              </h3>
              <span className="uppercase font-bold" style={{ background: styles.bg, color: styles.fg, fontSize: 10, letterSpacing: "0.10em", padding: "4px 8px", borderRadius: 4 }}>
                {styles.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-4" style={{ color: "rgba(245,240,235,0.70)" }}>
              <div>Slug</div><div className="font-mono" style={{ color: COLORS.cream }}>{lp.slug}</div>
              <div>Service</div><div className="uppercase" style={{ color: COLORS.cream }}>{lp.service}</div>
              <div>Primary CTA</div><div className="font-mono" style={{ color: COLORS.cream }}>{lp.primaryCta}</div>
              <div>Updated</div><div style={{ color: COLORS.cream }}>{lp.updatedAt}</div>
            </div>
            {lp.notes && <p className="text-xs mb-4" style={{ color: "rgba(245,240,235,0.55)" }}>{lp.notes}</p>}
            <div className="flex flex-wrap gap-2">
              <a
                href={lp.slug} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded text-xs uppercase font-bold"
                style={{ background: COLORS.orange, color: "var(--c-text-on-dark)", padding: "8px 12px", letterSpacing: "0.08em" }}
              >
                Open <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={() => onCopy(utm, "UTM URL")}
                className="inline-flex items-center gap-1.5 rounded text-xs uppercase font-bold"
                style={{ background: "transparent", color: COLORS.cream, border: "1px solid rgba(255,255,255,0.20)", padding: "8px 12px", letterSpacing: "0.08em" }}
              >
                <Copy size={12} /> Copy UTM URL
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

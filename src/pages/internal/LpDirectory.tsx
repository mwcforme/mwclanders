import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, AlertTriangle, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LANDING_PAGES,
  BOOKING_STEPS,
  COMPLIANCE_PAGES,
  type LandingPageEntry,
} from "@/data/landingPages";
import { ATTRIBUTION_KEYS, getAttribution } from "@/lib/attribution";

type Health = "ok" | "fail" | "pending";

const COLORS = {
  // hardcoded-color-allow-next-line
  navyDeep: "#000814",
  navy: "var(--brand-navy-deep)",
  cream: "var(--brand-cream)",
  orange: "var(--brand-cta)",
  // hardcoded-color-allow-next-line
  green: "#22C55E",
  // hardcoded-color-allow-next-line
  red: "#EF4444",
  // hardcoded-color-allow-next-line
  amber: "#F59E0B",
};

const STATUS_STYLES: Record<LandingPageEntry["status"], { bg: string; fg: string; label: string }> = {
  // hardcoded-color-allow-next-line
  live: { bg: "rgba(34,197,94,0.15)", fg: "#4ADE80", label: "LIVE" },
  // hardcoded-color-allow-next-line
  draft: { bg: "rgba(245,158,11,0.15)", fg: "#FBBF24", label: "DRAFT" },
  // hardcoded-color-allow-next-line
  scaffold: { bg: "rgba(148,163,184,0.15)", fg: "#94A3B8", label: "SCAFFOLD" },
};

const buildUtmUrl = (slug: string) => {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}${slug}?utm_source=meta&utm_medium=paid_social&utm_campaign=test&utm_content=${encodeURIComponent(slug.replace(/^\//, ""))}`;
};

const Dot = ({ state }: { state: Health }) => {
  const color = state === "ok" ? COLORS.green : state === "fail" ? COLORS.red : COLORS.amber;
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: 9999,
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="uppercase font-bold mb-5"
    style={{
      fontFamily: "Oswald, sans-serif",
      letterSpacing: "0.08em",
      fontSize: 22,
      color: COLORS.cream,
    }}
  >
    {children}
  </h2>
);

const LpDirectory = () => {
  const { toast } = useToast();
  const [dataLayerOk, setDataLayerOk] = useState<Health>("pending");
  const [pixelOk, setPixelOk] = useState<Health>("pending");
  const [supabaseOk, setSupabaseOk] = useState<Health>("pending");
  const [ghlProxyOk, setGhlProxyOk] = useState<Health>("pending");

  useEffect(() => {
    const w = window as unknown as { dataLayer?: unknown[]; fbq?: unknown };
    setDataLayerOk(Array.isArray(w.dataLayer) ? "ok" : "fail");
    setPixelOk(typeof w.fbq === "function" ? "ok" : "fail");

    // Cheap supabase reachability ping (no table required).
    supabase.auth
      .getSession()
      .then(({ error }) => setSupabaseOk(error ? "fail" : "ok"))
      .catch(() => setSupabaseOk("fail"));

    // ghl-proxy reachability via OPTIONS (no auth, no body).
    const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ghl-proxy`;
    fetch(url, { method: "OPTIONS" })
      .then((r) => setGhlProxyOk(r.ok || r.status === 204 ? "ok" : "fail"))
      .catch(() => setGhlProxyOk("fail"));
  }, []);

  const copy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      toast({ title: `Copied ${label}`, description: text });
    });
  };

  const buildTime = new Date().toISOString();
  const liveCount = LANDING_PAGES.filter((p) => p.status === "live").length;

  return (
    <>
      <SEO
        title="LP Directory (Internal) | MWC"
        description="Internal landing-page directory."
      />
      <div
        className="min-h-screen"
        style={{
          background: COLORS.navyDeep,
          color: COLORS.cream,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
          {/* Header */}
          <div
            className="rounded-xl p-6 mb-10 flex items-start gap-4"
            style={{
              // hardcoded-color-allow-next-line
              background: "rgba(232,103,10,0.08)",
              // hardcoded-color-allow-next-line
              border: `1px solid rgba(232,103,10,0.30)`,
            }}
          >
            <AlertTriangle className="flex-shrink-0 mt-0.5" color={COLORS.orange} />
            <div>
              <h1
                className="uppercase font-bold"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 32,
                  letterSpacing: "0.04em",
                  lineHeight: 1.1,
                }}
              >
                Landing Page Directory
              </h1>
              <p className="mt-2" style={{ color: "rgba(245,240,235,0.75)", fontSize: 14 }}>
                Internal QA index. Do not share. <strong>Noindex.</strong> {liveCount} live LP
                {liveCount === 1 ? "" : "s"}. Loaded {buildTime}.
              </p>
            </div>
          </div>

          {/* Live LPs */}
          <SectionTitle>Live landing pages</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {LANDING_PAGES.map((lp) => {
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
                    <h3
                      className="uppercase font-bold"
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        fontSize: 18,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {lp.name}
                    </h3>
                    <span
                      className="uppercase font-bold"
                      style={{
                        background: styles.bg,
                        color: styles.fg,
                        fontSize: 10,
                        letterSpacing: "0.10em",
                        padding: "4px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {styles.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-4" style={{ color: "rgba(245,240,235,0.70)" }}>
                    <div>Slug</div><div className="font-mono" style={{ color: COLORS.cream }}>{lp.slug}</div>
                    <div>Service</div><div className="uppercase" style={{ color: COLORS.cream }}>{lp.service}</div>
                    <div>Primary CTA</div><div className="font-mono" style={{ color: COLORS.cream }}>{lp.primaryCta}</div>
                    <div>Updated</div><div style={{ color: COLORS.cream }}>{lp.updatedAt}</div>
                  </div>

                  {lp.notes && (
                    <p className="text-xs mb-4" style={{ color: "rgba(245,240,235,0.55)" }}>
                      {lp.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={lp.slug}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded text-xs uppercase font-bold"
                      style={{
                        background: COLORS.orange,
                        color: "var(--c-text-on-dark)",
                        padding: "8px 12px",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Open <ExternalLink size={12} />
                    </a>
                    <button
                      type="button"
                      onClick={() => copy(utm, "UTM URL")}
                      className="inline-flex items-center gap-1.5 rounded text-xs uppercase font-bold"
                      style={{
                        background: "transparent",
                        color: COLORS.cream,
                        // hardcoded-color-allow-next-line
                        border: "1px solid rgba(255,255,255,0.20)",
                        padding: "8px 12px",
                        letterSpacing: "0.08em",
                      }}
                    >
                      <Copy size={12} /> Copy UTM URL
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Booking funnel */}
          <SectionTitle>Booking funnel routes</SectionTitle>
          <div
            className="rounded-xl overflow-hidden mb-12"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>STEP</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>SLUG</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>DESCRIPTION</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {BOOKING_STEPS.map((s, i) => (
                  <tr key={s.slug} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                    <td className="px-4 py-3 font-semibold">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "rgba(245,240,235,0.75)" }}>{s.slug}</td>
                    <td className="px-4 py-3" style={{ color: "rgba(245,240,235,0.70)" }}>{s.description}</td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={s.slug}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs uppercase font-bold"
                        style={{ color: COLORS.orange, letterSpacing: "0.08em" }}
                      >
                        Open <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Compliance */}
          <SectionTitle>Compliance pages</SectionTitle>
          <div
            className="rounded-xl overflow-hidden mb-12"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>PAGE</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>SLUG</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>STATUS</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_PAGES.map((p, i) => (
                  <tr key={p.slug} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "rgba(245,240,235,0.75)" }}>{p.slug}</td>
                    <td className="px-4 py-3">
                      {p.exists ? (
                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: COLORS.green }}>
                          <CheckCircle2 size={14} /> Exists
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: p.required ? COLORS.red : COLORS.amber }}>
                          <XCircle size={14} /> {p.required ? "Missing (required)" : "Missing"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "rgba(245,240,235,0.65)" }}>{p.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Integration health */}
          <SectionTitle>Tracking & integration health</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { label: "GA4 dataLayer", state: dataLayerOk },
              { label: "Meta Pixel (fbq)", state: pixelOk },
              { label: "Supabase client", state: supabaseOk },
              { label: "GHL proxy", state: ghlProxyOk },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl p-4 flex items-center justify-between"
                style={{
                  // hardcoded-color-allow-next-line
                  background: "rgba(255,255,255,0.04)",
                  // hardcoded-color-allow-next-line
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div>
                  <div className="text-xs uppercase mb-1" style={{ color: "rgba(245,240,235,0.55)", letterSpacing: "0.08em" }}>
                    Check
                  </div>
                  <div className="font-semibold">{c.label}</div>
                </div>
                <Dot state={c.state} />
              </div>
            ))}
          </div>

          {/* Attribution capture */}
          <SectionTitle>Attribution capture (cookies + URL)</SectionTitle>
          <p className="text-xs mb-4" style={{ color: "rgba(245,240,235,0.55)" }}>
            Hidden fields auto-populated from URL params on first visit and persisted to a 90-day first-party cookie.
            Override the visible First/Last Name on submit when present.
            Try: <span className="font-mono">/?utm_source=meta&utm_campaign=test&gclid=ABC123&first_name=John</span>
          </p>
          <div
            className="rounded-xl overflow-hidden mb-12"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>FIELD</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>VALUE</th>
                </tr>
              </thead>
              <tbody>
                {ATTRIBUTION_KEYS.map((k, i) => {
                  const v = getAttribution()[k];
                  return (
                    <tr key={k} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "rgba(245,240,235,0.75)" }}>{k}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: v ? COLORS.cream : "rgba(245,240,235,0.35)" }}>
                        {v ?? "(empty)"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-center text-xs pt-8" style={{ color: "rgba(245,240,235,0.45)" }}>
            <Link to="/" className="inline-flex items-center gap-1" style={{ color: COLORS.orange }}><ChevronLeft size={14} /> Back to live site</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LpDirectory;

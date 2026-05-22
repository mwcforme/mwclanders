import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LANDING_PAGES, BOOKING_STEPS, COMPLIANCE_PAGES } from "@/data/landingPages";
import { ATTRIBUTION_KEYS, getAttribution } from "@/lib/attribution";
import { HealthChecks, type Health } from "@/components/internal/HealthChecks";
import { LpCards } from "@/components/internal/LpCards";

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="uppercase font-bold mb-5" style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.08em", fontSize: 22, color: COLORS.cream }}>
      {children}
    </h2>
  );
}

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
    supabase.auth.getSession()
      .then(({ error }) => setSupabaseOk(error ? "fail" : "ok"))
      .catch(() => setSupabaseOk("fail"));
    const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ghl-proxy`;
    fetch(url, { method: "OPTIONS" })
      .then((r) => setGhlProxyOk(r.ok || r.status === 204 ? "ok" : "fail"))
      .catch(() => setGhlProxyOk("fail"));
  }, []);

  const copy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text).then(() => toast({ title: `Copied ${label}`, description: text }));
  };

  const buildTime = new Date().toISOString();
  const liveCount = LANDING_PAGES.filter((p) => p.status === "live").length;

  return (
    <>
      <SEO title="LP Directory (Internal) | MWC" description="Internal landing-page directory." />
      <div className="min-h-screen" style={{ background: COLORS.navyDeep, color: COLORS.cream, fontFamily: "Inter, sans-serif" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">

          {/* Header */}
          <div className="rounded-xl p-6 mb-10 flex items-start gap-4" style={{ background: "rgba(232,103,10,0.08)", border: "1px solid rgba(232,103,10,0.30)" }}>
            <AlertTriangle className="flex-shrink-0 mt-0.5" color={COLORS.orange} />
            <div>
              <h1 className="uppercase font-bold" style={{ fontFamily: "Oswald, sans-serif", fontSize: 32, letterSpacing: "0.04em", lineHeight: 1.1 }}>
                Landing Page Directory
              </h1>
              <p className="mt-2" style={{ color: "rgba(245,240,235,0.75)", fontSize: 14 }}>
                Internal QA index. Do not share. <strong>Noindex.</strong> {liveCount} live LP{liveCount === 1 ? "" : "s"}. Loaded {buildTime}.
              </p>
            </div>
          </div>

          {/* Live LPs */}
          <SectionTitle>Live landing pages</SectionTitle>
          <LpCards pages={LANDING_PAGES} onCopy={copy} />

          {/* Booking funnel */}
          <SectionTitle>Booking funnel routes</SectionTitle>
          <div className="rounded-xl overflow-hidden mb-12" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  {["STEP", "SLUG", "DESCRIPTION", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOOKING_STEPS.map((s, i) => (
                  <tr key={s.slug} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                    <td className="px-4 py-3 font-semibold">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "rgba(245,240,235,0.75)" }}>{s.slug}</td>
                    <td className="px-4 py-3" style={{ color: "rgba(245,240,235,0.70)" }}>{s.description}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={s.slug} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs uppercase font-bold" style={{ color: COLORS.orange, letterSpacing: "0.08em" }}>
                        Open <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Compliance */}
          <SectionTitle>Compliance pages</SectionTitle>
          <div className="rounded-xl overflow-hidden mb-12" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  {["PAGE", "SLUG", "STATUS", "NOTES"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_PAGES.map((p, i) => (
                  <tr key={p.slug} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "rgba(245,240,235,0.75)" }}>{p.slug}</td>
                    <td className="px-4 py-3">
                      {p.exists ? (
                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: COLORS.green }}><CheckCircle2 size={14} /> Exists</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: p.required ? COLORS.red : COLORS.amber }}><XCircle size={14} /> {p.required ? "Missing (required)" : "Missing"}</span>
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
          <HealthChecks checks={[
            { label: "GA4 dataLayer", state: dataLayerOk },
            { label: "Meta Pixel (fbq)", state: pixelOk },
            { label: "Supabase client", state: supabaseOk },
            { label: "GHL proxy", state: ghlProxyOk },
          ]} />

          {/* Attribution capture */}
          <SectionTitle>Attribution capture (cookies + URL)</SectionTitle>
          <p className="text-xs mb-4" style={{ color: "rgba(245,240,235,0.55)" }}>
            Hidden fields auto-populated from URL params on first visit and persisted to a 90-day first-party cookie.
            Try: <span className="font-mono">/?utm_source=meta&utm_campaign=test&gclid=ABC123&first_name=John</span>
          </p>
          <div className="rounded-xl overflow-hidden mb-12" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  {["FIELD", "VALUE"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "rgba(245,240,235,0.60)", fontSize: 11, letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ATTRIBUTION_KEYS.map((k, i) => {
                  const v = getAttribution()[k];
                  return (
                    <tr key={k} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "rgba(245,240,235,0.75)" }}>{k}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: v ? COLORS.cream : "rgba(245,240,235,0.35)" }}>{v ?? "(empty)"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-center text-xs pt-8" style={{ color: "rgba(245,240,235,0.50)" }}>
            <Link to="/" className="inline-flex items-center gap-1" style={{ color: COLORS.orange }}>
              <ChevronLeft size={14} /> Back to live site
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LpDirectory;

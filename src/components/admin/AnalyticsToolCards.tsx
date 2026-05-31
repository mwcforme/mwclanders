/**
 * AnalyticsToolCards — external analytics platform link grid.
 */
import { BarChart3, ExternalLink, TrendingUp, MousePointerClick } from "lucide-react";

const ANALYTICS_TOOLS = [
  {
    name: "Google Analytics 4",
    desc: "View sessions, conversions, traffic sources, and user journeys",
    url: "https://analytics.google.com",
    Icon: BarChart3,
    badge: "GA4",
  },
  {
    name: "Microsoft Clarity",
    desc: "Heatmaps, session recordings, and rage-click analysis",
    url: "https://clarity.microsoft.com",
    Icon: MousePointerClick,
    badge: "Clarity",
  },
  {
    name: "GHL Reporting",
    desc: "CRM pipeline, opportunity stages, and appointment metrics",
    url: "https://app.gohighlevel.com/reporting",
    Icon: TrendingUp,
    badge: "GHL",
  },
] as const;

export const AnalyticsToolCards = () => (
  <div className="mb-6">
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
      Analytics Platforms
    </h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {ANALYTICS_TOOLS.map((tool) => {
        const Icon = tool.Icon;
        return (
          <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
            className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#070B1F] p-5 transition-colors hover:border-white/20 hover:bg-white/5 group print:border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={18} strokeWidth={1.75} className="text-white/60 group-hover:text-white/80" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/50 bg-white/8 px-2 py-0.5 rounded">
                  {tool.badge}
                </span>
              </div>
              <ExternalLink size={14} strokeWidth={1.75} className="text-white/50 group-hover:text-white/70" />
            </div>
            <div>
              <div className="font-semibold text-white">{tool.name}</div>
              <div className="mt-1 text-xs text-white/50 leading-relaxed">{tool.desc}</div>
            </div>
          </a>
        );
      })}
    </div>
  </div>
);

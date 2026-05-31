import { memo } from "react";
import { AlertTriangle, BarChart3, Users, Database, Code2, ShieldCheck } from "lucide-react";

const TOOLS = [
  {
    name: "Sentry",
    desc: "Error monitoring · Crashes & exceptions",
    url: "https://sentry.io",
    Icon: AlertTriangle,
  },
  {
    name: "Google Analytics 4",
    desc: "Traffic · Conversions · Funnel analysis",
    url: "https://analytics.google.com",
    Icon: BarChart3,
  },
  {
    name: "GHL (GoHighLevel)",
    desc: "CRM · Contacts · Appointments",
    url: "https://app.gohighlevel.com",
    Icon: Users,
  },
  {
    name: "Supabase",
    desc: "Database · Edge Functions · Auth",
    url: "https://supabase.com/dashboard",
    Icon: Database,
  },
  {
    name: "GitHub",
    desc: "Source code · mwcforme/mwclanders",
    url: "https://github.com/mwcforme/mwclanders",
    Icon: Code2,
  },
  {
    name: "LegitScript",
    desc: "Certification verification",
    url: "https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com",
    Icon: ShieldCheck,
  },
] as const;

type Tool = (typeof TOOLS)[number];

function ToolCard({ name, desc, url, Icon }: Tool) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 rounded-xl border border-white/8 bg-[#070B1F] p-5 transition-colors hover:border-white/20 hover:bg-white/5 group"
    >
      <Icon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-white/60 group-hover:text-white/80" />
      <div className="min-w-0">
        <div className="font-semibold text-white text-sm">{name}</div>
        <div className="mt-0.5 text-xs text-white/50 leading-relaxed">{desc}</div>
      </div>
      <span className="ml-auto shrink-0 text-xs text-white/55 group-hover:text-white/80 transition-colors">Open →</span>
    </a>
  );
}

export const ToolsGrid = memo(function ToolsGrid() {
  return (
    <div className="mb-2">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50">External Tools</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.name} {...tool} />
        ))}
      </div>
    </div>
  );
});

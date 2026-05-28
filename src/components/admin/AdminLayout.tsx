import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";

const NAV: ReadonlyArray<{ to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }> = [
  { to: "/admin/overview", label: "Overview",  icon: LayoutDashboard, end: true },
  { to: "/admin/leads",    label: "Leads",      icon: Users },
  { to: "/admin/events",   label: "Events",     icon: Activity },
  { to: "/admin/sync",     label: "Sync",       icon: RefreshCw },
  { to: "/admin/analytics",label: "Analytics",  icon: BarChart3 },
] as const;

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Admin chrome. Persistent sidebar + topbar.
 * Deliberately does NOT use the marketing site's nav/footer.
 * Dark navy aesthetic so admins always know they're in the back-office.
 * Print-safe: sidebar hides, backgrounds become white, text becomes black.
 */
export function AdminLayout({ title, children }: Props) {
  const nav = useNavigate();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) setEmail(session?.user.email ?? "");
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    nav("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--brand-navy-deep)] text-white print:bg-white print:text-black">
      <div className="flex min-h-screen">
        {/* Sidebar — hidden on print */}
        {/* hardcoded-color-allow-next-line */}
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#070B1F] md:flex md:flex-col print:hidden">
          <div className="flex h-14 items-center border-b border-white/10 px-5">
            <span
              className="font-bold tracking-wide"
              style={{ fontFamily: "Oswald, Inter, sans-serif" }}
            >
              MWC ADMIN
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-l-2 border-[var(--brand-cta)] bg-[var(--brand-cta)] pl-[10px] font-bold text-white"
                      : "border-l-2 border-transparent text-white/70 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* hardcoded-color-allow-next-line */}
          <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#070B1F] px-5 print:border-gray-300 print:bg-white print:text-black">
            <h1
              className="text-lg font-semibold tracking-wide print:text-black"
              style={{ fontFamily: "Oswald, Inter, sans-serif" }}
            >
              {title}
            </h1>
            <div className="flex items-center gap-4 print:hidden">
              <div className="text-xs text-white/60">{email}</div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-5 md:p-7 print:p-4 print:text-black">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

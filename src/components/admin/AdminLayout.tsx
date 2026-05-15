import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  Activity,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { EnvSwitcher } from "./EnvSwitcher";

const NAV = [
  { to: "/admin/overview", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/events", label: "Events", icon: Activity },
  { to: "/admin/sync", label: "Sync", icon: RefreshCw },
];

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Admin chrome. Persistent sidebar + topbar.
 * Deliberately does NOT use the marketing site's nav/footer.
 * Dark navy aesthetic so admins always know they're in the back-office.
 */
export function AdminLayout({ title, children }: Props) {
  const nav = useNavigate();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user.email ?? "");
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    nav("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B1029] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#070B1F] md:flex md:flex-col">
          <div className="flex h-14 items-center border-b border-white/10 px-5">
            <span className="font-bold tracking-wide" style={{ fontFamily: "Oswald, Inter, sans-serif" }}>
              MWC ADMIN
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV.map((n) => {
              const Icon = n.icon;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#E8670A] text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={16} />
                  {n.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-3">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#070B1F] px-5">
            <h1 className="text-lg font-semibold tracking-wide" style={{ fontFamily: "Oswald, Inter, sans-serif" }}>
              {title}
            </h1>
            <div className="flex items-center gap-4">
              <EnvSwitcher />
              <div className="text-xs text-white/60">{email}</div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-5 md:p-7">{children}</main>
        </div>
      </div>
    </div>
  );
}

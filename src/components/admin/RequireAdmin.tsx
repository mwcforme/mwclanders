/**
 * RequireAdmin — client-side UX gate for /admin/* routes.
 * Checks sessionStorage for the shared password session.
 * No Supabase auth dependency — simplified from OAuth flow.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminUnlocked } from "@/lib/admin/adminAuth";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: Props) {
  const nav = useNavigate();

  useEffect(() => {
    if (!isAdminUnlocked()) {
      nav("/admin", { replace: true });
    }
  }, [nav]);

  if (!isAdminUnlocked()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-navy-deep)] text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

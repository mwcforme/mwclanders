import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

/**
 * Route guard for /admin/*.
 * onAuthStateChange fires immediately with the current session, so a single
 * subscription is enough — no need to also call getSession() (which raced
 * setState and caused a brief loader flash on sign-out).
 *
 * NOTE: this is a client-side gate for UX. The DB-side gate
 * (current_user_is_admin + RLS policies) is what actually enforces access.
 */
export function RequireAdmin({ children }: Props) {
  const nav = useNavigate();
  const [state, setState] = useState<"loading" | "ok">("loading");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        nav("/admin", { replace: true });
        return;
      }
      if (!isAdminEmail(session.user.email)) {
        nav("/admin?error=forbidden", { replace: true });
        return;
      }
      setState("ok");
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1029] text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}

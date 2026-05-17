import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in as an admin, skip the login screen.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && isAdminEmail(session.user.email)) {
        nav("/admin/overview", { replace: true });
      }
    });
  }, [nav]);

  // Show forbidden message when redirected back from RequireAdmin.
  useEffect(() => {
    if (params.get("error") === "forbidden") {
      setError("This Google account is not on the admin allowlist.");
    }
  }, [params]);

  const signInWithGoogle = async () => {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin/overview`,
    });
    if (result.error) {
      setBusy(false);
      setError(result.error.message ?? "Sign in failed.");
      return;
    }
    if (result.redirected) return; // browser will redirect
    // Tokens received in-place; auth listener will route us.
  };

  return (
    // hardcoded-color-allow-next-line
    <div className="flex min-h-screen items-center justify-center bg-[#0B1029] px-4 text-white">
      // hardcoded-color-allow-next-line
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#070B1F] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div
            className="text-2xl font-bold tracking-wide"
            style={{ fontFamily: "Oswald, Inter, sans-serif" }}
          >
            MWC ADMIN
          </div>
          <p className="mt-1 text-sm text-white/60">Internal operations console</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={busy}
          // hardcoded-color-allow-next-line
          className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-white px-4 text-sm font-semibold text-[#0B1029] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path
                // hardcoded-color-allow-next-line
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                // hardcoded-color-allow-next-line
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                // hardcoded-color-allow-next-line
                fill="#FBBC05"
                d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.04l3.007-2.333z"
              />
              <path
                // hardcoded-color-allow-next-line
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961l3.007 2.332C4.672 5.166 6.656 3.58 9 3.58z"
              />
            </svg>
          )}
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-xs text-white/40">
          Access restricted to authorized staff.
        </p>
      </div>
    </div>
  );
}

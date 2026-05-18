import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { Loader2 } from "lucide-react";

const TEMP_BYPASS_KEY = "mwc_admin_bypass_v1";
const TEMP_PASSWORD = "1Menshealth";

export default function AdminLogin() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bypassPw, setBypassPw] = useState("");
  const [showBypass, setShowBypass] = useState(false);

  // Check bypass session flag or real Supabase session.
  useEffect(() => {
    if (sessionStorage.getItem(TEMP_BYPASS_KEY) === "ok") {
      nav("/admin/overview", { replace: true });
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && isAdminEmail(session.user.email)) {
        nav("/admin/overview", { replace: true });
      }
    });
  }, [nav]);

  const handleBypassLogin = () => {
    if (bypassPw === TEMP_PASSWORD) {
      sessionStorage.setItem(TEMP_BYPASS_KEY, "ok");
      nav("/admin/overview", { replace: true });
    } else {
      setError("Incorrect password.");
    }
  };

  // Show forbidden message when redirected back from RequireAdmin.
  useEffect(() => {
    if (params.get("error") === "forbidden") {
      setError("This Google account is not on the admin allowlist.");
    }
  }, [params]);

  const signInWithGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/overview`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        setBusy(false);
        setError(`Auth error: ${error.message ?? "Sign in failed. Check Supabase Google OAuth config."}`);
      }
    } catch (err) {
      setBusy(false);
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0B1029] px-4 text-white"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1029" }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#070B1F] p-8 shadow-2xl" style={{ width: "100%", maxWidth: 400 }}>
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
          className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-white px-4 text-sm font-semibold text-[#0B1029] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.04l3.007-2.333z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961l3.007 2.332C4.672 5.166 6.656 3.58 9 3.58z"
              />
            </svg>
          )}
          Sign in with Google
        </button>

        {/* Shared password bypass — temporary while OAuth is being configured */}
        <div className="mt-5">
          {!showBypass ? (
            <button
              type="button"
              onClick={() => setShowBypass(true)}
              className="w-full text-xs text-white/30 hover:text-white/50 transition-colors py-2"
            >
              Use shared access code
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Access code"
                value={bypassPw}
                onChange={(e) => setBypassPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBypassLogin()}
                className="flex-1 h-10 rounded-md border border-white/10 bg-white/05 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500/60"
                style={{ background: "rgba(255,255,255,0.05)" }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleBypassLogin}
                className="h-10 px-4 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-500 transition-colors"
              >
                Go
              </button>
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-white/30">
          Access restricted to authorized staff.
        </p>
      </div>
    </div>
  );
}

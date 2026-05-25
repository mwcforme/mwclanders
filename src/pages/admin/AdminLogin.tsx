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

  // Check bypass flag or real session.
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

  // Show forbidden message when redirected back from RequireAdmin.
  useEffect(() => {
    if (params.get("error") === "forbidden") {
      setError("This account is not on the admin allowlist.");
    }
  }, [params]);

  const handleBypassLogin = () => {
    if (bypassPw === TEMP_PASSWORD) {
      sessionStorage.setItem(TEMP_BYPASS_KEY, "ok");
      nav("/admin/overview", { replace: true });
    } else {
      setError("Incorrect access code.");
    }
  };

  const signInWithLovable = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("lovable", {
        redirect_uri: `${window.location.origin}/admin/overview`,
      });
      if (result.error) {
        setBusy(false);
        setError(`Sign in failed: ${result.error.message ?? "Unknown error"}`);
      }
      // If redirected, browser handles it — no further action needed
    } catch (err) {
      setBusy(false);
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1029", padding: "16px" }}
    >
      <div style={{ width: "100%", maxWidth: 400, background: "#070B1F", borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", padding: "32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.50)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 24, color: "#FFFFFF", letterSpacing: "0.08em", marginBottom: 4 }}>
            MWC ADMIN
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", fontFamily: "Inter, sans-serif" }}>
            Internal operations console
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 16, borderRadius: 8, border: "1px solid rgba(220,38,38,0.40)", background: "rgba(220,38,38,0.10)", padding: "10px 14px", fontSize: 13, color: "#FCA5A5", fontFamily: "Inter, sans-serif" }}>
            {error}
          </div>
        )}

        {/* Lovable Sign In button */}
        <button
          type="button"
          onClick={signInWithLovable}
          disabled={busy}
          style={{
            width: "100%", height: 48, borderRadius: 10,
            background: busy ? "rgba(255,255,255,0.70)" : "#FFFFFF",
            color: "#0B1029", border: "none",
            fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15,
            cursor: busy ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "opacity 150ms ease",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? (
            <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />
          ) : (
            /* Lovable logo mark */
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
              <rect width="32" height="32" rx="8" fill="#0B1029" />
              <path d="M16 6 L26 14 L16 22 L6 14 Z" fill="#E8670A" />
            </svg>
          )}
          {busy ? "Signing in…" : "Sign in with Lovable"}
        </button>

        {/* Shared password bypass */}
        <div style={{ marginTop: 20 }}>
          {!showBypass ? (
            <button
              type="button"
              onClick={() => setShowBypass(true)}
              style={{ width: "100%", background: "none", border: "none", color: "rgba(255,255,255,0.30)", fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "8px 0", transition: "color 150ms" }}
            >
              Use shared access code
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="password"
                placeholder="Access code"
                value={bypassPw}
                onChange={(e) => setBypassPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBypassLogin()}
                autoFocus
                style={{
                  flex: 1, height: 44, borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.05)", color: "#FFFFFF",
                  fontSize: 16, fontFamily: "Inter, sans-serif", padding: "0 12px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={handleBypassLogin}
                style={{ height: 44, padding: "0 16px", borderRadius: 8, background: "var(--brand-cta)", color: "#FFF", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Go
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.50)", fontFamily: "Inter, sans-serif" }}>
          Access restricted to authorized staff only.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * AdminLogin — simple shared-password gate for internal operations console.
 * No OAuth, no Supabase auth. Session stored in sessionStorage only.
 * Password is intentionally not secret-managed — this is a UX gate, not
 * a security boundary. RLS policies on the DB are the real gate.
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { isAdminUnlocked, setAdminUnlocked } from "@/lib/admin/adminAuth";

// NOTE: Admin password is intentionally not secret-managed in this version.
// RLS policies on the DB are the real security boundary.
// See audit/WAIVERS.md for the SSO remediation plan.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "1Menshealth";

// isAdminUnlocked and setAdminUnlocked are now exported from @/lib/admin/adminAuth

export default function AdminLogin() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAdminUnlocked()) {
      nav("/admin/overview", { replace: true });
    }
  }, [nav]);

  useEffect(() => {
    if (params.get("error") === "forbidden") {
      setError("Access denied.");
    }
  }, [params]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        setAdminUnlocked();
        nav("/admin/overview", { replace: true });
      } else {
        setError("Incorrect access code.");
        setBusy(false);
      }
    }, 300);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1029", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#070B1F", borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", padding: "32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.50)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 24, color: "#FFFFFF", letterSpacing: "0.08em", marginBottom: 4 }}>
            MWC ADMIN
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", fontFamily: "Inter, sans-serif" }}>
            Internal operations console
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: 16, borderRadius: 8, border: "1px solid rgba(220,38,38,0.40)", background: "rgba(220,38,38,0.10)", padding: "10px 14px", fontSize: 13, color: "#FCA5A5", fontFamily: "Inter, sans-serif" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            placeholder="Access code"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(null); }}
            autoFocus
            autoComplete="current-password"
            style={{ height: 48, borderRadius: 8, border: "1px solid rgba(255,255,255,0.20)", background: "rgba(255,255,255,0.05)", color: "#FFFFFF", fontSize: 16, fontFamily: "Inter, sans-serif", padding: "0 14px", outline: "none" }}
          />
          <button
            type="submit"
            disabled={busy || !pw}
            style={{ height: 48, borderRadius: 10, background: "var(--brand-cta)", color: "#FFF", border: "none", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, cursor: busy || !pw ? "not-allowed" : "pointer", opacity: busy || !pw ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : "Enter"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.30)", fontFamily: "Inter, sans-serif" }}>
          Access restricted to authorized staff only.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

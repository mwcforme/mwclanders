/**
 * BookEntry — /book/entry
 *
 * Receives a signed WordPress → Lovable handoff token, verifies it,
 * seeds the booking store, then routes into the funnel.
 *
 * Guarantee: URL params are stripped from history before any async work
 * begins. PHI never survives in the URL, browser history, or referrer header.
 *
 * Debug mode: append &debug=1 to the URL. On failure, the page will NOT
 * redirect — it renders the rejection reason + token diagnostics on screen.
 * Debug mode also keeps the original URL intact (no history strip) so you
 * can copy/inspect it.
 *
 * Happy path:  /book/entry?fn=…&ph=…&ts=…&sig=… → /book/symptom
 * Failure path: anything invalid → /  (silent — unless debug=1)
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBookingStore, isKnownService } from "@/domain/booking/bookingStore";
import { verifyWpHandoff, pushWpPartialLead } from "@/lib/wpHandoff";
import { PHONE }                           from "@/lib/constants";

interface DebugInfo {
  reason: string;
  params: Record<string, string | null>;
  nowUnix: number;
  tokenUnix: number | null;
  ageSeconds: number | null;
  secretConfigured: boolean;
  host: string;
}

export default function BookEntry() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  // Strict-mode / double-mount guard
  const processed = useRef(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // Snapshot params synchronously — before any async gap.
    const snapshot = new URLSearchParams(searchParams.toString());
    const debugMode = snapshot.get("debug") === "1";

    const buildDebug = (reason: string): DebugInfo => {
      const tsRaw = snapshot.get("ts");
      const tokenUnix = tsRaw && /^\d{10}$/.test(tsRaw) ? parseInt(tsRaw, 10) : null;
      const nowUnix = Math.floor(Date.now() / 1000);
      return {
        reason,
        params: {
          fn:    snapshot.get("fn"),
          ph:    snapshot.get("ph"),
          ts:    tsRaw,
          sig:   snapshot.get("sig"),
          loc:   snapshot.get("loc"),
          svc:   snapshot.get("svc"),
          em:    snapshot.get("em"),
        },
        nowUnix,
        tokenUnix,
        ageSeconds: tokenUnix !== null ? nowUnix - tokenUnix : null,
        secretConfigured: Boolean(import.meta.env.VITE_WP_HANDOFF_SECRET),
        host: typeof window !== "undefined" ? window.location.host : "",
      };
    };

    const fail = (reason: string) => {
      if (import.meta.env.DEV) console.warn("[BookEntry] handoff rejected:", reason);
      if (debugMode) {
        setDebugInfo(buildDebug(reason));
        return;
      }
      navigate("/", { replace: true });
    };

    // Fast-fail: if the two required params aren't even present, skip crypto.
    if (!snapshot.get("fn") || !snapshot.get("ph")) {
      fail("missing_fn_or_ph");
      return;
    }

    // Strip PHI from URL and browser history immediately — before await.
    // In debug mode, leave URL intact so it can be inspected/copied.
    if (!debugMode) {
      window.history.replaceState({}, "", "/book/entry");
    }

    verifyWpHandoff(snapshot).then((result) => {
      if (!result.ok) {
        fail("reason" in result ? result.reason : "unknown");
        return;
      }

      const { payload } = result;
      pushWpPartialLead(payload);

      const store = useBookingStore.getState();
      store.reset();
      store.patch({
        identity: {
          firstName: payload.firstName,
          phone:     payload.phone,
          email:     payload.email ?? "",
        },
        service:  isKnownService(payload.service) ? payload.service : undefined,
        location: payload.location,
        source:   "wordpress-handoff",
      });

      if (debugMode) {
        setDebugInfo({
          ...buildDebug("ok"),
          reason: "ok — would route to /book/symptom",
        });
        return;
      }

      navigate("/book/symptom", { replace: true });
    }).catch((err) => {
      console.error("[BookEntry] verify threw", err);
      fail("verify_threw");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (debugInfo) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--brand-navy-deep)",
          color: "rgba(255,255,255,0.92)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <h1 style={{ fontSize: 20, marginBottom: 16, fontFamily: "Inter, sans-serif" }}>
            BookEntry handoff diagnostics
          </h1>
          <p style={{ marginBottom: 12 }}>
            <strong>Reason:</strong>{" "}
            <span style={{ color: debugInfo.reason.startsWith("ok") ? "#7CFFB2" : "#FF8A8A" }}>
              {debugInfo.reason}
            </span>
          </p>
          <ReasonHint reason={debugInfo.reason} info={debugInfo} />
          <pre
            style={{
              background: "rgba(0,0,0,0.35)",
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
              overflowX: "auto",
              marginTop: 16,
            }}
          >
{JSON.stringify(debugInfo, null, 2)}
          </pre>
          <div style={{ marginTop: 20, fontFamily: "Inter, sans-serif", fontSize: 13 }}>
            <a href="/" style={{ color: "var(--brand-cta)" }}>← back home</a>
            {"  ·  "}
            <a href={PHONE.tel} style={{ color: "var(--brand-cta)" }}>{PHONE.display}</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--brand-navy-deep)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          // hardcoded-color-allow-next-line
          border: "3px solid rgba(232,103,10,0.25)",
          borderTopColor: "var(--brand-cta)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 14 }}>
        Setting up your visit…
      </p>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
        Having trouble?{" "}
        <a href={PHONE.tel} style={{ color: "var(--brand-cta)", textDecoration: "none" }}>
          {PHONE.display}
        </a>
      </p>
    </div>
  );
}

function ReasonHint({ reason, info }: { reason: string; info: DebugInfo }) {
  const hints: Record<string, string> = {
    missing_fn_or_ph: "URL is missing required fn or ph param. Check WordPress filter output.",
    missing_or_malformed_params: "One of fn/ph/ts/sig is missing or ts/sig has wrong format (ts must be 10-digit unix, sig must be 64-char lowercase hex).",
    token_expired_or_future: `Token age = ${info.ageSeconds}s. TTL is 600s, max future skew 60s. WP server clock or stale link.`,
    secret_not_configured: "VITE_WP_HANDOFF_SECRET is not set in this environment. Add it and republish.",
    invalid_signature: "Secret mismatch OR payload format mismatch. PHP must sign exactly: base64url(fn) + '|' + base64url(ph) + '|' + ts using the same secret.",
    crypto_error: "WebCrypto threw. Likely malformed sig bytes.",
    verify_threw: "verifyWpHandoff rejected unexpectedly. See console.",
  };
  const hint = hints[reason];
  if (!hint) return null;
  return (
    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
      {hint}
    </p>
  );
}

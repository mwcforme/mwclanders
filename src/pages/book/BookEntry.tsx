/**
 * BookEntry — /book/entry
 *
 * Receives a signed WordPress → Lovable handoff token, verifies it,
 * seeds the booking store, then routes into the funnel.
 *
 * Guarantee: URL params are stripped from history before any async work
 * begins. PHI never survives in the URL, browser history, or referrer header.
 *
 * Happy path:  /book/entry?fn=…&ph=…&ts=…&sig=… → /book/symptom
 * Failure path: anything invalid → /  (LP root, silent — no error exposed to user)
 */
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBookingStore, isKnownService } from "@/domain/booking/bookingStore";
import { verifyWpHandoff }                 from "@/lib/wpHandoff";
import { PHONE }                           from "@/lib/constants";

export default function BookEntry() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  // Strict-mode / double-mount guard
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // Snapshot params synchronously — before any async gap.
    // URLSearchParams is mutable and tied to the live URL; capture now.
    const snapshot = new URLSearchParams(searchParams.toString());

    // Fast-fail: if the two required params aren't even present, skip crypto.
    if (!snapshot.get("fn") || !snapshot.get("ph")) {
      navigate("/", { replace: true });
      return;
    }

    // Strip PHI from URL and browser history immediately — before await.
    // Any async gap after this point has no URL-based PHI to leak.
    window.history.replaceState({}, "", "/book/entry");

    verifyWpHandoff(snapshot).then((result) => {
      if (!result.ok) {
        // Log reason in dev, stay silent in prod — never expose internals.
        if (import.meta.env.DEV) {
          const reason = "reason" in result ? result.reason : "unknown";
          console.warn("[BookEntry] handoff rejected:", reason);
        }
        navigate("/", { replace: true });
        return;
      }

      const { payload } = result;
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

      navigate("/book/symptom", { replace: true });
    }).catch(() => {
      // verifyWpHandoff is internally guarded, but defend the effect regardless.
      navigate("/", { replace: true });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — we want this to fire exactly once on mount

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

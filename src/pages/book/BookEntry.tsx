/**
 * /book/entry
 *
 * WordPress → Lovable booking funnel handoff.
 *
 * Flow:
 *  1. WordPress Fluent Form submits → redirects to /book/entry with signed URL params
 *  2. This page verifies the HMAC-SHA256 signature client-side (Web Crypto, no network call)
 *  3. On valid sig: seeds booking store, strips params from URL, redirects to /book/symptom
 *  4. On invalid/expired: redirects back to LP root
 *
 * URL shape from WP:
 *   /book/entry?fn=John&ph=7574441234&loc=virginia-beach&svc=trt&em=j@x.com&ts=1716299400&sig=abc123
 *
 * Security:
 *  - Signature verified via HMAC-SHA256 (shared secret in VITE_WP_HANDOFF_SECRET)
 *  - Tokens expire after 10 minutes (configurable in wpHandoff.ts)
 *  - PHI stripped from URL immediately after parse (window.history.replaceState)
 *  - PHI stored in sessionStorage only via bookingStore (never cookies/URL/analytics)
 */
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBookingStore, isKnownService } from "@/domain/booking/bookingStore";
import { parseWpHandoff } from "@/lib/wpHandoff";
import { PHONE } from "@/lib/constants";

const BookEntry = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    // Must have at minimum fn + ph + ts + sig
    if (!params.get("fn") || !params.get("ph")) {
      navigate("/", { replace: true });
      return;
    }

    // Strip all handoff params from URL immediately — PHI hygiene
    window.history.replaceState(null, "", "/book/entry");

    parseWpHandoff(params).then((identity) => {
      if (!identity) {
        // Invalid or expired token
        console.warn("[book-entry] handoff verification failed — redirecting to LP");
        navigate("/", { replace: true });
        return;
      }

      // Seed booking store
      const store = useBookingStore.getState();
      store.reset();
      store.patch({
        identity: {
          firstName: identity.firstName,
          phone: identity.phone,
          email: identity.email ?? "",
        },
        service:  isKnownService(identity.service) ? identity.service : undefined,
        location: identity.location ?? undefined,
        source:   "wordpress-handoff",
      });

      navigate("/book/symptom", { replace: true });
    });
  }, [navigate, params]);

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
      {/* Spinner */}
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
};

export default BookEntry;

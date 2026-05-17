import { useEffect, useState } from "react";

/**
 * Renders a hidden Sentry test button when ?sentry_test=1 is in the URL.
 * Used post-deploy to verify error capture + source maps + replay.
 */
export const SentryTestTrigger = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get("sentry_test") === "1");
  }, []);

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={() => {
        throw new Error(
          "Sentry test error from MWC booking LP - " + new Date().toISOString(),
        );
      }}
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 1,
        padding: "8px 12px",
        // hardcoded-color-allow-next-line
        background: "var(--brand-navy-deep)",
        color: "var(--c-text-on-dark)",
        // hardcoded-color-allow-next-line
        border: "1px solid #333",
        borderRadius: 6,
        font: "500 12px/1 system-ui, sans-serif",
        opacity: 0.6,
        cursor: "pointer",
      }}
      aria-label="Trigger Sentry Test"
    >
      Trigger Sentry Test
    </button>
  );
};

export default SentryTestTrigger;

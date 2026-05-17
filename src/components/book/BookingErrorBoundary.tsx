/**
 * BookingErrorBoundary — per-funnel-step React class ErrorBoundary.
 *
 * Wrap any funnel component that could throw during render.
 * Default fallback is a navy card with a call-to-action phone link.
 */
import React from "react";
import { PHONE } from "@/lib/constants";

interface Props {
  children: React.ReactNode;
  /** Optional custom fallback UI. When omitted the default navy card is shown. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class BookingErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: React.ErrorInfo): void {
    // PHI safety: do not log componentStack - it may contain rendered PII
    // from the booking form. Log only the error message (no stack trace).
    console.error("[BookingErrorBoundary] Caught render error:", error.message);
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          background: "var(--brand-navy-deep)",
          borderRadius: 12,
          padding: "28px 24px",
          border: "1px solid rgba(255,255,255,0.10)",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "var(--c-text-on-dark)",
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          Something went wrong. Please try again or call (866) 344-4955.
        </p>
        <a
          href={PHONE.tel}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "var(--brand-cta)",
            color: "var(--c-text-on-dark)",
            padding: "12px 28px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
            letterSpacing: "0.04em",
            boxShadow: "0 4px 16px rgba(232,103,10,0.40)",
          }}
        >
          📞 Call {PHONE.display}
        </a>
      </div>
    );
  }
}

export default BookingErrorBoundary;

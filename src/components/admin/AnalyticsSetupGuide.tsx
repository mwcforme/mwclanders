/**
 * AnalyticsSetupGuide — GA4 and Clarity configuration instructions.
 */
export const AnalyticsSetupGuide = () => (
  <div className="mb-6 rounded-xl border border-white/8 bg-[#070B1F] p-6 print:border-gray-300">
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
      GA4 &amp; Clarity Setup
    </h3>
    <div className="space-y-3 text-sm text-white/70">
      <p>
        <span className="font-semibold text-white">Google Analytics 4:</span>{" "}
        The GA4 measurement ID is injected via{" "}
        <code className="rounded bg-white/8 px-1.5 py-0.5 text-xs font-mono text-white/80">
          VITE_GA_MEASUREMENT_ID
        </code>
        . Verify events in{" "}
        <span className="text-white/50">GA4 → Reports → Realtime</span>.
      </p>
      <p>
        <span className="font-semibold text-white">Microsoft Clarity:</span>{" "}
        Session recordings and heatmaps are configured via the Clarity script tag. View recordings at{" "}
        <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer"
          className="text-[var(--brand-cta)] hover:underline">
          clarity.microsoft.com
        </a>
        .
      </p>
      <p>
        <span className="font-semibold text-white">Conversion funnel:</span>{" "}
        Track{" "}
        <code className="rounded bg-white/8 px-1.5 py-0.5 text-xs font-mono text-white/80">
          lead_capture
        </code>
        {" "}→{" "}
        <code className="rounded bg-white/8 px-1.5 py-0.5 text-xs font-mono text-white/80">
          appointment_booked
        </code>
        {" "}custom events in GA4 → Explore → Funnel exploration.
      </p>
    </div>
  </div>
);

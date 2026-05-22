import { memo } from "react";
import { Lock, Star } from "lucide-react";

export const QuizTrustBlock = memo(function QuizTrustBlock() {
  return (
    <>
      {/* Encryption badge */}
      {/* hardcoded-color-allow-next-line */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs" style={{ color: "rgba(245,240,235,0.75)" }}>
        <Lock size={12} /> 256-bit encrypted . Private . HIPAA-conscious
      </div>

      {/* Testimonial card */}
      <div
        className="mt-6 rounded-xl p-5"
        style={{
          // hardcoded-color-allow-next-line
          background: "rgba(255,255,255,0.05)",
          // hardcoded-color-allow-next-line
          border: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill="var(--brand-cta)" stroke="var(--brand-cta)" />
          ))}
          {/* hardcoded-color-allow-next-line */}
          <span className="text-xs font-semibold" style={{ color: "rgba(245,240,235,0.85)" }}>
            Excellent . 4.9 average
          </span>
        </div>
        {/* hardcoded-color-allow-next-line */}
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,235,0.92)" }}>
          "Now that I've started TRT, I can't believe how much has changed. My ED is improving. My muscles are coming back. It's only been two weeks. The depression and mental fog are finally lifting. MWC helped me feel like myself again."
        </p>
        {/* hardcoded-color-allow-next-line */}
        <p className="mt-2 text-xs" style={{ color: "rgba(245,240,235,0.65)" }}>
          Johnathan W. . Verified MWC patient
        </p>
      </div>
    </>
  );
});

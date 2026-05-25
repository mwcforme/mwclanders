/** CSS keyframe animations injected via <style> tag in ProductTRT. */
export const PRODUCT_TRT_STYLES = `
  @keyframes shimmerLR {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .ann-shimmer {
    background: linear-gradient(
      90deg,
      #0B1029 0%, #0B1029 30%, #1e2f5e 50%, #0B1029 70%, #0B1029 100%
    );
    background-size: 200% auto;
    animation: shimmerLR 3.5s linear infinite;
  }

  /* Timeline step entrance animation */
  .tl-step {
    opacity: 0;
    transform: translateX(-18px);
    transition: none;
  }
  .tl-step.tl-visible {
    animation: slideInLeft 400ms ease forwards;
  }
  .tl-step.tl-visible:nth-child(1) { animation-delay:   0ms; }
  .tl-step.tl-visible:nth-child(2) { animation-delay: 100ms; }
  .tl-step.tl-visible:nth-child(3) { animation-delay: 200ms; }
  .tl-step.tl-visible:nth-child(4) { animation-delay: 300ms; }

  /* Comparison table row hover */
  .compare-row {
    transition: transform var(--transition-fast, 120ms ease), box-shadow var(--transition-fast, 120ms ease);
  }
  .compare-row:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    position: relative;
    z-index: 1;
  }

  /* Quiz answer ripple on click */
  .quiz-answer {
    transition: border-color 150ms, background 150ms, transform 150ms;
  }
  .quiz-answer:active {
    transform: scale(0.97);
  }
  .quiz-answer.quiz-selected {
    transform: scale(1.00);
  }

  /* Stats count-up ready */
  .stat-value { will-change: contents; }

  /* Quiz answer grid — single-col on very small screens */
  @media (max-width: 520px) {
    .quiz-grid { grid-template-columns: 1fr !important; }
  }

  /* Mobile overrides */
  @media (max-width: 768px) {
    .hero-grid      { grid-template-columns: 1fr !important; gap: 28px !important; }
    .timeline-grid  { flex-direction: column !important; }
    .tl-connector   { display: none !important; }
    .compare-scroll { overflow-x: auto !important; }
  }
`;

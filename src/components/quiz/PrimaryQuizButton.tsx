import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface PrimaryQuizButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * Standard orange CTA used inside the QuizShell sticky footer.
 * Disabled state preserves contrast for legibility.
 */
export function PrimaryQuizButton({ children, disabled, style, ...rest }: PrimaryQuizButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="w-full h-14 md:h-16 rounded-md font-bold uppercase tracking-[0.08em] text-base md:text-lg transition-opacity active:scale-[0.99]"
      style={{
        background: "var(--brand-cta)",
        color: "var(--c-text-on-dark)",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        // hardcoded-color-allow-next-line
        boxShadow: "0 16px 40px rgba(232,103,10,0.40)",
        fontFamily: "Inter, sans-serif",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

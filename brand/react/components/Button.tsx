/**
 * Men's Wellness Centers — Button (v1.2.1)
 *
 * Variants:
 *   primary   (default) -> deep #CA4A0E fill + WHITE text + orange glow (4.67:1).
 *   secondary           -> white fill + navy text. For dark/navy backgrounds.
 *   deep                -> alias of primary (deep #CA4A0E fill + WHITE text). Only when a white-text
 *                          orange button is explicitly required (e.g. on a light surface).
 *   ghost               -> transparent + cream-14 hairline border + cream text. Tertiary, on dark.
 *
 * CRO copy note (do not hard-code here, pass via children): use Book / Schedule /
 * Claim / Reserve verbs. Never "free" — say "no-cost visit" or "no-cost appointment".
 *
 * Uses Tailwind utilities mapped in tailwind.config.ts. No raw hex in this file.
 */
import * as React from "react";

type Variant = "primary" | "secondary" | "deep" | "ghost";
type Size = "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 select-none font-ui font-bold " +
  "uppercase tracking-[0.06em] rounded-md transition-colors duration-base " +
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 " +
  "focus-visible:outline-accent disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  md: "min-h-[52px] px-6 text-[16px]",
  lg: "min-h-[60px] px-8 text-[18px]",
};

const variants: Record<Variant, string> = {
  // deep orange + WHITE text + glow; hover DEEPENS to #D35F1A
  primary:
    "bg-action text-on-action shadow-cta hover:bg-action-hover " +
    "active:translate-y-px disabled:bg-border-input disabled:text-on-light-muted disabled:shadow-none",
  // white fill + navy text for dark backgrounds
  secondary:
    "bg-white text-on-light shadow-md hover:bg-cream-50 " +
    "disabled:bg-border-input disabled:text-on-light-muted disabled:shadow-none",
  // deep orange + WHITE text (the only orange button that carries white)
  deep:
    "bg-action-deep text-on-action-deep shadow-md hover:brightness-110 " +
    "disabled:bg-border-input disabled:text-on-light-muted disabled:shadow-none",
  // transparent ghost on dark
  ghost:
    "bg-transparent text-on-dark border border-border-on-dark hover:border-accent hover:text-accent " +
    "disabled:opacity-40",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className = "", ...rest }, ref) => (
    <button
      ref={ref}
      className={[
        base,
        sizes[size],
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  )
);
Button.displayName = "Button";

export default Button;

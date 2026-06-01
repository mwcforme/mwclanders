/**
 * Men's Wellness Centers — Card (v1.2.1)
 *
 * Radius lg (16px). Two tones:
 *   light (default) -> white fill + navy-25 hairline + shadow-lg. Navy text.
 *   dark            -> navy-900 fill + cream-14 hairline. Elevate with border + shadow,
 *                      NOT a second navy fill. Cream text.
 *
 * NO-GRAY rule: borders are navy/cream at opacity, never #ccc/#e5e7eb gray.
 */
import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "light" | "dark";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ tone = "light", className = "", ...rest }, ref) => {
    const tones = {
      light: "bg-white text-on-light border border-border-input shadow-lg",
      dark: "bg-surface-dark text-on-dark border border-border-on-dark shadow-xl",
    } as const;
    return (
      <div
        ref={ref}
        className={["rounded-lg p-6", tones[tone], className].join(" ")}
        {...rest}
      />
    );
  }
);
Card.displayName = "Card";

export default Card;

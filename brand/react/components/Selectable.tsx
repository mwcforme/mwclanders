/**
 * Men's Wellness Centers — Selectable chip / option (v1.2.1)
 *
 * The SELECTED state matches the primary button exactly:
 *   selected -> deep #CA4A0E fill + WHITE text + white icon (matches the primary button, 4.67:1).
 *   unselected -> light surface: white fill + navy-25 border + navy text.
 *               (on dark backgrounds, use the `onDark` prop for cream-06 fill + cream-14 border + cream text.)
 *
 * The accent orange #E8732A is used for the unselected icon, not as a fill.
 * Use this for single/multi choice pills, plan pickers, time-slot pickers, etc.
 */
import * as React from "react";

export interface SelectableProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  selected?: boolean;
  onDark?: boolean;
}

export const Selectable = React.forwardRef<HTMLButtonElement, SelectableProps>(
  ({ selected = false, onDark = false, className = "", children, ...rest }, ref) => {
    const selectedCls =
      "bg-surface-selected text-on-action border border-transparent shadow-cta";
    const idleLight =
      "bg-white text-on-light border border-border-input hover:border-accent";
    const idleDark =
      "bg-[rgba(245,240,235,0.06)] text-on-dark border border-border-on-dark hover:border-accent";
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        className={[
          "inline-flex items-center justify-center gap-2 min-h-[52px] px-5",
          "font-ui font-semibold text-[15px] rounded-md select-none cursor-pointer",
          "transition-colors duration-base",
          "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent",
          selected ? selectedCls : onDark ? idleDark : idleLight,
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Selectable.displayName = "Selectable";

export default Selectable;

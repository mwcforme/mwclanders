/**
 * Men's Wellness Centers — Checkbox (v1.2.1)
 *
 * The CHECKED fill is the deep #CA4A0E (orange-800) because the check glyph is WHITE
 * and white clears contrast on the deep orange (4.67:1). Same deep orange as the
 * primary button now. Driven via CSS `accent-color`.
 *
 * Border (unchecked) = navy-25 hairline. Label = navy on light / cream on dark.
 * Use for SMS/email opt-in consent (must be unchecked by default, never pre-checked).
 */
import * as React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  onDark?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, onDark = false, id, className = "", ...rest }, ref) => {
    const cbId = id || rest.name || React.useId();
    return (
      <label
        htmlFor={cbId}
        className={[
          "flex items-start gap-3 cursor-pointer font-ui text-[14px] leading-snug",
          onDark ? "text-on-dark-muted" : "text-on-light-muted",
        ].join(" ")}
      >
        <input
          id={cbId}
          ref={ref}
          type="checkbox"
          // accent-color drives the checked fill to deep orange (white check = 4.67:1)
          className={[
            "mt-0.5 h-5 w-5 shrink-0 rounded-sm cursor-pointer",
            "[accent-color:#CA4A0E]",
            "border border-border-input",
            "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent",
            className,
          ].join(" ")}
          {...rest}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export default Checkbox;

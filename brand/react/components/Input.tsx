/**
 * Men's Wellness Centers — Input (v1.2.1)
 *
 * 56px tall, white fill, navy-25 hairline border (NO GRAY borders), navy text.
 * Focus ring = accent orange #E8732A. Error border = error-700.
 * Placeholder uses navy-55 (the single sanctioned low-opacity navy hint, 4.15:1).
 * Required asterisk is orange (accent). Label is navy, uppercase-optional.
 *
 * Funnel form rule: max 4 fields (first name, last name, phone, ZIP/email).
 * Phone is the priority capture. Never collect PHI.
 */
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, required, error, id, className = "", ...rest }, ref) => {
    const inputId = id || rest.name || React.useId();
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="font-ui text-[14px] font-semibold text-on-light"
          >
            {label}
            {required && <span className="text-accent"> *</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          className={[
            "h-14 w-full rounded-md bg-white px-4 font-ui text-[16px] text-on-input",
            "placeholder:text-on-light-muted",
            "border transition-colors duration-base",
            error ? "border-error-700" : "border-border-input",
            "focus:outline-none focus:border-accent",
            "focus:shadow-[0_0_0_3px_rgba(232,115,42,0.25)]",
            className,
          ].join(" ")}
          {...rest}
        />
        {error && (
          <span className="font-ui text-[13px] text-error-700">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;

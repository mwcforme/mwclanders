import { z } from "zod";

/**
 * Canonical validation rules for any lead-capture form.
 * Field schemas are exported individually so callers (e.g. the booking confirm
 * flow) can compose only the pieces they need without re-asserting TCPA.
 */

export const nameField = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .max(100, "Name must be under 100 characters");

export const phoneField = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((d) => d.length === 10, "Valid 10-digit phone required");

export const emailField = z
  .string()
  .trim()
  .max(255, "Email must be under 255 characters")
  .email("Valid email is required");

export const locationField = z.enum(["richmond", "newport-news", "virginia-beach"], {
  errorMap: () => ({ message: "Please select a location" }),
});

export const tcpaField = z.literal(true, {
  errorMap: () => ({ message: "Consent required to continue" }),
});

/**
 * Hero-form schema: name + phone + location + TCPA.
 * Email removed — collected post-booking on /book/confirmed.
 */
export const heroLeadSchema = z.object({
  name: nameField,
  phone: phoneField,
  location: locationField,
  tcpa: tcpaField,
});

export type HeroLeadInput = z.infer<typeof heroLeadSchema>;

/**
 * Short hero-form schema: phone + location + TCPA only.
 * Name and email collected downstream at /book/schedule where intent is highest.
 * CRO: reduces above-fold friction from 5 fields → 3.
 */
export const shortHeroLeadSchema = z.object({
  phone: phoneField,
  location: locationField,
  tcpa: tcpaField,
});



/** Booking-confirm schema: TCPA already collected upstream; fields optional. */
export const confirmLeadSchema = z.object({
  name: nameField.optional(),
  phone: phoneField.optional(),
  email: emailField.optional(),
});



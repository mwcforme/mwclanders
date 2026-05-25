/**
 * Canonical validation rules for lead-capture forms.
 * Uses miniSchema (tiny inline validator) instead of zod to keep zod out of the critical path.
 * API-compatible with ZodSchema<T>.safeParse() — useLeadSubmitController works unchanged.
 */
import { m } from "@/lib/miniSchema";

export const nameField  = m.str().trim().min(1, "Full name is required").max(100, "Name must be under 100 characters");
export const phoneField = m.str().transform((v: string) => v.replace(/\D/g, "")).refine((d: string) => d.length === 10, "Valid 10-digit phone required");
export const emailField = m.str().trim().max(255, "Email must be under 255 characters").email("Valid email is required");

const LOCATIONS = ["richmond", "newport-news", "virginia-beach"] as const;
export type LocationKey = typeof LOCATIONS[number];
export const locationField = m.enumField(LOCATIONS, "Please select a location");
export const tcpaField     = m.literal(true, "Consent required to continue");

/** Hero-form schema: name + phone + location + TCPA. */
export const heroLeadSchema = m.object({
  name:     nameField,
  phone:    phoneField,
  location: locationField,
  tcpa:     tcpaField,
});
export type HeroLeadInput = {
  name: string;
  phone: string;
  location: LocationKey;
  tcpa: true;
};

/** Short hero-form: phone + location + TCPA only. */
export const shortHeroLeadSchema = m.object({
  phone:    phoneField,
  location: locationField,
  tcpa:     tcpaField,
});

/** Booking-confirm: all fields optional (TCPA already collected). */
export const confirmLeadSchema = m.object({
  name:  nameField.optional(),
  phone: phoneField.optional(),
  email: emailField.optional(),
});

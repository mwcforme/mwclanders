/**
 * Canonical validation rules for lead-capture forms.
 * Uses miniSchema (tiny inline validator) instead of zod to keep zod out of the critical path.
 * API-compatible with ZodSchema<T>.safeParse() — useLeadSubmitController works unchanged.
 */
import { m } from "@/lib/miniSchema";

export const nameField  = m.str().trim().min(1, "Full name is required").max(100, "Name must be under 100 characters");
// MWC-012: reject dummy/invalid US phone numbers
function isValidUsPhone(digits: string): boolean {
  if (digits.length !== 10) return false;
  const areaCode = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  // Reject invalid area codes (0xx, 1xx not valid NPA)
  if (areaCode[0] === "0" || areaCode[0] === "1") return false;
  // Reject invalid exchanges (0xx, 1xx not valid NXX)
  if (exchange[0] === "0" || exchange[0] === "1") return false;
  // Reject 555-0100–555-0199 (fictitious range) and 555-0000–555-0099
  if (areaCode === "555" && exchange === "555") return false;
  if (exchange === "555" && parseInt(digits.slice(6)) <= 199) return false;
  // Reject all-same digit (1111111111, 0000000000, etc.)
  if (/^(\d)\1{9}$/.test(digits)) return false;
  // Reject sequential patterns (1234567890)
  if (digits === "1234567890" || digits === "0987654321") return false;
  return true;
}
export const phoneField = m.str()
  .transform((v: string) => v.replace(/\D/g, ""))
  .refine((d: string) => isValidUsPhone(d), "Please enter a valid US phone number");
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

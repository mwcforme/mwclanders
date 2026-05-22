/**
 * Site-wide constants — single source of truth.
 * Import from here; never hardcode these values in components.
 */

export const PHONE = {
  display: "(866) 344-4955",
  tel: "tel:+18663444955",
  sms: "sms:+18663444955",
  digits: "8663444955",
} as const;

export const BRAND = {
  name: "Men's Wellness Centers",
  url: "https://book.menswellnesscenters.com",
  email: "info@menswellnesscenters.com",
} as const;

/** Google Analytics 4 measurement ID. */
export const GA4_ID = "G-286547777";

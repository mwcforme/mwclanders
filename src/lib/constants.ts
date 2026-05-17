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

export const GBP_REVIEWS_URL =
  "https://www.google.com/maps/place/Men%27s+Wellness+Centers/@36.8577,-76.1369,15z/data=!4m8!3m7!1s0x0:0x0!8m2!3d36.8577!4d-76.1369!9m1!1b1";

/** Google Analytics 4 measurement ID. */
export const GA4_ID = "G-286547777";

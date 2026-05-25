/**
 * Environment constants.
 *
 * Stage environment removed 2026-05-25. All traffic is production.
 * Edge functions always use prod GHL credentials.
 */

export const APP_ENV = "prod" as const;
export const IS_PROD = true;
export const IS_STAGE = false;

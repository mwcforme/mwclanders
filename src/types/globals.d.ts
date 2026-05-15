/**
 * Global type augmentations for third-party scripts injected via index.html.
 * Eliminates `window as any` casts throughout the codebase.
 */

interface GhlChat {
  open(): void;
  close(): void;
}

interface LcApi {
  open_chat_window(): void;
  close_chat_window(): void;
}

interface ClarityApi {
  (action: string, ...args: unknown[]): void;
  q?: unknown[];
}

declare global {
  interface Window {
    GHL_CHAT?: GhlChat;
    LC_API?: LcApi;
    dataLayer?: Array<Record<string, unknown>>;
    clarity?: ClarityApi;
    gtag?: (...args: unknown[]) => void;
  }
}

export {};

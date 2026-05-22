import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

const isBookingUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const u = new URL(url, "https://_local_");
    return u.pathname.startsWith("/book/") || u.pathname === "/book";
  } catch {
    return /\/book(\/|$)/.test(url);
  }
};

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE as string | undefined,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        // PHI: aggressive masking everywhere; /book/* additionally drops events.
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/book\.menswellnesscenters\.com/,
      /^\//,
    ],
    beforeSend(event) {
      // Belt-and-suspenders: never ship a Sentry event originating from /book/*.
      const url =
        event.request?.url ||
        (typeof window !== "undefined" ? window.location.href : undefined);
      if (isBookingUrl(url)) return null;
      return event;
    },
    beforeSendTransaction(event) {
      const url =
        event.request?.url ||
        (typeof window !== "undefined" ? window.location.href : undefined);
      if (isBookingUrl(url)) return null;
      return event;
    },
  });
} else if (import.meta.env.DEV) {
  console.info("[sentry] VITE_SENTRY_DSN not set; Sentry disabled.");
}



import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { ILeadSubmitter } from "@/services/contracts/ILeadSubmitter";
import type { IAppointmentBooker } from "@/services/contracts/IAppointmentBooker";
import type { IAnalytics } from "@/services/contracts/IAnalytics";
import type { INavigationService } from "@/services/contracts/INavigationService";
import { GhlProxyLeadSubmitter } from "@/services/impl/GhlProxyLeadSubmitter";
import { GhlProxyAppointmentBooker } from "@/services/impl/GhlProxyAppointmentBooker";
import { NoopAnalytics } from "@/services/impl/NoopAnalytics";
import { ReactRouterNavigationService } from "@/services/impl/ReactRouterNavigationService";

export interface Services {
  leads: ILeadSubmitter;
  booking: IAppointmentBooker;
  analytics: IAnalytics;
  nav: INavigationService;
}

const ServicesContext = createContext<Services | null>(null);

/**
 * Sole instantiation site for concrete service implementations.
 * Tests/storybook can render a subtree with a custom `value` to inject mocks.
 */
export const ServicesProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value?: Partial<Services>;
}) => {
  const navigate = useNavigate();
  const services = useMemo<Services>(
    () => ({
      leads: value?.leads ?? new GhlProxyLeadSubmitter(),
      booking: value?.booking ?? new GhlProxyAppointmentBooker(),
      analytics: value?.analytics ?? new NoopAnalytics(),
      nav: value?.nav ?? new ReactRouterNavigationService(navigate),
    }),
    [navigate, value],
  );
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with provider by design
export const useServices = (): Services => {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("useServices must be used within <ServicesProvider>");
  return ctx;
};

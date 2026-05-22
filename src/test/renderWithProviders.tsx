/**
 * Shared render helper for component tests.
 * Wraps with all required providers: QueryClient, HelmetProvider, MemoryRouter, ServicesProvider.
 */
import { type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServicesProvider } from "@/app/providers/ServicesProvider";

/** Minimal no-retry query client for tests */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function createWrapper(initialEntries: string[] = ["/"]): React.FC<{ children: ReactNode }> {
  const qc = makeQueryClient();
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <HelmetProvider>
        <QueryClientProvider client={qc}>
          <MemoryRouter initialEntries={initialEntries}>
            <ServicesProvider>
              {children}
            </ServicesProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </HelmetProvider>
    );
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { initialEntries?: string[] },
) {
  const { initialEntries = ["/"], ...rest } = options ?? {};
  const Wrapper = createWrapper(initialEntries);
  return render(ui, { wrapper: Wrapper, ...rest });
}

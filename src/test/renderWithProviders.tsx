/**
 * Shared render helper for component tests.
 * Wraps with all required providers: MemoryRouter, ServicesProvider.
 */
import { type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ServicesProvider } from "@/app/providers/ServicesProvider";

export function createWrapper(initialEntries: string[] = ["/"]): React.FC<{ children: ReactNode }> {
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <ServicesProvider>
          {children}
        </ServicesProvider>
      </MemoryRouter>
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

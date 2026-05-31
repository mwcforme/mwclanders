/**
 * Smoke tests for admin pages. Requires auth mock.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
      then: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { email: "admin@test.com", id: "u1" } }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  },
}));

vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  withProfiler: (c: unknown) => c,
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

vi.mock("@/services/contactUpdater", () => ({
  contactUpdater: {
    updateContact: vi.fn().mockResolvedValue({}),
    addTag: vi.fn().mockResolvedValue({}),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── AdminLogin ───────────────────────────────────────────────────────────────

describe("AdminLogin", () => {
  it("renders without crash", async () => {
    const AdminLogin = (await import("@/pages/admin/AdminLogin")).default;
    expect(() => renderWithProviders(<AdminLogin />)).not.toThrow();
  });

  it("shows login content", async () => {
    const AdminLogin = (await import("@/pages/admin/AdminLogin")).default;
    renderWithProviders(<AdminLogin />);
    expect(document.body.textContent?.length).toBeGreaterThan(10);
  });
});

// ─── AdminLeads ───────────────────────────────────────────────────────────────

describe("AdminLeads", () => {
  it("renders without crash", async () => {
    const AdminLeads = (await import("@/pages/admin/AdminLeads")).default;
    expect(() => renderWithProviders(<AdminLeads />)).not.toThrow();
  });
});

// ─── AdminOverview ────────────────────────────────────────────────────────────

describe("AdminOverview", () => {
  it("renders without crash", async () => {
    const AdminOverview = (await import("@/pages/admin/AdminOverview")).default;
    expect(() => renderWithProviders(<AdminOverview />)).not.toThrow();
  });
});

// ─── AdminSync ────────────────────────────────────────────────────────────────

describe("AdminSync", () => {
  it("renders without crash", async () => {
    const AdminSync = (await import("@/pages/admin/AdminSync")).default;
    expect(() => renderWithProviders(<AdminSync />)).not.toThrow();
  });
});

// ─── AdminEvents ──────────────────────────────────────────────────────────────

describe("AdminEvents", () => {
  it("renders without crash", async () => {
    const AdminEvents = (await import("@/pages/admin/AdminEvents")).default;
    expect(() => renderWithProviders(<AdminEvents />)).not.toThrow();
  });
});


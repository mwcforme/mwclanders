/**
 * Smoke tests for remaining pages: ProductTRT, ProductTRTSchedule,
 * App, landing pages, admin pages, etc.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { useBookingStore } from "@/domain/booking/bookingStore";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/services/contactUpdater", () => ({
  contactUpdater: {
    updateContact: vi.fn().mockResolvedValue({}),
    addTag: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      upsert: vi.fn().mockResolvedValue({ data: [], error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
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
  BrowserTracing: vi.fn(),
  captureException: vi.fn(),
  withProfiler: (c: unknown) => c,
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => {
  useBookingStore.getState().reset();
  vi.clearAllMocks();
});

// ─── ProductTRT ───────────────────────────────────────────────────────────────

describe("ProductTRT", () => {
  it("renders without crash", async () => {
    const ProductTRT = (await import("@/pages/ProductTRT")).default;
    expect(() => renderWithProviders(<ProductTRT />)).not.toThrow();
  });

  it("renders hero section", async () => {
    const ProductTRT = (await import("@/pages/ProductTRT")).default;
    renderWithProviders(<ProductTRT />);
    expect(document.body.textContent?.length).toBeGreaterThan(100);
  });
});

// ─── TRTLandingPage ───────────────────────────────────────────────────────────

describe("TRTLandingPage", () => {
  it("renders without crash", async () => {
    const TRTLandingPage = (await import("@/pages/TRTLandingPage")).default;
    expect(() => renderWithProviders(<TRTLandingPage />)).not.toThrow();
  });
});

// ─── NewLandingPage ───────────────────────────────────────────────────────────

describe("NewLandingPage", () => {
  it("renders without crash", async () => {
    const NewLandingPage = (await import("@/pages/NewLandingPage")).default;
    expect(() => renderWithProviders(<NewLandingPage />)).not.toThrow();
  });
});

// ─── NewED ────────────────────────────────────────────────────────────────────

describe("NewED", () => {
  it("renders without crash", async () => {
    const NewED = (await import("@/pages/NewED")).default;
    expect(() => renderWithProviders(<NewED />)).not.toThrow();
  });
});

// ─── NewWeightLoss ────────────────────────────────────────────────────────────

describe("NewWeightLoss", () => {
  it("renders without crash", async () => {
    const NewWeightLoss = (await import("@/pages/NewWeightLoss")).default;
    expect(() => renderWithProviders(<NewWeightLoss />)).not.toThrow();
  });
});

// ─── Affordability ────────────────────────────────────────────────────────────

describe("Affordability", () => {
  it("renders without crash", async () => {
    const Affordability = (await import("@/pages/Affordability")).default;
    expect(() => renderWithProviders(<Affordability />)).not.toThrow();
  });
});

// ─── TRTEducation ─────────────────────────────────────────────────────────────

describe("TRTEducation", () => {
  it("renders without crash", async () => {
    const TRTEducation = (await import("@/pages/TRTEducation")).default;
    expect(() => renderWithProviders(<TRTEducation />)).not.toThrow();
  });
});

// ─── BookConfirmed ────────────────────────────────────────────────────────────

describe("BookConfirmed", () => {
  it("renders without crash", async () => {
    useBookingStore.getState().patch({
      identity: {
        firstName: "John",
        phone: "8001234567",
        email: "j@test.com",
        ghlContactId: "c-123",
      },
      appointmentTime: "2024-07-15T13:00:00Z",
      location: "richmond",
    });
    const BookConfirmed = (await import("@/pages/book/BookConfirmed")).default;
    expect(() => renderWithProviders(<BookConfirmed />)).not.toThrow();
  });
});

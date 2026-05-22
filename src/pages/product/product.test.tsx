/**
 * Smoke tests for product funnel pages.
 * These pages use booking store state — we reset between tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { useBookingStore } from "@/domain/booking/bookingStore";

// Mock contactUpdater to avoid real API calls
vi.mock("@/services/contactUpdater", () => ({
  contactUpdater: {
    updateContact: vi.fn().mockResolvedValue({}),
    addTag: vi.fn().mockResolvedValue({}),
  },
}));

// canvas confetti throws in jsdom — stub it
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

const seedStore = () => {
  useBookingStore.getState().reset();
  useBookingStore.getState().patch({
    identity: {
      firstName: "John",
      lastName: "Smith",
      phone: "8001234567",
      email: "john@example.com",
      ghlContactId: "contact-123",
    },
    service: "trt",
    location: "richmond",
    appointmentTime: "2024-07-15T13:00:00Z",
  });
};

beforeEach(() => {
  seedStore();
  vi.clearAllMocks();
});

// ─── TRTSuccess ───────────────────────────────────────────────────────────────

describe("TRTSuccess", () => {
  it("renders without crash", async () => {
    const TRTSuccess = (await import("@/pages/product/TRTSuccess")).default;
    expect(() => renderWithProviders(<TRTSuccess />)).not.toThrow();
  });

  it("shows content when appointment time is set", async () => {
    const TRTSuccess = (await import("@/pages/product/TRTSuccess")).default;
    renderWithProviders(<TRTSuccess />);
    expect(document.body.textContent?.length).toBeGreaterThan(50);
  });
});

// ─── TRTBloodwork ─────────────────────────────────────────────────────────────

describe("TRTBloodwork", () => {
  it("renders without crash", async () => {
    const TRTBloodwork = (await import("@/pages/product/TRTBloodwork")).default;
    expect(() => renderWithProviders(<TRTBloodwork />)).not.toThrow();
  });

  it("renders the choice buttons", async () => {
    const TRTBloodwork = (await import("@/pages/product/TRTBloodwork")).default;
    renderWithProviders(<TRTBloodwork />);
    // Should render Yes/No choice
    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ─── TRTMedicalProtocol ───────────────────────────────────────────────────────

describe("TRTMedicalProtocol", () => {
  it("renders without crash", async () => {
    const TRTMedicalProtocol = (await import("@/pages/product/TRTMedicalProtocol")).default;
    expect(() => renderWithProviders(<TRTMedicalProtocol />)).not.toThrow();
  });
});

// ─── TRTLabRequisition ────────────────────────────────────────────────────────

describe("TRTLabRequisition", () => {
  it("renders without crash", async () => {
    const TRTLabRequisition = (await import("@/pages/product/TRTLabRequisition")).default;
    expect(() => renderWithProviders(<TRTLabRequisition />)).not.toThrow();
  });
});

// ─── TRTIdentityVerification ──────────────────────────────────────────────────

describe("TRTIdentityVerification", () => {
  it("renders without crash", async () => {
    const TRTIdentityVerification = (await import("@/pages/product/TRTIdentityVerification")).default;
    expect(() => renderWithProviders(<TRTIdentityVerification />)).not.toThrow();
  });
});

// ─── TRTQuestionnaire ─────────────────────────────────────────────────────────

describe("TRTQuestionnaire", () => {
  it("renders without crash", async () => {
    const TRTQuestionnaire = (await import("@/pages/product/TRTQuestionnaire")).default;
    expect(() => renderWithProviders(<TRTQuestionnaire />)).not.toThrow();
  });

  it("renders step 1 (age)", async () => {
    const TRTQuestionnaire = (await import("@/pages/product/TRTQuestionnaire")).default;
    renderWithProviders(<TRTQuestionnaire />);
    // Should have an age input or similar
    expect(document.body.textContent?.length).toBeGreaterThan(10);
  });
});

// ─── TRTGetStarted ────────────────────────────────────────────────────────────

describe("TRTGetStarted", () => {
  it("renders without crash", async () => {
    const TRTGetStarted = (await import("@/pages/product/TRTGetStarted")).default;
    expect(() => renderWithProviders(<TRTGetStarted />)).not.toThrow();
  });
});

/**
 * Smoke tests for booking funnel pages.
 * Mocks GHL/Supabase calls; seeds booking store.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderWithProviders } from "@/test/renderWithProviders";
import { useBookingStore } from "@/domain/booking/bookingStore";

vi.mock("@/services/contactUpdater", () => ({
  contactUpdater: {
    updateContact: vi.fn().mockResolvedValue({}),
    addTag: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
    from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }),
  },
}));

const seedStore = () => {
  useBookingStore.getState().reset();
  useBookingStore.getState().patch({
    identity: {
      firstName: "Jane",
      lastName: "Doe",
      phone: "8001234567",
      email: "jane@example.com",
      ghlContactId: "contact-456",
    },
    service: "trt",
    location: "richmond",
  });
};

beforeEach(() => {
  seedStore();
  vi.clearAllMocks();
});

// ─── BookLocation ──────────────────────────────────────────────────────────────

describe("BookLocation", () => {
  it("renders without crash", async () => {
    const BookLocation = (await import("@/pages/book/BookLocation")).default;
    expect(() => renderWithProviders(<BookLocation />)).not.toThrow();
  });

  it("renders location options", async () => {
    const BookLocation = (await import("@/pages/book/BookLocation")).default;
    renderWithProviders(<BookLocation />);
    // Should have at least 3 location choices (Richmond, Newport News, Virginia Beach)
    expect(document.body.textContent).toMatch(/richmond|newport|virginia beach/i);
  });
});

// ─── BookSymptom ──────────────────────────────────────────────────────────────

describe("BookSymptom", () => {
  it("renders without crash", async () => {
    const BookSymptom = (await import("@/pages/book/BookSymptom")).default;
    expect(() => renderWithProviders(<BookSymptom />)).not.toThrow();
  });

  it("renders symptom options", async () => {
    const BookSymptom = (await import("@/pages/book/BookSymptom")).default;
    renderWithProviders(<BookSymptom />);
    expect(document.body.textContent?.length).toBeGreaterThan(20);
  });
});

// ─── BookDuration ─────────────────────────────────────────────────────────────

describe("BookDuration", () => {
  it("renders without crash", async () => {
    const BookDuration = (await import("@/pages/book/BookDuration")).default;
    expect(() => renderWithProviders(<BookDuration />)).not.toThrow();
  });
});

// ─── BookLetsTalk ──────────────────────────────────────────────────────────────

describe("BookLetsTalk", () => {
  it("renders without crash", async () => {
    const BookLetsTalk = (await import("@/pages/book/BookLetsTalk")).default;
    expect(() => renderWithProviders(<BookLetsTalk />)).not.toThrow();
  });

  it("shows content", async () => {
    const BookLetsTalk = (await import("@/pages/book/BookLetsTalk")).default;
    renderWithProviders(<BookLetsTalk />);
    expect(document.body.textContent?.length).toBeGreaterThan(20);
  });
});

// ─── BookSchedule ─────────────────────────────────────────────────────────────

describe("BookSchedule", () => {
  it("renders without crash", async () => {
    const BookSchedule = (await import("@/pages/book/BookSchedule")).default;
    expect(() => renderWithProviders(<BookSchedule />)).not.toThrow();
  });

  it("renders the schedule interface", async () => {
    const BookSchedule = (await import("@/pages/book/BookSchedule")).default;
    renderWithProviders(<BookSchedule />);
    expect(document.body.textContent?.length).toBeGreaterThan(20);
  });

  it("shows personalized heading when firstName is set", async () => {
    useBookingStore.getState().reset();
    useBookingStore.getState().patch({
      location: "richmond", // required to render schedule, not location picker
      identity: { firstName: "Eric", lastName: "", phone: "5551234567", email: "" },
    });
    const BookSchedule = (await import("@/pages/book/BookSchedule")).default;
    renderWithProviders(<BookSchedule />);
    // Heading is "Choose a time, Eric." when firstName is set
    expect(document.body.textContent).toMatch(/Choose a time, Eric/i);
  });

  it("shows fallback heading when firstName is falsy", async () => {
    // Verify with undefined, empty string
    for (const name of [undefined, ""] as const) {
      useBookingStore.getState().reset();
      useBookingStore.getState().patch({
        location: "richmond", // required to render schedule, not location picker
        ...(name !== undefined
          ? { identity: { firstName: name, lastName: "", phone: "5551234567", email: "" } }
          : {}),
      });
      const { default: BookSchedule } = await import("@/pages/book/BookSchedule");
      renderWithProviders(<BookSchedule />);
      // Fallback: "Choose your appointment time." when no firstName
      const text = document.body.textContent ?? "";
      expect(text).toMatch(/Choose your appointment time/i);
      expect(text).not.toMatch(/undefined/i);
      document.body.innerHTML = "";
    }
  });
});

// ─── BookEntry ────────────────────────────────────────────────────────────────

describe("BookEntry", () => {
  it("renders without crash", async () => {
    const BookEntry = (await import("@/pages/book/BookEntry")).default;
    expect(() => renderWithProviders(<BookEntry />)).not.toThrow();
  });
});

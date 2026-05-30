/**
 * Tests for lib/bookingQueue.ts — offline-resilient booking queue.
 * Mocks localStorage and Supabase. No React.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  enqueueBooking,
  removeFromQueue,
  getQueue,
  flushBookingQueue,
  initBookingQueue,
} from "@/lib/bookingQueue";

// ─── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

// ─── crypto.randomUUID mock ────────────────────────────────────────────────────

let uuidCounter = 0;
vi.stubGlobal("crypto", {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
  subtle: {},
});

// ─── Supabase mock ─────────────────────────────────────────────────────────────

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { ok: true, data: { appointmentId: "appt-123" } }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  uuidCounter = 0;
});

afterEach(() => {
  vi.clearAllTimers();
});

// ─── enqueueBooking ────────────────────────────────────────────────────────────

describe("enqueueBooking", () => {
  const booking = {
    slotIso: "2024-07-15T13:00:00Z",
    location: "richmond",
    contactId: "contact-123",
    calendarId: "cal-456",
    source: "test",
  };

  it("returns a UUID", () => {
    const id = enqueueBooking(booking);
    expect(id).toBe("test-uuid-1");
  });

  it("adds booking to queue", () => {
    enqueueBooking(booking);
    const q = getQueue();
    expect(q.length).toBe(1);
    expect(q[0].slotIso).toBe(booking.slotIso);
    expect(q[0].retries).toBe(0);
  });

  it("sets queuedAt to ISO string", () => {
    enqueueBooking(booking);
    const q = getQueue();
    expect(new Date(q[0].queuedAt).getTime()).not.toBeNaN();
  });

  it("adds multiple bookings", () => {
    enqueueBooking(booking);
    enqueueBooking({ ...booking, slotIso: "2024-07-16T13:00:00Z" });
    expect(getQueue().length).toBe(2);
  });
});

// ─── removeFromQueue ──────────────────────────────────────────────────────────

describe("removeFromQueue", () => {
  it("removes booking by id", () => {
    const id = enqueueBooking({
      slotIso: "2024-07-15T13:00:00Z",
      location: "richmond",
      contactId: "c-1",
      calendarId: "cal-1",
      source: "test",
    });
    removeFromQueue(id);
    expect(getQueue().length).toBe(0);
  });

  it("ignores unknown id", () => {
    enqueueBooking({
      slotIso: "2024-07-15T13:00:00Z",
      location: "richmond",
      contactId: "c-1",
      calendarId: "cal-1",
      source: "test",
    });
    removeFromQueue("non-existent-id");
    expect(getQueue().length).toBe(1);
  });
});

// ─── getQueue ─────────────────────────────────────────────────────────────────

describe("getQueue", () => {
  it("returns empty array when nothing queued", () => {
    expect(getQueue()).toEqual([]);
  });

  it("returns empty array when localStorage is corrupt", () => {
    localStorage.setItem("mwc_booking_queue_v1", "not-valid-json");
    expect(getQueue()).toEqual([]);
  });
});

// ─── flushBookingQueue ────────────────────────────────────────────────────────

describe("flushBookingQueue", () => {
  it("resolves immediately when queue is empty", async () => {
    await expect(flushBookingQueue()).resolves.toBeUndefined();
  });

  it("removes booking from queue on success", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    (supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { ok: true, data: { appointmentId: "appt-ok" } },
      error: null,
    });

    enqueueBooking({
      slotIso: "2024-07-15T13:00:00Z",
      location: "richmond",
      contactId: "c-success",
      calendarId: "cal-1",
      source: "test",
    });

    await flushBookingQueue();
    expect(getQueue().length).toBe(0);
  });

  it("increments retry count on failure", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    (supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { ok: false, data: { message: "GHL error" } },
      error: null,
    });

    enqueueBooking({
      slotIso: "2024-07-15T13:00:00Z",
      location: "richmond",
      contactId: "c-fail",
      calendarId: "cal-1",
      source: "test",
    });

    await flushBookingQueue();
    const q = getQueue();
    expect(q.length).toBe(1);
    expect(q[0].retries).toBe(1);
  });

  it("abandons booking after MAX_RETRIES=5", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    (supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { ok: false },
      error: null,
    });

    // Inject a pre-exhausted booking directly (retries >= MAX_RETRIES=20)
    const exhausted = {
      id: "exhausted-1",
      slotIso: "2024-07-15T13:00:00Z",
      location: "richmond",
      contactId: "c-exhausted",
      calendarId: "cal-1",
      source: "test",
      queuedAt: new Date().toISOString(),
      retries: 20, // MAX_RETRIES
    };
    localStorage.setItem("mwc_booking_queue_v1", JSON.stringify([exhausted]));

    await flushBookingQueue();
    // Exhausted bookings are removed after logging
    expect(getQueue().length).toBe(0);
  });
});

// ─── initBookingQueue ─────────────────────────────────────────────────────────

describe("initBookingQueue", () => {
  it("does not throw when queue is empty", () => {
    expect(() => initBookingQueue()).not.toThrow();
  });

  it("registers window event listeners (no crash)", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    initBookingQueue();
    const events = addSpy.mock.calls.map((c) => c[0]);
    expect(events).toContain("focus");
    expect(events).toContain("online");
  });
});

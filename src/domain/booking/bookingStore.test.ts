/**
 * Tests for domain/booking/bookingStore.ts and bookingEntry.ts.
 * Covers Zustand store actions and enterBookingFunnel routing logic.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBookingStore, isKnownService } from "@/domain/booking/bookingStore";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";

// ─── isKnownService ────────────────────────────────────────────────────────────

describe("isKnownService", () => {
  it("accepts trt", () => expect(isKnownService("trt")).toBe(true));
  it("accepts ed", () => expect(isKnownService("ed")).toBe(true));
  it("accepts wl", () => expect(isKnownService("wl")).toBe(true));
  it("rejects unknown string", () => expect(isKnownService("other")).toBe(false));
  it("rejects null", () => expect(isKnownService(null)).toBe(false));
  it("rejects undefined", () => expect(isKnownService(undefined)).toBe(false));
  it("rejects empty string", () => expect(isKnownService("")).toBe(false));
});

// ─── bookingStore ─────────────────────────────────────────────────────────────

const identity = {
  firstName: "John",
  lastName: "Smith",
  phone: "8001234567",
  email: "john@example.com",
};

beforeEach(() => {
  useBookingStore.getState().reset();
});

describe("useBookingStore — reset", () => {
  it("clears all fields to undefined", () => {
    useBookingStore.getState().setIdentity(identity);
    useBookingStore.getState().setService("trt");
    useBookingStore.getState().reset();
    const s = useBookingStore.getState();
    expect(s.identity).toBeUndefined();
    expect(s.service).toBeUndefined();
    expect(s.location).toBeUndefined();
  });
});

describe("useBookingStore — setIdentity", () => {
  it("stores identity", () => {
    useBookingStore.getState().setIdentity(identity);
    expect(useBookingStore.getState().identity).toEqual(identity);
  });
});

describe("useBookingStore — setService", () => {
  it("stores service", () => {
    useBookingStore.getState().setService("ed");
    expect(useBookingStore.getState().service).toBe("ed");
  });

  it("clears service with undefined", () => {
    useBookingStore.getState().setService("trt");
    useBookingStore.getState().setService(undefined);
    expect(useBookingStore.getState().service).toBeUndefined();
  });
});

describe("useBookingStore — setLocation", () => {
  it("stores location", () => {
    useBookingStore.getState().setLocation("richmond");
    expect(useBookingStore.getState().location).toBe("richmond");
  });
});

describe("useBookingStore — setSymptom", () => {
  it("stores symptom", () => {
    useBookingStore.getState().setSymptom("energy");
    expect(useBookingStore.getState().symptom).toBe("energy");
  });

  it("stores note only when symptom is 'other'", () => {
    useBookingStore.getState().setSymptom("other", "Custom note");
    expect(useBookingStore.getState().note).toBe("Custom note");
  });

  it("clears note when symptom is not 'other'", () => {
    useBookingStore.getState().setSymptom("other", "Custom note");
    useBookingStore.getState().setSymptom("energy", "ignored");
    expect(useBookingStore.getState().note).toBeUndefined();
  });
});

describe("useBookingStore — setDuration", () => {
  it("stores duration and urgencyTier", () => {
    useBookingStore.getState().setDuration("6to12mo", "building");
    const s = useBookingStore.getState();
    expect(s.duration).toBe("6to12mo");
    expect(s.urgencyTier).toBe("building");
  });
});

describe("useBookingStore — setAppointmentTime", () => {
  it("stores ISO appointment time", () => {
    useBookingStore.getState().setAppointmentTime("2024-07-15T13:00:00Z");
    expect(useBookingStore.getState().appointmentTime).toBe("2024-07-15T13:00:00Z");
  });
});

describe("useBookingStore — patch", () => {
  it("merges partial state", () => {
    useBookingStore.getState().patch({
      source: "test-source",
      lpSlug: "/trt",
    });
    const s = useBookingStore.getState();
    expect(s.source).toBe("test-source");
    expect(s.lpSlug).toBe("/trt");
  });

  it("patch does not overwrite unrelated fields", () => {
    useBookingStore.getState().setService("trt");
    useBookingStore.getState().patch({ source: "new-source" });
    expect(useBookingStore.getState().service).toBe("trt");
  });
});

// ─── enterBookingFunnel ────────────────────────────────────────────────────────

describe("enterBookingFunnel", () => {
  it("navigates to /book/schedule when location is set", () => {
    const navigate = vi.fn();
    enterBookingFunnel(
      { identity, service: "trt", location: "richmond" },
      navigate,
    );
    expect(navigate).toHaveBeenCalledWith("/book/schedule");
  });

  it("navigates to /book/location when no location", () => {
    const navigate = vi.fn();
    enterBookingFunnel({ identity, service: "trt" }, navigate);
    expect(navigate).toHaveBeenCalledWith("/book/location");
  });

  it("resets store before patching", () => {
    useBookingStore.getState().setService("wl");
    const navigate = vi.fn();
    enterBookingFunnel({ identity, service: "trt" }, navigate);
    // After enter, service should be trt (from args), not wl
    expect(useBookingStore.getState().service).toBe("trt");
  });

  it("stores identity in booking store", () => {
    const navigate = vi.fn();
    enterBookingFunnel({ identity }, navigate);
    expect(useBookingStore.getState().identity).toEqual(identity);
  });

  it("stores source and lpSlug", () => {
    const navigate = vi.fn();
    enterBookingFunnel(
      { identity, source: "hero-form", lpSlug: "/trt" },
      navigate,
    );
    const s = useBookingStore.getState();
    expect(s.source).toBe("hero-form");
    expect(s.lpSlug).toBe("/trt");
  });
});

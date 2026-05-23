/**
 * Tests for lib/wpHandoff.ts — WordPress handoff helpers.
 *
 * The HMAC-signed URL param approach was replaced by Hammad's Gravity Forms →
 * lead-intake → opaque token flow. This file tests the remaining helpers:
 *   - pushWpPartialLead (fire-and-forget GHL upsert)
 *   - WpHandoffPayload type shape
 *
 * Token exchange itself (wp-token-exchange edge function) is tested at the
 * Supabase function level and in BookEntry integration tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { pushWpPartialLead, type WpHandoffPayload } from "@/lib/wpHandoff";

// ── pushWpPartialLead ─────────────────────────────────────────────────────────

const mockUpsertContact = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/ghlCalendars", () => ({
  upsertContact: (...args: unknown[]) => mockUpsertContact(...args),
}));

beforeEach(() => {
  mockUpsertContact.mockClear();
});

describe("pushWpPartialLead", () => {
  it("calls upsertContact with formatted phone and partial tags", async () => {
    const payload: WpHandoffPayload = {
      firstName: "John",
      phone:     "8001234567",
      email:     "john@example.com",
    };

    pushWpPartialLead(payload);

    // Fire-and-forget — wait for the dynamic import microtask
    await vi.waitFor(() => expect(mockUpsertContact).toHaveBeenCalledTimes(1));

    const call = mockUpsertContact.mock.calls[0][0];
    expect(call.firstName).toBe("John");
    expect(call.phone).toBe("+18001234567");
    expect(call.email).toBe("john@example.com");
    expect(call.source).toBe("wordpress-form");
    expect(call.tags).toContain("source:wp-form");
    expect(call.tags).toContain("status:partial");
  });

  it("strips non-digit characters from phone before E.164 format", async () => {
    const payload: WpHandoffPayload = {
      firstName: "Jane",
      phone:     "(800) 123-4567",
    };

    pushWpPartialLead(payload);
    await vi.waitFor(() => expect(mockUpsertContact).toHaveBeenCalledTimes(1));

    expect(mockUpsertContact.mock.calls[0][0].phone).toBe("+18001234567");
  });

  it("omits email when not provided", async () => {
    const payload: WpHandoffPayload = {
      firstName: "Bob",
      phone:     "8009876543",
    };

    pushWpPartialLead(payload);
    await vi.waitFor(() => expect(mockUpsertContact).toHaveBeenCalledTimes(1));

    expect(mockUpsertContact.mock.calls[0][0].email).toBeUndefined();
  });

  it("includes service in customFields when provided", async () => {
    const payload: WpHandoffPayload = {
      firstName: "Sam",
      phone:     "8005550001",
      service:   "trt",
    };

    pushWpPartialLead(payload);
    await vi.waitFor(() => expect(mockUpsertContact).toHaveBeenCalledTimes(1));

    expect(mockUpsertContact.mock.calls[0][0].customFields?.mwc_funnel_service).toBe("trt");
  });

  it("omits customFields when service is not provided", async () => {
    const payload: WpHandoffPayload = {
      firstName: "Alex",
      phone:     "8005550002",
    };

    pushWpPartialLead(payload);
    await vi.waitFor(() => expect(mockUpsertContact).toHaveBeenCalledTimes(1));

    expect(mockUpsertContact.mock.calls[0][0].customFields).toBeUndefined();
  });

  it("does not throw if upsertContact rejects", async () => {
    mockUpsertContact.mockRejectedValueOnce(new Error("GHL down"));

    const payload: WpHandoffPayload = { firstName: "Test", phone: "8005550000" };
    expect(() => pushWpPartialLead(payload)).not.toThrow();

    // No unhandled rejection — the catch swallows it
    await new Promise((r) => setTimeout(r, 20));
  });
});

// ── WpHandoffPayload type shape ───────────────────────────────────────────────

describe("WpHandoffPayload", () => {
  it("accepts a minimal payload with only firstName and phone", () => {
    const p: WpHandoffPayload = { firstName: "Eric", phone: "4255551234" };
    expect(p.firstName).toBe("Eric");
    expect(p.phone).toBe("4255551234");
    expect(p.email).toBeUndefined();
    expect(p.location).toBeUndefined();
    expect(p.service).toBeUndefined();
  });

  it("accepts a full payload with all optional fields", () => {
    const p: WpHandoffPayload = {
      firstName: "Eric",
      phone:     "4255551234",
      email:     "eric@example.com",
      location:  "richmond",
      service:   "trt",
    };
    expect(p.location).toBe("richmond");
    expect(p.service).toBe("trt");
  });
});

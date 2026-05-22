/**
 * LeadResyncer — unit tests.
 * Mocks supabase client and verifies GHL resync paths.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockInvoke    = vi.fn();
const mockUpdate    = vi.fn();
const mockEq        = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: mockInvoke },
    from: () => ({
      update: (vals: unknown) => { mockUpdate(vals); return { eq: mockEq }; },
    }),
  },
}));

vi.mock("@/lib/env", () => ({ APP_ENV: "test" }));

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeLead = (overrides: Partial<{
  id: string; name: string | null; email: string | null;
  phone: string | null; location: string | null; source: string | null;
}> = {}) => ({
  id:       "lead-1",
  name:     "John Smith",
  email:    "john@example.com",
  phone:    "5550001234",
  location: "richmond",
  source:   "lp-hero",
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("resyncLead", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockEq.mockResolvedValue({ error: null });
  });

  it("returns ok:true and contactId when GHL returns success", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { ok: true, data: { contact: { id: "ghl-123" } } },
      error: null,
    });

    const { resyncLead } = await import("./LeadResyncer");
    const result = await resyncLead(makeLead());

    expect(result.ok).toBe(true);
    expect(result.contactId).toBe("ghl-123");
    expect(result.error).toBeUndefined();
  });

  it("updates crm_status to synced on success", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { ok: true, data: { contact: { id: "ghl-456" } } },
      error: null,
    });

    const { resyncLead } = await import("./LeadResyncer");
    await resyncLead(makeLead());

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ crm_status: "synced", crm_contact_id: "ghl-456", crm_error: null })
    );
  });

  it("returns ok:false and error message when GHL invoke fails", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: "Network error" },
    });

    const { resyncLead } = await import("./LeadResyncer");
    const result = await resyncLead(makeLead());

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Network error");
  });

  it("updates crm_status to failed when GHL errors", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: "Timeout" },
    });

    const { resyncLead } = await import("./LeadResyncer");
    await resyncLead(makeLead());

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ crm_status: "failed", crm_error: "Timeout" })
    );
  });

  it("splits name into firstName/lastName correctly", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { ok: true, data: { contact: { id: "ghl-789" } } },
      error: null,
    });

    const { resyncLead } = await import("./LeadResyncer");
    await resyncLead(makeLead({ name: "Robert James Smith" }));

    expect(mockInvoke).toHaveBeenCalledWith(
      "ghl-proxy",
      expect.objectContaining({
        body: expect.objectContaining({
          body: expect.objectContaining({ firstName: "Robert", lastName: "Robert James Smith".split(" ").slice(1).join(" ") }),
        }),
      })
    );
  });

  it("handles null name with Guest fallback", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { ok: true, data: { id: "ghl-guest" } },
      error: null,
    });

    const { resyncLead } = await import("./LeadResyncer");
    const result = await resyncLead(makeLead({ name: null }));

    expect(result.ok).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith(
      "ghl-proxy",
      expect.objectContaining({
        body: expect.objectContaining({
          body: expect.objectContaining({ firstName: "Guest" }),
        }),
      })
    );
  });

  it("falls back to data.data.id when contact.id is absent", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { ok: true, data: { id: "flat-id-999" } },
      error: null,
    });

    const { resyncLead } = await import("./LeadResyncer");
    const result = await resyncLead(makeLead());

    expect(result.contactId).toBe("flat-id-999");
  });
});

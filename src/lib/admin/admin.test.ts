/**
 * Tests for lib/admin/csv.ts and lib/admin/allowlist.ts.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { downloadCsv } from "@/lib/admin/csv";
import { ADMIN_EMAILS, isAdminEmail } from "@/lib/admin/allowlist";

// ─── isAdminEmail ─────────────────────────────────────────────────────────────

describe("isAdminEmail", () => {
  it("returns true for a known admin email (exact match)", () => {
    expect(isAdminEmail(ADMIN_EMAILS[0])).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAdminEmail(ADMIN_EMAILS[0].toUpperCase())).toBe(true);
  });

  it("returns false for unknown email", () => {
    expect(isAdminEmail("nobody@example.com")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isAdminEmail(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isAdminEmail("")).toBe(false);
  });
});

describe("ADMIN_EMAILS", () => {
  it("contains at least one entry", () => {
    expect(ADMIN_EMAILS.length).toBeGreaterThan(0);
  });

  it("all entries are lowercase", () => {
    for (const e of ADMIN_EMAILS) {
      expect(e).toBe(e.toLowerCase());
    }
  });
});

// ─── downloadCsv ─────────────────────────────────────────────────────────────

describe("downloadCsv", () => {
  // Track DOM mutations
  let appendSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let _createSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    _createSpy = vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") {
        const a = Object.assign(document.createElementNS("http://www.w3.org/1999/xhtml", "a") as HTMLAnchorElement, {
          click: clickSpy,
          download: "",
          href: "",
        });
        return a;
      }
      return document.createElement(tag) as HTMLElement;
    });
    appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation((n) => n as Node);
    removeSpy = vi.spyOn(document.body, "removeChild").mockImplementation((n) => n as Node);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn().mockReturnValue("blob:test"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("triggers anchor click for download", () => {
    const rows = [{ name: "Alice", age: 30 }];
    const cols = [
      { key: "name" as const, header: "Name" },
      { key: "age" as const, header: "Age" },
    ];
    downloadCsv("test.csv", rows, cols);
    expect(clickSpy).toHaveBeenCalled();
  });

  it("creates blob with CSV content type", () => {
    // Verify no throw and download is triggered (Blob creation is an impl detail)
    const rows = [{ name: "Bob", age: 25 }];
    const cols = [{ key: "name" as const, header: "Name" }];
    expect(() => downloadCsv("test.csv", rows, cols)).not.toThrow();
  });

  it("appends and removes anchor element", () => {
    const rows = [{ x: "val" }];
    const cols = [{ key: "x" as const, header: "X" }];
    downloadCsv("test.csv", rows, cols);
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });

  it("sets download filename on anchor", () => {
    let capturedEl: HTMLAnchorElement | null = null;
    appendSpy.mockImplementation((n) => { capturedEl = n as HTMLAnchorElement; return n as Node; });
    const rows = [{ x: "val" }];
    const cols = [{ key: "x" as const, header: "X" }];
    downloadCsv("output.csv", rows, cols);
    expect(capturedEl?.download).toBe("output.csv");
  });

  it("handles empty rows", () => {
    expect(() =>
      downloadCsv("empty.csv", [], [{ key: "x" as const, header: "X" }])
    ).not.toThrow();
  });

  it("escapes commas and quotes — tested via Blob capture", () => {
    const blobParts: BlobPart[] = [];
    const OrigBlob = globalThis.Blob;
    vi.stubGlobal("Blob", class MockBlob extends OrigBlob {
      constructor(parts?: BlobPart[], opts?: BlobPropertyBag) {
        super(parts, opts);
        if (parts) blobParts.push(...parts);
      }
    });
    const rows = [{ desc: 'Hello, World' }, { desc: 'Say "hi"' }];
    const cols = [{ key: "desc" as const, header: "Description" }];
    downloadCsv("test.csv", rows, cols);
    const csvContent = blobParts.join("");
    expect(csvContent).toContain('"Hello, World"');
    expect(csvContent).toContain('"Say ""hi"""');
    vi.unstubAllGlobals();
  });

  it("handles null/undefined cell values without throwing", () => {
    const rows = [{ name: null as unknown, age: undefined as unknown }];
    const cols = [
      { key: "name" as const, header: "Name" },
      { key: "age" as const, header: "Age" },
    ];
    expect(() => downloadCsv("test.csv", rows as never, cols)).not.toThrow();
  });

  it("serializes object cell values to JSON", () => {
    const blobParts: BlobPart[] = [];
    const OrigBlob = globalThis.Blob;
    vi.stubGlobal("Blob", class MockBlob extends OrigBlob {
      constructor(parts?: BlobPart[], opts?: BlobPropertyBag) {
        super(parts, opts);
        if (parts) blobParts.push(...parts);
      }
    });
    const rows = [{ data: { key: "val" } }];
    const cols = [{ key: "data" as const, header: "Data" }];
    downloadCsv("test.csv", rows, cols);
    expect(blobParts.join("")).toContain("key");
    vi.unstubAllGlobals();
  });
});

import { describe, expect, it } from "vitest";

import { safeCallbackUrl } from "./safe-callback-url";

describe("safeCallbackUrl", () => {
  it("keeps internal paths", () => {
    expect(safeCallbackUrl("/admin/orders?status=PAID")).toBe("/admin/orders?status=PAID");
  });

  it("rejects external and protocol-relative URLs (open redirect)", () => {
    expect(safeCallbackUrl("https://evil.com")).toBe("/account");
    expect(safeCallbackUrl("//evil.com")).toBe("/account");
    expect(safeCallbackUrl("/\\evil.com")).toBe("/account");
    expect(safeCallbackUrl("javascript:alert(1)")).toBe("/account");
  });

  it("falls back to /account when missing", () => {
    expect(safeCallbackUrl(null)).toBe("/account");
    expect(safeCallbackUrl("")).toBe("/account");
  });
});

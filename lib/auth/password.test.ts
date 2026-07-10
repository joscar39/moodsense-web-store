import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("segura1234");
    expect(hash).not.toContain("segura1234");
    await expect(verifyPassword("segura1234", hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("segura1234");
    await expect(verifyPassword("otra-clave1", hash)).resolves.toBe(false);
  });

  it("produces a different hash per call (unique salt)", async () => {
    const [a, b] = await Promise.all([hashPassword("segura1234"), hashPassword("segura1234")]);
    expect(a).not.toBe(b);
  });
});

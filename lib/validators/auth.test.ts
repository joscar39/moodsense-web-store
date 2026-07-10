import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./auth";

const validInput = {
  name: "Ana Torres",
  email: "Ana@Example.com",
  password: "segura1234",
};

describe("registerSchema", () => {
  it("accepts valid input and lowercases the email", () => {
    const result = registerSchema.parse(validInput);
    expect(result.email).toBe("ana@example.com");
    expect(result.name).toBe("Ana Torres");
  });

  it("rejects invalid emails", () => {
    expect(registerSchema.safeParse({ ...validInput, email: "no-es-email" }).success).toBe(false);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(registerSchema.safeParse({ ...validInput, password: "abc1" }).success).toBe(false);
  });

  it("rejects passwords longer than 72 characters (bcrypt limit)", () => {
    expect(registerSchema.safeParse({ ...validInput, password: "a1".repeat(37) }).success).toBe(
      false
    );
  });

  it("rejects passwords without a number", () => {
    expect(registerSchema.safeParse({ ...validInput, password: "sinnumeros" }).success).toBe(false);
  });

  it("rejects passwords without a letter", () => {
    expect(registerSchema.safeParse({ ...validInput, password: "12345678" }).success).toBe(false);
  });

  it("rejects names shorter than 2 characters", () => {
    expect(registerSchema.safeParse({ ...validInput, name: "A" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials and lowercases the email", () => {
    const result = loginSchema.parse({ email: "USER@example.com", password: "x" });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "user@example.com", password: "" }).success).toBe(false);
  });

  it("rejects a missing email", () => {
    expect(loginSchema.safeParse({ password: "algo1234" }).success).toBe(false);
  });
});

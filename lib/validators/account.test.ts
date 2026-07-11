import { describe, expect, it } from "vitest";

import { addressSchema, passwordChangeSchema, profileSchema } from "./account";

describe("profileSchema", () => {
  it("trims and accepts a valid name", () => {
    expect(profileSchema.parse({ name: "  Ana Torres " }).name).toBe("Ana Torres");
  });

  it("rejects too-short names", () => {
    expect(profileSchema.safeParse({ name: "A" }).success).toBe(false);
  });
});

describe("passwordChangeSchema", () => {
  const valid = { currentPassword: "vieja1234", newPassword: "nueva5678" };

  it("accepts a valid change", () => {
    expect(passwordChangeSchema.safeParse(valid).success).toBe(true);
  });

  it("applies the password policy to the new password", () => {
    expect(passwordChangeSchema.safeParse({ ...valid, newPassword: "corta1" }).success).toBe(false);
    expect(passwordChangeSchema.safeParse({ ...valid, newPassword: "sinnumeros" }).success).toBe(
      false
    );
  });

  it("rejects reusing the current password", () => {
    expect(
      passwordChangeSchema.safeParse({
        currentPassword: "misma1234",
        newPassword: "misma1234",
      }).success
    ).toBe(false);
  });
});

describe("addressSchema", () => {
  const valid = {
    fullName: "Ana Torres",
    line1: "Calle El Sol 12",
    city: "Santiago",
    postalCode: "51000",
    country: "do",
  };

  it("accepts a minimal address and uppercases the country", () => {
    const parsed = addressSchema.parse(valid);
    expect(parsed.country).toBe("DO");
    expect(parsed.isDefault).toBe(false);
    expect(parsed.line2).toBeUndefined();
  });

  it("converts empty optional strings to undefined", () => {
    const parsed = addressSchema.parse({ ...valid, line2: "", state: "", phone: "" });
    expect(parsed.line2).toBeUndefined();
    expect(parsed.state).toBeUndefined();
    expect(parsed.phone).toBeUndefined();
  });

  it("rejects non ISO-3166 country codes", () => {
    expect(addressSchema.safeParse({ ...valid, country: "DOM" }).success).toBe(false);
    expect(addressSchema.safeParse({ ...valid, country: "1A" }).success).toBe(false);
  });

  it("rejects a missing line1", () => {
    expect(addressSchema.safeParse({ ...valid, line1: "" }).success).toBe(false);
  });
});

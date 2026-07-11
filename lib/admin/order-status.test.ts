import { describe, expect, it } from "vitest";

import { canTransition } from "./order-status";

describe("canTransition", () => {
  it("allows the fulfillment flow PAID → SHIPPED → DELIVERED", () => {
    expect(canTransition("PAID", "SHIPPED")).toBe(true);
    expect(canTransition("SHIPPED", "DELIVERED")).toBe(true);
  });

  it("allows refunds after payment, shipping or delivery", () => {
    expect(canTransition("PAID", "REFUNDED")).toBe(true);
    expect(canTransition("SHIPPED", "REFUNDED")).toBe(true);
    expect(canTransition("DELIVERED", "REFUNDED")).toBe(true);
  });

  it("never allows setting PAID manually", () => {
    expect(canTransition("PENDING", "PAID")).toBe(false);
    expect(canTransition("CANCELLED", "PAID")).toBe(false);
  });

  it("treats CANCELLED and REFUNDED as terminal", () => {
    expect(canTransition("CANCELLED", "SHIPPED")).toBe(false);
    expect(canTransition("REFUNDED", "PAID")).toBe(false);
    expect(canTransition("REFUNDED", "DELIVERED")).toBe(false);
  });

  it("does not allow skipping shipment", () => {
    expect(canTransition("PAID", "DELIVERED")).toBe(false);
  });

  it("does not allow un-shipping", () => {
    expect(canTransition("SHIPPED", "PAID")).toBe(false);
    expect(canTransition("DELIVERED", "SHIPPED")).toBe(false);
  });
});

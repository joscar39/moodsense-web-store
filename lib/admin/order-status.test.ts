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

  it("never allows setting PAID manually on Stripe orders", () => {
    expect(canTransition("PENDING", "PAID")).toBe(false);
    expect(canTransition("CANCELLED", "PAID")).toBe(false);
  });

  it("allows confirming or cancelling a WhatsApp order awaiting payment", () => {
    expect(canTransition("PENDING_PAYMENT", "PAID")).toBe(true);
    expect(canTransition("PENDING_PAYMENT", "CANCELLED")).toBe(true);
    expect(canTransition("PENDING_PAYMENT", "SHIPPED")).toBe(false);
  });

  it("never allows expiring manually (only the sweeper does)", () => {
    expect(canTransition("PENDING_PAYMENT", "EXPIRED")).toBe(false);
    expect(canTransition("PENDING", "EXPIRED")).toBe(false);
  });

  it("treats CANCELLED, EXPIRED and REFUNDED as terminal", () => {
    expect(canTransition("CANCELLED", "SHIPPED")).toBe(false);
    expect(canTransition("EXPIRED", "PAID")).toBe(false);
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

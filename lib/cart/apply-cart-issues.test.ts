import { describe, expect, it, vi } from "vitest";

import { applyCartIssues } from "./apply-cart-issues";
import { maxSelectable } from "./cart-logic";

const jsonResponse = (body: unknown, status = 409) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const cartActions = () => ({ setQuantity: vi.fn(), removeItem: vi.fn() });

describe("maxSelectable", () => {
  it("caps by stock, never below 1 nor above the per-line limit", () => {
    expect(maxSelectable(3)).toBe(3);
    expect(maxSelectable(0)).toBe(1);
    expect(maxSelectable(500)).toBe(10);
  });
});

describe("applyCartIssues", () => {
  it("syncs the cart with the per-item issues and returns their messages", async () => {
    const cart = cartActions();
    const messages = await applyCartIssues(
      jsonResponse({
        error: {
          message: "x",
          details: [
            {
              variantId: "v1",
              code: "INSUFFICIENT_STOCK",
              message: "Solo quedan 2",
              availableStock: 2,
            },
            { variantId: "v2", code: "INACTIVE", message: "Ya no está disponible" },
          ],
        },
      }),
      cart,
      "fallback"
    );
    expect(cart.setQuantity).toHaveBeenCalledWith("v1", 2);
    expect(cart.removeItem).toHaveBeenCalledWith("v2");
    expect(messages).toEqual(["Solo quedan 2", "Ya no está disponible"]);
  });

  it("ignores non-array details (validation errors) and returns the error message", async () => {
    const cart = cartActions();
    const messages = await applyCartIssues(
      jsonResponse({ error: { message: "Datos inválidos.", details: { phone: ["x"] } } }, 400),
      cart,
      "fallback"
    );
    expect(cart.setQuantity).not.toHaveBeenCalled();
    expect(messages).toEqual(["Datos inválidos."]);
  });

  it("falls back when the body is not JSON", async () => {
    const messages = await applyCartIssues(
      new Response("Bad Gateway", { status: 502 }),
      cartActions(),
      "No se pudo crear el pedido."
    );
    expect(messages).toEqual(["No se pudo crear el pedido."]);
  });
});

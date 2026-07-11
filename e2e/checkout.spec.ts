import { expect, test } from "@playwright/test";

test.describe("checkout manual (WhatsApp)", () => {
  test("PDP → carrito → checkout → pedido PENDING_PAYMENT con stock reservado", async ({
    page,
  }) => {
    // 1. PDP: elegir talla y añadir al carrito.
    await page.goto("/products/cloud-heavy-hoodie");
    await page.getByRole("radio", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await expect(page.getByText("Añadido al carrito")).toBeVisible();

    // 2. Carrito: línea presente y pasar al checkout.
    await page.goto("/cart");
    await expect(page.getByRole("link", { name: "Cloud Heavy Hoodie" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Realizar pedido" }).click();
    await page.waitForURL("**/checkout");

    // 3. Checkout: contacto + envío.
    await page.getByLabel("Nombre completo").fill("Cliente Playwright");
    await page.getByLabel("WhatsApp / Teléfono").fill("+1 809 555 0199");
    await page.getByLabel("Dirección", { exact: true }).fill("Av. E2E 123");
    await page.getByLabel("Ciudad").fill("Santo Domingo");
    await page.getByRole("button", { name: "Realizar pedido" }).click();

    // 4. Confirmación: pedido apartado, estado pago pendiente, carrito vacío.
    await page.waitForURL("**/checkout/confirmation/**");
    await expect(page.getByRole("heading", { name: /Gracias, Cliente/ })).toBeVisible();
    await expect(page.getByText("stock reservado")).toBeVisible();
    await expect(page.getByText("Pago pendiente")).toBeVisible();
    await expect(page.getByText("1 × Cloud Heavy Hoodie")).toBeVisible();

    await page.goto("/cart");
    await expect(page.getByText("Tu carrito está vacío.")).toBeVisible();
  });

  test("el stock del carrito se limita a lo disponible", async ({ page }) => {
    await page.goto("/products/atlas-6-panel-cap"); // talla única
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await expect(page.getByText("Añadido al carrito")).toBeVisible();

    await page.goto("/cart");
    // El botón de sumar se deshabilita al llegar al stock disponible.
    const plus = page.getByRole("button", { name: "Sumar uno" });
    for (let i = 0; i < 30 && (await plus.isEnabled()); i += 1) {
      await plus.click();
    }
    await expect(plus).toBeDisabled();
  });
});

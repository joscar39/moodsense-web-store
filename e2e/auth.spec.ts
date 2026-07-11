import { expect, test } from "@playwright/test";

const uniqueEmail = () => `e2e-${Date.now()}@test.dev`;

test.describe("autenticación", () => {
  test("registro → auto-login → área de cuenta", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Nombre").fill("E2E Playwright");
    await page.getByLabel("Email").fill(uniqueEmail());
    await page.getByLabel("Contraseña").fill("clave-e2e-1234");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await page.waitForURL("**/account");
    await expect(page.getByRole("heading", { name: /Hola, E2E/ })).toBeVisible();
  });

  test("login con usuario del seed y logout", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("cliente@moodsense.dev");
    await page.getByLabel("Contraseña").fill("cliente1234");
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/account");
    await expect(page.getByRole("heading", { name: /Hola, Cliente/ })).toBeVisible();

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/account"));
  });

  test("credenciales incorrectas muestran error y no crean sesión", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("cliente@moodsense.dev");
    await page.getByLabel("Contraseña").fill("clave-incorrecta-1");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("/account anónimo redirige a login", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });

  test("un USER no puede entrar a /admin", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("cliente@moodsense.dev");
    await page.getByLabel("Contraseña").fill("cliente1234");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/account");

    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Administración" })).not.toBeVisible();
  });

  test("el ADMIN ve el dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@moodsense.dev");
    await page.getByLabel("Contraseña").fill("admin1234");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/account");

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Administración" })).toBeVisible();
    await expect(page.getByText("Ingresos totales")).toBeVisible();
  });
});

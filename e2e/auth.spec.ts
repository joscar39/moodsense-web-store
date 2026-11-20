import { expect, test } from "@playwright/test";

// Email distinto en cada ejecución para que el registro no choque con usuarios previos.
const uniqueEmail = () => `e2e-${Date.now()}@test.dev`;

test.describe("autenticación", () => {
  // Un visitante nuevo se registra y entra directo a su cuenta (auto-login).
  test("registro → auto-login → área de cuenta", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Nombre").fill("E2E Playwright");
    await page.getByLabel("Email").fill(uniqueEmail());
    await page.getByLabel("Contraseña").fill("clave-e2e-1234");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await page.waitForURL("**/account");
    await expect(page.getByRole("heading", { name: /Hola, E2E/ })).toBeVisible();
  });

  // El cliente del seed inicia sesión, ve su cuenta y cierra sesión.
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

  // Con una contraseña errónea se muestra el error y el usuario sigue en /login.
  test("credenciales incorrectas muestran error y no crean sesión", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("cliente@moodsense.dev");
    await page.getByLabel("Contraseña").fill("clave-incorrecta-1");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  // Un visitante sin sesión que abre /account es enviado al login.
  test("/account anónimo redirige a login", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });

  // Un cliente normal (USER) es rechazado al intentar abrir el panel admin.
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

  // El administrador inicia sesión y ve el dashboard de ventas.
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

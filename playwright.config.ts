import { defineConfig, devices } from "@playwright/test";

/**
 * E2E de flujos críticos (auth y checkout) contra el build de producción.
 * Entrada: `npm run test:e2e` — re-siembra la DB, compila y lanza el server.
 * ⚠️ El seed debe correr ANTES del build: las PDP son SSG y quedan con los
 * variant IDs del momento del build; sembrar después los invalida.
 * Requiere los servicios de docker compose levantados (Postgres al menos).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // los specs comparten la DB de dev; secuencial es más estable
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

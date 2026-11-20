// Configuración de Vitest (tests unitarios de la lógica de negocio): busca los
// archivos `*.test.ts` dentro de `lib/` y resuelve el alias `@/` igual que Next.
// Se ejecuta con `npm test` (o `npm run test:watch` en modo observador).
import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});

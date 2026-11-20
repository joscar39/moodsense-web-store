// Configuración de Prisma 7: ubicación del schema, carpeta de migraciones, comando del
// seed (`npm run db:seed`) y URL de la base de datos (leída de `.env` vía dotenv).
// Generado originalmente por Prisma; requiere `prisma` y `dotenv` como devDependencies.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

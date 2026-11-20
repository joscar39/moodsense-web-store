import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Singleton del cliente Prisma. En dev el hot-reload de Next.js re-evalúa los módulos,
 * así que la instancia se guarda en `globalThis` para no agotar las conexiones.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Crea el cliente Prisma con el driver adapter de Postgres (lee `DATABASE_URL`). */
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

/**
 * Cliente de base de datos compartido por todos los servicios de `lib/`.
 *
 * @example
 * import { prisma } from "@/lib/db/prisma";
 * const product = await prisma.product.findUnique({ where: { slug: "cloud-heavy-hoodie" } });
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

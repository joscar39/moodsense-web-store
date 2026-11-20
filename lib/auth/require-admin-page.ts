import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";

import { auth } from "./index";

/**
 * Guard de las páginas del admin (segunda barrera además del middleware):
 * anónimo → /login; usuario sin rol ADMIN → portada.
 *
 * El rol se relee de la base de datos, así quitarle el rol a alguien le corta
 * el acceso al instante aunque su sesión siga abierta.
 *
 * @example
 * export default async function AdminPage() {
 *   const admin = await requireAdminPage();
 *   // ...
 * }
 */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fadmin");
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") redirect("/");
  return session.user;
}

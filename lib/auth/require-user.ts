import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";

import { auth } from "./index";

/**
 * Devuelve el usuario con sesión iniciada, o `null` si es un visitante.
 *
 * Para qué: rutas que aceptan invitados pero asocian el pedido al usuario si
 * inició sesión (checkout).
 *
 * @example
 * const user = await getOptionalUser(); // { id, email } | null
 */
export async function getOptionalUser(): Promise<{ id: string; email: string } | null> {
  const session = await auth();
  return session?.user?.id && session.user.email
    ? { id: session.user.id, email: session.user.email }
    : null;
}

/**
 * Guard de las rutas API privadas: devuelve el usuario o lanza 401
 * (handleApiError lo convierte en respuesta). Las páginas usan auth() + redirect.
 *
 * @example
 * export async function GET() {
 *   const user = await requireUser(); // 401 si no inició sesión
 *   return NextResponse.json({ data: await listAddresses(user.id) });
 * }
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("UNAUTHORIZED", "Debes iniciar sesión.", 401);
  }
  return { id: session.user.id, email: session.user.email ?? "", role: session.user.role };
}

/**
 * Guard de las rutas API del admin: 401 si es anónimo, 403 si no es ADMIN.
 *
 * El rol se vuelve a leer de la base de datos (no del token de sesión), así un
 * admin al que se le quita el rol pierde el acceso al instante.
 *
 * @example
 * await requireAdmin(); // primera línea de cada handler de /api/admin/*
 */
export async function requireAdmin() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (dbUser?.role !== "ADMIN") {
    throw new ApiError("FORBIDDEN", "Requiere rol de administrador.", 403);
  }
  return user;
}

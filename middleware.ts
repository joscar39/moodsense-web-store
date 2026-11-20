import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/auth.config";

/**
 * Middleware de Auth.js (versión edge, sin Prisma) que protege `/admin` y `/account`.
 * El chequeo de rol vive en el callback `authorized` de `authConfig`; páginas y
 * handlers DEBEN verificar el rol también en el servidor.
 *
 * @example
 * // Anónimo en /account/orders → redirige a /login?callbackUrl=…
 * // USER en /admin → rechazado · ADMIN en /admin → pasa.
 */
export const { auth: middleware } = NextAuth(authConfig);

/** Rutas donde corre el middleware; el resto del sitio no pasa por aquí. */
export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};

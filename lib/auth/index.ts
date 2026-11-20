import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validators/auth";

import { authConfig } from "./auth.config";
import { verifyPassword } from "./password";

import type { NextAuthConfig } from "next-auth";

/** Hash bcrypt de un texto aleatorio descartado: no corresponde a ninguna contraseña. */
const DUMMY_PASSWORD_HASH = "$2b$12$Oq.1nkU/jcJSs3pK7JRmJO4liKZtJXqlkUae9SM20dRUrmiU9zgAa";

/**
 * Providers de login. Credentials valida con `loginSchema` y bcrypt; devuelve
 * `null` (credenciales inválidas) sin revelar si el email existe.
 */
const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      // Los usuarios solo-OAuth no tienen passwordHash y no pueden entrar con contraseña.
      // Si no hay usuario igual se compara contra un hash falso: la respuesta
      // tarda lo mismo y no revela qué emails están registrados.
      const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
      if (!user?.passwordHash || !valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

// Google es opcional en local: solo se activa si sus credenciales están configuradas.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

/**
 * Instancia completa de Auth.js (runtime Node): `auth()` lee la sesión en el
 * servidor, `handlers` atiende /api/auth/* y `signIn`/`signOut` sirven en server actions.
 *
 * @example
 * const session = await auth(); // session?.user.id, session?.user.role
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
});

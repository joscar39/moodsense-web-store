import type { NextAuthConfig } from "next-auth";

/**
 * Config de Auth.js apta para Edge: sin adapter, Prisma ni bcrypt, para que el
 * middleware pueda instanciar NextAuth con ella. La config completa (adapter +
 * providers) está en lib/auth/index.ts.
 *
 * @example
 * export default NextAuth(authConfig).auth; // middleware.ts
 */
export const authConfig = {
  // Sesiones de 8 horas (el default de Auth.js es 30 días): una sesión robada
  // o un rol retirado dejan de valer pronto.
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      // `user` solo existe al iniciar sesión: guarda id y rol en el token.
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    authorized({ auth, request }) {
      // Control en servidor de las rutas protegidas (ver el matcher de middleware.ts).
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin")) {
        return auth?.user?.role === "ADMIN";
      }
      if (pathname.startsWith("/account")) {
        return Boolean(auth?.user);
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

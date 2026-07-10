import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config: no adapter, no Prisma, no bcrypt imports, so the
 * middleware can instantiate NextAuth from it. The full config (adapter +
 * providers) lives in lib/auth/index.ts.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      // `user` is only defined on sign-in; persist id and role in the token.
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
      // Server-side gate for protected routes (see middleware.ts matcher).
      if (request.nextUrl.pathname.startsWith("/admin")) {
        return auth?.user?.role === "ADMIN";
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

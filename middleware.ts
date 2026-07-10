import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/auth.config";

// Edge-safe NextAuth instance (no adapter/Prisma); role checks run in the
// `authorized` callback. Pages/handlers must ALSO verify the role server-side.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*"],
};

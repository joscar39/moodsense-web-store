// Amplía los tipos de Auth.js para que la sesión, el usuario y el JWT incluyan
// `id` y `role` (USER/ADMIN). Ej.: `const session = await auth(); session?.user.role`.
import type { Role } from "@/lib/generated/prisma/enums";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

// `next-auth/jwt` re-exporta `@auth/core/jwt`; la ampliación debe apuntar al módulo
// original o no se fusiona con la interfaz JWT.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

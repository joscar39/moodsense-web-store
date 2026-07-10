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

// `next-auth/jwt` is a re-export of `@auth/core/jwt`; the augmentation must
// target the original module or it will not merge with the JWT interface.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

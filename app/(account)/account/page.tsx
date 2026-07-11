import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { name: true, email: true, passwordHash: true },
  });

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-1 font-serif text-2xl tracking-tight">Perfil</h2>
        <p className="mb-6 text-sm text-muted-foreground">{user.email}</p>
        <ProfileForm defaultName={user.name ?? ""} />
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 font-serif text-2xl tracking-tight">Contraseña</h2>
        {user.passwordHash ? (
          <PasswordForm />
        ) : (
          <p className="text-sm text-muted-foreground">
            Esta cuenta inicia sesión con Google y no usa contraseña.
          </p>
        )}
      </section>
    </div>
  );
}

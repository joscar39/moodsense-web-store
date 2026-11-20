import { redirect } from "next/navigation";

import { AccountNav } from "@/components/account/account-nav";
import { auth } from "@/lib/auth";

/**
 * Layout de /account/**: exige sesión (redirige a /login si no hay) y pinta el
 * saludo con la navegación lateral de la cuenta.
 *
 * @example
 * // Envuelve /account, /account/orders, /account/addresses y /account/wishlist.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // El middleware ya protege /account; esta es la verificación de defensa en profundidad.
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Faccount");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Mi cuenta</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">
          Hola, {session.user.name?.split(" ")[0] ?? "de nuevo"}
        </h1>
      </header>
      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}

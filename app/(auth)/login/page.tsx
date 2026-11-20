import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Iniciar sesión" };

/**
 * Página /login: si ya hay sesión redirige a /account; si no, muestra el
 * formulario (con Google solo si está configurado).
 *
 * @example
 * // URL: /login?callbackUrl=%2Fcheckout
 */
export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  const withGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    // useSearchParams (callbackUrl/error) requiere un límite de Suspense.
    <Suspense>
      <LoginForm withGoogle={withGoogle} />
    </Suspense>
  );
}

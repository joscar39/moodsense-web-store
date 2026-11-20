import { redirect } from "next/navigation";
import { Suspense } from "react";

import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/lib/auth";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Crear cuenta" };

/**
 * Página /register: si ya hay sesión redirige a /account; si no, muestra el formulario.
 *
 * @example
 * // URL: /register?callbackUrl=%2Fcheckout
 */
export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

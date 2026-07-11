import { redirect } from "next/navigation";
import { Suspense } from "react";

import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/lib/auth";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

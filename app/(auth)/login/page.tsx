import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  const withGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    // useSearchParams (callbackUrl/error) requires a Suspense boundary.
    <Suspense>
      <LoginForm withGoogle={withGoogle} />
    </Suspense>
  );
}

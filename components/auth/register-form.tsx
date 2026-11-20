"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readApiError } from "@/lib/api/client-errors";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";
import { registerSchema } from "@/lib/validators/auth";

import type { RegisterInput } from "@/lib/validators/auth";

/**
 * Formulario de registro: crea la cuenta (POST /api/auth/register), inicia
 * sesión automáticamente y redirige al `callbackUrl` seguro (por defecto /account).
 * Necesita un `<Suspense>` arriba porque lee los search params.
 *
 * @example
 * <Suspense><RegisterForm /></Suspense>
 */
export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      setFormError((await readApiError(response)) ?? "No se pudo crear la cuenta.");
      return;
    }

    // Inicia sesión automáticamente tras registrarse.
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      router.push("/login");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">Crear cuenta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ¿Ya tienes una?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-foreground underline underline-offset-4"
        >
          Inicia sesión
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <div>
          <Label htmlFor="register-name">Nombre</Label>
          <Input id="register-name" autoComplete="name" className="mt-1.5" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            className="mt-1.5"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="register-password">Contraseña</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className="mt-1.5"
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-none tracking-[0.2em] uppercase"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}

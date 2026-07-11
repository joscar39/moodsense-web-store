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
import { Separator } from "@/components/ui/separator";
import { loginSchema } from "@/lib/validators/auth";

import type { LoginInput } from "@/lib/validators/auth";

export function LoginForm({ withGoogle }: { withGoogle: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";
  // Auth.js redirects failed provider logins back with ?error=…
  const [formError, setFormError] = useState<string | null>(
    searchParams.get("error") ? "No se pudo iniciar sesión. Verifica tus credenciales." : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) {
      setFormError("Email o contraseña incorrectos.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ¿Primera vez?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-foreground underline underline-offset-4"
        >
          Crea tu cuenta
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <div>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            className="mt-1.5"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="login-password">Contraseña</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
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
          {isSubmitting ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      {withGoogle && (
        <>
          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase">o</span>
            <Separator className="flex-1" />
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-none tracking-[0.15em] uppercase"
            onClick={() => signIn("google", { redirectTo: callbackUrl })}
          >
            Continuar con Google
          </Button>
        </>
      )}
    </div>
  );
}

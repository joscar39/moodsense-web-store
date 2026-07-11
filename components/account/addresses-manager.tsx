"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/field-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addressSchema } from "@/lib/validators/account";

import type { AddressFormInput, AddressInput } from "@/lib/validators/account";

export type Address = AddressInput & { id: string };

async function readError(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  return (body as { error?: { message?: string } } | null)?.error?.message;
}

export function AddressesManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editing, setEditing] = useState<Address | "new" | null>(null);

  const refresh = async () => {
    const response = await fetch("/api/account/addresses");
    if (response.ok) {
      const body = (await response.json()) as { data: Address[] };
      setAddresses(body.data);
    }
  };

  const remove = async (address: Address) => {
    const response = await fetch(`/api/account/addresses/${address.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error((await readError(response)) ?? "No se pudo eliminar la dirección.");
      return;
    }
    toast.success("Dirección eliminada.");
    await refresh();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl tracking-tight">Direcciones</h2>
        {editing === null && (
          <Button
            size="sm"
            className="rounded-none tracking-[0.15em] uppercase"
            onClick={() => setEditing("new")}
          >
            <PlusIcon className="mr-1 size-4" /> Añadir
          </Button>
        )}
      </div>

      {editing !== null ? (
        <AddressForm
          address={editing === "new" ? null : editing}
          onDone={async (saved) => {
            setEditing(null);
            if (saved) await refresh();
          }}
        />
      ) : addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no tienes direcciones guardadas. Añade una para agilizar tus compras.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="relative border p-5">
              {address.isDefault && (
                <Badge className="absolute top-3 right-3 rounded-none bg-navy text-[10px] tracking-[0.15em] text-gold uppercase">
                  Principal
                </Badge>
              )}
              <p className="text-sm font-medium">{address.fullName}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {address.line1}
                {address.line2 && (
                  <>
                    <br />
                    {address.line2}
                  </>
                )}
                <br />
                {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
                <br />
                {address.country}
                {address.phone && (
                  <>
                    <br />
                    {address.phone}
                  </>
                )}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => setEditing(address)}
                >
                  <PencilIcon className="mr-1 size-3.5" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Eliminar dirección de ${address.city}`}
                  onClick={() => remove(address)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddressForm({
  address,
  onDone,
}: {
  address: Address | null;
  onDone: (saved: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: address ?? { country: "DO", isDefault: false },
  });

  const onSubmit = handleSubmit(async (data) => {
    const response = await fetch(
      address ? `/api/account/addresses/${address.id}` : "/api/account/addresses",
      {
        method: address ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      toast.error((await readError(response)) ?? "No se pudo guardar la dirección.");
      return;
    }
    toast.success(address ? "Dirección actualizada." : "Dirección añadida.");
    onDone(true);
  });

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 border p-6" noValidate>
      <div>
        <Label htmlFor="addr-fullName">Nombre completo</Label>
        <Input id="addr-fullName" className="mt-1.5" {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>
      <div>
        <Label htmlFor="addr-line1">Dirección</Label>
        <Input id="addr-line1" className="mt-1.5" {...register("line1")} />
        <FieldError message={errors.line1?.message} />
      </div>
      <div>
        <Label htmlFor="addr-line2">Dirección línea 2 (opcional)</Label>
        <Input id="addr-line2" className="mt-1.5" {...register("line2")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="addr-city">Ciudad</Label>
          <Input id="addr-city" className="mt-1.5" {...register("city")} />
          <FieldError message={errors.city?.message} />
        </div>
        <div>
          <Label htmlFor="addr-state">Provincia/Estado (opcional)</Label>
          <Input id="addr-state" className="mt-1.5" {...register("state")} />
        </div>
        <div>
          <Label htmlFor="addr-postalCode">Código postal</Label>
          <Input id="addr-postalCode" className="mt-1.5" {...register("postalCode")} />
          <FieldError message={errors.postalCode?.message} />
        </div>
        <div>
          <Label htmlFor="addr-country">País (2 letras)</Label>
          <Input id="addr-country" maxLength={2} className="mt-1.5" {...register("country")} />
          <FieldError message={errors.country?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="addr-phone">Teléfono (opcional)</Label>
        <Input id="addr-phone" autoComplete="tel" className="mt-1.5" {...register("phone")} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="addr-default"
          checked={watch("isDefault")}
          onCheckedChange={(checked) => setValue("isDefault", checked === true)}
        />
        <Label htmlFor="addr-default">Usar como dirección principal</Label>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          className="rounded-none tracking-[0.15em] uppercase"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando…" : "Guardar"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => onDone(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ALLOWED_TRANSITIONS } from "@/lib/admin/order-status";

import type { OrderStatus } from "@/lib/generated/prisma/enums";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const targets = ALLOWED_TRANSITIONS[status];

  if (targets.length === 0) {
    return <p className="text-sm text-muted-foreground">Estado final — sin acciones.</p>;
  }

  const apply = async (target: OrderStatus) => {
    if (
      (target === "CANCELLED" || target === "REFUNDED") &&
      !window.confirm(`¿Marcar el pedido como ${STATUS_LABELS[target].toLowerCase()}?`)
    ) {
      return;
    }
    setBusy(true);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: target }),
    });
    setBusy(false);
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      toast.error(
        (body as { error?: { message?: string } } | null)?.error?.message ??
          "No se pudo actualizar el estado."
      );
      return;
    }
    toast.success(`Pedido marcado como ${STATUS_LABELS[target].toLowerCase()}.`);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {targets.map((target) => (
        <Button
          key={target}
          size="sm"
          variant={target === "CANCELLED" || target === "REFUNDED" ? "outline" : "default"}
          className="rounded-none tracking-[0.1em] uppercase"
          disabled={busy}
          onClick={() => apply(target)}
        >
          → {STATUS_LABELS[target]}
        </Button>
      ))}
    </div>
  );
}

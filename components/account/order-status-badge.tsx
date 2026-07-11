import { Badge } from "@/components/ui/badge";

import type { OrderStatus } from "@/lib/generated/prisma/enums";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PENDING_PAYMENT: "Pago pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
};

const STATUS_CLASSES: Partial<Record<OrderStatus, string>> = {
  PAID: "bg-navy text-gold",
  DELIVERED: "bg-navy text-gold",
  PENDING_PAYMENT: "bg-gold text-navy",
  CANCELLED: "bg-secondary text-muted-foreground",
  EXPIRED: "bg-secondary text-muted-foreground",
  REFUNDED: "bg-secondary text-muted-foreground",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      className={`rounded-none text-[10px] tracking-[0.15em] uppercase ${STATUS_CLASSES[status] ?? ""}`}
      variant={STATUS_CLASSES[status] ? undefined : "secondary"}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

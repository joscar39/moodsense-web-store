import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";

import type { OrderStatus } from "@/lib/generated/prisma/enums";

const STATUS_CLASSES: Partial<Record<OrderStatus, string>> = {
  PAID: "bg-navy text-gold",
  DELIVERED: "bg-navy text-gold",
  PENDING_PAYMENT: "bg-gold text-navy",
  CANCELLED: "bg-secondary text-muted-foreground",
  EXPIRED: "bg-secondary text-muted-foreground",
  REFUNDED: "bg-secondary text-muted-foreground",
};

/**
 * Etiqueta visual del estado de un pedido (navy/dorado para pagado/entregado,
 * gris para estados terminales). Se usa en la cuenta del cliente y en el admin.
 *
 * @example
 * <OrderStatusBadge status="PAID" />
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      className={`rounded-none text-[10px] tracking-[0.15em] uppercase ${STATUS_CLASSES[status] ?? ""}`}
      variant={STATUS_CLASSES[status] ? undefined : "secondary"}
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

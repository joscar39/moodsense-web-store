import type { OrderStatus } from "@/lib/generated/prisma/enums";

/**
 * Nombre en español de cada estado de pedido, para badges, botones y filtros.
 *
 * @example
 * ORDER_STATUS_LABELS.PENDING_PAYMENT; // "Pago pendiente"
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PENDING_PAYMENT: "Pago pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
};

/**
 * Transiciones manuales válidas desde el panel admin.
 * - PENDING (Stripe) solo puede cancelarse; PAID llega únicamente por webhook.
 * - PENDING_PAYMENT (WhatsApp) lo confirma o cancela el operador; el paso a
 *   EXPIRED es automático (barrido), nunca manual.
 * - Los estados terminales no tienen salida.
 *
 * @example
 * ALLOWED_TRANSITIONS.PAID; // ["SHIPPED", "CANCELLED", "REFUNDED"]
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  EXPIRED: [],
  REFUNDED: [],
};

/**
 * Estados cuyo stock ya fue reservado/descontado: salir de ellos hacia
 * CANCELLED debe devolver el inventario. (PENDING nunca reservó stock;
 * REFUNDED no lo devuelve porque la mercancía puede estar con el cliente.)
 *
 * @example
 * STOCK_HELD_STATUSES.includes(order.status); // true para PAID
 */
export const STOCK_HELD_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "SHIPPED",
  "DELIVERED",
];

/**
 * Indica si el admin puede pasar un pedido de `from` a `to`.
 *
 * @example
 * canTransition("PAID", "SHIPPED");   // true
 * canTransition("PAID", "DELIVERED"); // false (no se salta el envío)
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

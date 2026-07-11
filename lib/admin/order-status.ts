import type { OrderStatus } from "@/lib/generated/prisma/enums";

/**
 * Valid manual transitions from the admin panel. PAID is only ever set by the
 * Stripe webhook; terminal states (CANCELLED/REFUNDED/DELIVERED→REFUNDED) are
 * one-way.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

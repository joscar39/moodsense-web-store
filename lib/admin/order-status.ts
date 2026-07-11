import type { OrderStatus } from "@/lib/generated/prisma/enums";

/**
 * Valid manual transitions from the admin panel.
 * - PENDING (Stripe) can only be cancelled; PAID via webhook only.
 * - PENDING_PAYMENT (WhatsApp) is confirmed or cancelled manually by the
 *   operator; expiry to EXPIRED is automatic (sweeper), never manual.
 * - Terminal states are one-way.
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
 * States whose stock has already been reserved/decremented: leaving them via
 * CANCELLED must restore inventory. (PENDING never reserved stock; REFUNDED
 * keeps stock out because the goods may be with the customer.)
 */
export const STOCK_HELD_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "SHIPPED",
  "DELIVERED",
];

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

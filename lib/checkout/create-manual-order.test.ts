import "dotenv/config";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { updateOrderStatus } from "@/lib/admin/orders";
import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";

import { createManualOrder } from "./create-manual-order";
import { expireStaleManualOrders } from "./expire-orders";

import type { ManualCheckoutInput } from "@/lib/validators/checkout";

/**
 * Test de INTEGRACIÓN (requiere el Postgres de docker compose levantado):
 * verifica que la reserva de stock es atómica bajo concurrencia real, y que
 * cancelación y expiración devuelven el stock reservado.
 */

const TEST_SLUG = "test-concurrencia-ultima-unidad";
const TEST_SKU = "MS-TEST-CONC-OS";

let variantId: string;

const checkoutInput = (name: string, quantity = 1): ManualCheckoutInput => ({
  items: [{ variantId, quantity }],
  customer: { name, phone: "+1 809 555 0100", email: undefined },
  shipping: {
    line1: "Calle de Prueba 1",
    line2: undefined,
    city: "Santo Domingo",
    state: undefined,
    postalCode: undefined,
    country: "DO",
  },
});

async function currentStock() {
  const variant = await prisma.productVariant.findUniqueOrThrow({
    where: { id: variantId },
    select: { stock: true },
  });
  return variant.stock;
}

async function cleanup() {
  await prisma.order.deleteMany({ where: { items: { some: { sku: TEST_SKU } } } });
  await prisma.product.deleteMany({ where: { slug: TEST_SLUG } });
}

beforeAll(async () => {
  await cleanup();
  const brand = await prisma.brand.findFirstOrThrow({ select: { id: true } });
  const category = await prisma.category.findFirstOrThrow({ select: { id: true } });
  const product = await prisma.product.create({
    data: {
      name: "Producto Test Concurrencia",
      slug: TEST_SLUG,
      description: "Producto temporal para el test de concurrencia de stock.",
      priceCents: 1000,
      brandId: brand.id,
      categoryId: category.id,
      variants: { create: [{ sku: TEST_SKU, stock: 1 }] },
    },
    include: { variants: true },
  });
  variantId = product.variants[0].id;
});

afterAll(async () => {
  await cleanup();
});

describe("createManualOrder — concurrencia de stock", () => {
  it("dos pedidos concurrentes por la última unidad: solo uno gana, el otro recibe 409 controlado", async () => {
    expect(await currentStock()).toBe(1);

    const results = await Promise.allSettled([
      createManualOrder(checkoutInput("Cliente A"), null),
      createManualOrder(checkoutInput("Cliente B"), null),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    // El perdedor falla limpio: ApiError 409 con código estable, no una excepción cruda.
    const reason = (rejected[0] as PromiseRejectedResult).reason as unknown;
    expect(reason).toBeInstanceOf(ApiError);
    expect((reason as ApiError).code).toBe("INSUFFICIENT_STOCK");
    expect((reason as ApiError).status).toBe(409);

    // Estado consistente: stock 0, exactamente UN pedido creado y en PENDING_PAYMENT.
    expect(await currentStock()).toBe(0);
    const orders = await prisma.order.findMany({
      where: { items: { some: { sku: TEST_SKU } } },
      select: { id: true, status: true },
    });
    expect(orders).toHaveLength(1);
    expect(orders[0].status).toBe("PENDING_PAYMENT");
  });

  it("cancelar el pedido desde el admin restaura el stock reservado", async () => {
    const order = await prisma.order.findFirstOrThrow({
      where: { items: { some: { sku: TEST_SKU } }, status: "PENDING_PAYMENT" },
      select: { id: true },
    });

    await updateOrderStatus(order.id, "CANCELLED");

    expect(await currentStock()).toBe(1);
    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      select: { status: true },
    });
    expect(updated.status).toBe("CANCELLED");
  });

  it("el barrido expira pedidos vencidos y devuelve el stock", async () => {
    // Nuevo pedido que consume la unidad restaurada.
    const { orderId } = await createManualOrder(checkoutInput("Cliente C"), null);
    expect(await currentStock()).toBe(0);

    // Lo envejecemos más allá de la ventana de expiración (48h por defecto).
    await prisma.order.update({
      where: { id: orderId },
      data: { createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000) },
    });

    const { expired } = await expireStaleManualOrders();
    expect(expired).toBeGreaterThanOrEqual(1);

    expect(await currentStock()).toBe(1);
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { status: true },
    });
    expect(order.status).toBe("EXPIRED");
  });

  it("un segundo barrido no duplica la restauración (idempotencia)", async () => {
    await expireStaleManualOrders();
    expect(await currentStock()).toBe(1);
  });
});

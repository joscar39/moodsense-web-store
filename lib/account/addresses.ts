import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";

import type { AddressInput } from "@/lib/validators/account";

const addressSelect = {
  id: true,
  fullName: true,
  line1: true,
  line2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  phone: true,
  isDefault: true,
};

/**
 * Direcciones del usuario, la principal primero y luego las más recientes.
 *
 * @example
 * const addresses = await listAddresses(session.user.id);
 */
export function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: addressSelect,
  });
}

/**
 * Crea una dirección del usuario. La primera siempre es la principal; si llega
 * `isDefault`, le quita esa marca a las demás.
 *
 * @example
 * await createAddress(userId, addressSchema.parse(body));
 */
export async function createAddress(userId: string, input: AddressInput) {
  const count = await prisma.address.count({ where: { userId } });
  // La primera dirección siempre es la principal.
  const isDefault = count === 0 || input.isDefault;

  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: { ...input, isDefault, userId },
      select: addressSelect,
    });
  });
}

/**
 * Actualiza una dirección propia (404 si es ajena o no existe); marcarla como
 * principal le quita la marca a las demás.
 *
 * @example
 * await updateAddress(userId, addressId, { ...input, isDefault: true });
 */
export async function updateAddress(userId: string, addressId: string, input: AddressInput) {
  await assertOwnership(userId, addressId);

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.update({
      where: { id: addressId },
      data: input,
      select: addressSelect,
    });
  });
}

/**
 * Borra una dirección propia (404 si es ajena). Si era la principal, promueve
 * la más reciente de las restantes para que siempre haya exactamente una.
 *
 * @example
 * await deleteAddress(userId, addressId);
 */
export async function deleteAddress(userId: string, addressId: string) {
  const address = await assertOwnership(userId, addressId);

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: addressId } });
    // Mantener exactamente una principal: se promueve la más reciente.
    if (address.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (next) {
        await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }
  });
}

/**
 * Comprueba que la dirección pertenece al usuario; si no, lanza 404 (no 403,
 * para no revelar que existe).
 *
 * @example
 * const { isDefault } = await assertOwnership(userId, addressId);
 */
async function assertOwnership(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true, isDefault: true },
  });
  if (!address) {
    throw new ApiError("NOT_FOUND", "Dirección no encontrada.", 404);
  }
  return address;
}

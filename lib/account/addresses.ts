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

export function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: addressSelect,
  });
}

export async function createAddress(userId: string, input: AddressInput) {
  const count = await prisma.address.count({ where: { userId } });
  // The first address is always the default one.
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

export async function deleteAddress(userId: string, addressId: string) {
  const address = await assertOwnership(userId, addressId);

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: addressId } });
    // Keep exactly one default: promote the newest remaining address.
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

/** Addresses are strictly scoped to their owner; anything else is a 404. */
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

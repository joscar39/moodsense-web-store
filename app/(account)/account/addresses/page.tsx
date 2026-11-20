import { AddressesManager } from "@/components/account/addresses-manager";
import { listAddresses } from "@/lib/account/addresses";
import { auth } from "@/lib/auth";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis direcciones" };

/**
 * Página /account/addresses: direcciones guardadas del usuario con alta,
 * edición y borrado (la sesión la garantizan el middleware y el layout).
 *
 * @example
 * // GET /account/addresses → lista de direcciones + botón "Añadir"
 */
export default async function AddressesPage() {
  const session = await auth();
  const addresses = await listAddresses(session!.user.id);

  return <AddressesManager addresses={addresses} />;
}

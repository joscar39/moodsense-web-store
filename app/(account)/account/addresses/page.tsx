import { AddressesManager } from "@/components/account/addresses-manager";
import { listAddresses } from "@/lib/account/addresses";
import { auth } from "@/lib/auth";

import type { Address } from "@/components/account/addresses-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis direcciones" };

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await listAddresses(session!.user.id);

  return (
    <AddressesManager
      initialAddresses={
        addresses.map((address) => ({
          ...address,
          line2: address.line2 ?? undefined,
          state: address.state ?? undefined,
          phone: address.phone ?? undefined,
        })) as Address[]
      }
    />
  );
}

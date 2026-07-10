import { prisma } from "@/lib/db/prisma";

/** All brands with their active product count, alphabetical. */
export async function listBrands() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  return brands.map(({ _count, ...brand }) => ({ ...brand, productCount: _count.products }));
}

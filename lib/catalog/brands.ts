import { prisma } from "@/lib/db/prisma";

/**
 * Todas las marcas en orden alfabético con su número de productos activos.
 *
 * @example
 * const brands = await listBrands(); // [{ id, name, slug, productCount: 4 }, ...]
 */
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

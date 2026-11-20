import { prisma } from "@/lib/db/prisma";

const activeProductCount = {
  _count: { select: { products: { where: { isActive: true } } } },
};

/**
 * Árbol de categorías de dos niveles (raíces con sus hijas) con el número de
 * productos activos de cada una. Lo usan el header, los filtros y /api/categories.
 *
 * @example
 * const tree = await listCategoryTree(); // [{ slug: "ropa", children: [{ slug: "camisetas" }] }]
 */
export async function listCategoryTree() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      ...activeProductCount,
      children: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, slug: true, description: true, ...activeProductCount },
      },
    },
  });

  return categories.map((category) => ({
    ...toCategoryNode(category),
    children: category.children.map(toCategoryNode),
  }));
}

/**
 * Aplana el `_count` de Prisma a `productCount`.
 *
 * @example
 * toCategoryNode({ id, name, slug, description, _count: { products: 3 } }); // { ..., productCount: 3 }
 */
function toCategoryNode(category: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
}) {
  const { _count, ...rest } = category;
  return { ...rest, productCount: _count.products };
}

import { prisma } from "@/lib/db/prisma";

const activeProductCount = {
  _count: { select: { products: { where: { isActive: true } } } },
};

/** Two-level category tree (top-level with children), with active product counts. */
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

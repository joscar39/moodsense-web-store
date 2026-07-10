import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { hashPassword } from "../lib/auth/password";
import { PrismaClient } from "../lib/generated/prisma/client";

import type { Gender } from "../lib/generated/prisma/enums";

// Standalone client (the lib/db singleton uses the "@/" alias, which tsx
// does not resolve outside Next).
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const BRANDS = [
  {
    code: "ATL",
    name: "Atlas Supply",
    slug: "atlas-supply",
    description: "Básicos elevados y siluetas oversized para el día a día.",
  },
  {
    code: "NOC",
    name: "Nocturne",
    slug: "nocturne",
    description: "Streetwear premium de inspiración nocturna: negro, texturas y detalle.",
  },
  {
    code: "AUR",
    name: "Aura Studio",
    slug: "aura-studio",
    description: "Diseño femenino contemporáneo con espíritu urbano.",
  },
  {
    code: "MNO",
    name: "Mono+",
    slug: "mono-plus",
    description: "Minimalismo funcional: una paleta, cero ruido.",
  },
  {
    code: "CLL",
    name: "Calle Ocho",
    slug: "calle-ocho",
    description: "Herencia latina y cultura de barrio en cada pieza.",
  },
  {
    code: "NRB",
    name: "Northbound",
    slug: "northbound",
    description: "Outdoor técnico reinterpretado para la ciudad.",
  },
] as const;

const CATEGORIES = [
  {
    slug: "ropa",
    name: "Ropa",
    children: ["camisetas", "hoodies-sudaderas", "chaquetas", "pantalones"],
  },
  { slug: "calzado", name: "Calzado", children: ["sneakers", "botas"] },
  { slug: "gorras", name: "Gorras", children: [] },
  { slug: "accesorios", name: "Accesorios", children: [] },
] as const;

const CHILD_CATEGORY_NAMES: Record<string, string> = {
  camisetas: "Camisetas",
  "hoodies-sudaderas": "Hoodies & Sudaderas",
  chaquetas: "Chaquetas",
  pantalones: "Pantalones",
  sneakers: "Sneakers",
  botas: "Botas",
};

const APPAREL_SIZES = ["S", "M", "L", "XL"];
const SHOE_SIZES = ["40", "41", "42", "43", "44"];

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  gender: Gender;
  priceCents: number;
  compareAtPriceCents?: number;
  isFeatured?: boolean;
  brand: (typeof BRANDS)[number]["code"];
  category: string;
  color: string;
  sizes: (string | null)[];
};

const PRODUCTS: SeedProduct[] = [
  // Camisetas
  {
    name: "Vibe Check Oversized Tee",
    slug: "vibe-check-oversized-tee",
    description:
      "Camiseta oversized de algodón peinado 240 g con gráfica minimalista al frente. La base de cualquier outfit head-to-toe.",
    gender: "UNISEX",
    priceCents: 3900,
    isFeatured: true,
    brand: "ATL",
    category: "camisetas",
    color: "Crema",
    sizes: APPAREL_SIZES,
  },
  {
    name: "Midnight Logo Tee",
    slug: "midnight-logo-tee",
    description: "Camiseta de corte relajado en negro profundo con logo bordado tono sobre tono.",
    gender: "MEN",
    priceCents: 4500,
    brand: "NOC",
    category: "camisetas",
    color: "Negro",
    sizes: APPAREL_SIZES,
  },
  {
    name: "Aura Cropped Tee",
    slug: "aura-cropped-tee",
    description: "Camiseta cropped de tejido elástico con cuello redondo y caída limpia.",
    gender: "WOMEN",
    priceCents: 3500,
    compareAtPriceCents: 4200,
    brand: "AUR",
    category: "camisetas",
    color: "Blanco",
    sizes: APPAREL_SIZES,
  },
  {
    name: "Barrio Graphic Tee",
    slug: "barrio-graphic-tee",
    description: "Gráfica ilustrada a mano que celebra la esquina de siempre. Algodón orgánico.",
    gender: "UNISEX",
    priceCents: 4200,
    brand: "CLL",
    category: "camisetas",
    color: "Arena",
    sizes: APPAREL_SIZES,
  },
  // Hoodies & sudaderas
  {
    name: "Cloud Heavy Hoodie",
    slug: "cloud-heavy-hoodie",
    description: "Hoodie de felpa pesada 450 g con interior perchado y capucha de doble capa.",
    gender: "UNISEX",
    priceCents: 8900,
    isFeatured: true,
    brand: "ATL",
    category: "hoodies-sudaderas",
    color: "Crema",
    sizes: APPAREL_SIZES,
  },
  {
    name: "Nocturne Zip Hoodie",
    slug: "nocturne-zip-hoodie",
    description: "Hoodie con cierre completo, paneles texturizados y herrajes metálicos mate.",
    gender: "MEN",
    priceCents: 10900,
    brand: "NOC",
    category: "hoodies-sudaderas",
    color: "Negro",
    sizes: APPAREL_SIZES,
  },
  {
    name: "Mono Crewneck",
    slug: "mono-crewneck",
    description: "Sudadera de cuello redondo en tejido compacto, sin costuras laterales.",
    gender: "UNISEX",
    priceCents: 7500,
    compareAtPriceCents: 8900,
    brand: "MNO",
    category: "hoodies-sudaderas",
    color: "Gris",
    sizes: APPAREL_SIZES,
  },
  // Chaquetas
  {
    name: "Northbound Shell Jacket",
    slug: "northbound-shell-jacket",
    description:
      "Chaqueta técnica repelente al agua con costuras selladas y bolsillos utilitarios.",
    gender: "MEN",
    priceCents: 15900,
    isFeatured: true,
    brand: "NRB",
    category: "chaquetas",
    color: "Navy",
    sizes: APPAREL_SIZES,
  },
  {
    name: "Aura Bomber",
    slug: "aura-bomber",
    description: "Bomber satinado de silueta femenina con puños acanalados y forro ligero.",
    gender: "WOMEN",
    priceCents: 13900,
    brand: "AUR",
    category: "chaquetas",
    color: "Oliva",
    sizes: APPAREL_SIZES,
  },
  // Pantalones
  {
    name: "Atlas Wide Cargo",
    slug: "atlas-wide-cargo",
    description: "Cargo de pierna amplia con bolsillos de fuelle y bajo ajustable.",
    gender: "UNISEX",
    priceCents: 9900,
    brand: "ATL",
    category: "pantalones",
    color: "Arena",
    sizes: APPAREL_SIZES,
  },
  {
    name: "Mono Tapered Pant",
    slug: "mono-tapered-pant",
    description: "Pantalón tapered de sarga elástica con cintura media y pinzas limpias.",
    gender: "MEN",
    priceCents: 8500,
    compareAtPriceCents: 9900,
    brand: "MNO",
    category: "pantalones",
    color: "Negro",
    sizes: APPAREL_SIZES,
  },
  // Sneakers
  {
    name: "Court Classic 88",
    slug: "court-classic-88",
    description:
      "Sneaker de cuero de grano completo con suela de goma vulcanizada. Un clásico de cancha reinterpretado.",
    gender: "UNISEX",
    priceCents: 12900,
    isFeatured: true,
    brand: "MNO",
    category: "sneakers",
    color: "Blanco",
    sizes: SHOE_SIZES,
  },
  {
    name: "Nocturne Runner X",
    slug: "nocturne-runner-x",
    description:
      "Runner de malla técnica con cambrillón reflectivo y entresuela de doble densidad.",
    gender: "MEN",
    priceCents: 16900,
    brand: "NOC",
    category: "sneakers",
    color: "Negro",
    sizes: SHOE_SIZES,
  },
  {
    name: "Aura Flow Sneaker",
    slug: "aura-flow-sneaker",
    description: "Sneaker ligera de perfil bajo con upper de punto elástico y plantilla acolchada.",
    gender: "WOMEN",
    priceCents: 11900,
    compareAtPriceCents: 13900,
    brand: "AUR",
    category: "sneakers",
    color: "Crema",
    sizes: SHOE_SIZES,
  },
  {
    name: "Calle Ocho Cupsole",
    slug: "calle-ocho-cupsole",
    description: "Cupsole de gamuza con detalles bordados y cordones dobles incluidos.",
    gender: "UNISEX",
    priceCents: 10900,
    brand: "CLL",
    category: "sneakers",
    color: "Arena",
    sizes: SHOE_SIZES,
  },
  // Botas
  {
    name: "Northbound Trail Boot",
    slug: "northbound-trail-boot",
    description: "Bota de trail urbana con membrana impermeable y suela de tracción profunda.",
    gender: "MEN",
    priceCents: 18900,
    brand: "NRB",
    category: "botas",
    color: "Marrón",
    sizes: SHOE_SIZES,
  },
  // Gorras
  {
    name: "Atlas 6-Panel Cap",
    slug: "atlas-6-panel-cap",
    description: "Gorra de 6 paneles en twill de algodón con hebilla metálica y logo bordado.",
    gender: "UNISEX",
    priceCents: 3200,
    brand: "ATL",
    category: "gorras",
    color: "Crema",
    sizes: [null],
  },
  {
    name: "Calle Ocho Snapback",
    slug: "calle-ocho-snapback",
    description: "Snapback de visera plana con parche tejido frontal y ajuste clásico.",
    gender: "UNISEX",
    priceCents: 3500,
    compareAtPriceCents: 4000,
    brand: "CLL",
    category: "gorras",
    color: "Navy",
    sizes: [null],
  },
  // Accesorios
  {
    name: "Nocturne Crossbody Bag",
    slug: "nocturne-crossbody-bag",
    description: "Bolso crossbody de nylon balístico con correa modular y bolsillo oculto.",
    gender: "UNISEX",
    priceCents: 6900,
    brand: "NOC",
    category: "accesorios",
    color: "Negro",
    sizes: [null],
  },
  {
    name: "Mono Beanie",
    slug: "mono-beanie",
    description: "Beanie de punto acanalado en mezcla de lana merino, etiqueta tejida lateral.",
    gender: "UNISEX",
    priceCents: 2900,
    brand: "MNO",
    category: "accesorios",
    color: "Gris",
    sizes: [null],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SIZE_CODE: Record<string, string> = { S: "S", M: "M", L: "L", XL: "XL" };

function skuFor(brandCode: string, seq: number, size: string | null) {
  const sizePart = size ? (SIZE_CODE[size] ?? size) : "OS";
  return `MS-${brandCode}-${String(seq).padStart(3, "0")}-${sizePart}`;
}

/** Deterministic pseudo-stock so re-seeding is reproducible. */
function stockFor(productIndex: number, variantIndex: number) {
  return ((productIndex * 7 + variantIndex * 3) % 12) + 4;
}

function imageUrl(name: string, dark: boolean) {
  const text = encodeURIComponent(name).replace(/%20/g, "+");
  return dark
    ? `https://placehold.co/900x1200/0B1A33/C9A876/png?text=${text}`
    : `https://placehold.co/900x1200/F5F3EF/111111/png?text=${text}`;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("→ Seeding Mood Sense…");

  // Idempotent re-seed: wipe catalog + commerce data (FK-safe order), keep users.
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // Users -------------------------------------------------------------------
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";
  const userPassword = process.env.SEED_USER_PASSWORD ?? "cliente1234";

  await prisma.user.upsert({
    where: { email: "admin@moodsense.dev" },
    update: { role: "ADMIN", passwordHash: await hashPassword(adminPassword) },
    create: {
      name: "Admin Mood Sense",
      email: "admin@moodsense.dev",
      role: "ADMIN",
      passwordHash: await hashPassword(adminPassword),
    },
  });

  await prisma.user.upsert({
    where: { email: "cliente@moodsense.dev" },
    update: { passwordHash: await hashPassword(userPassword) },
    create: {
      name: "Cliente Demo",
      email: "cliente@moodsense.dev",
      passwordHash: await hashPassword(userPassword),
    },
  });
  console.log("  ✓ users (admin@moodsense.dev, cliente@moodsense.dev)");

  // Brands ------------------------------------------------------------------
  const brandIdByCode = new Map<string, string>();
  for (const brand of BRANDS) {
    const created = await prisma.brand.create({
      data: { name: brand.name, slug: brand.slug, description: brand.description },
    });
    brandIdByCode.set(brand.code, created.id);
  }
  console.log(`  ✓ ${BRANDS.length} brands`);

  // Categories --------------------------------------------------------------
  const categoryIdBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const parent = await prisma.category.create({
      data: { name: category.name, slug: category.slug },
    });
    categoryIdBySlug.set(category.slug, parent.id);

    for (const childSlug of category.children) {
      const child = await prisma.category.create({
        data: { name: CHILD_CATEGORY_NAMES[childSlug], slug: childSlug, parentId: parent.id },
      });
      categoryIdBySlug.set(childSlug, child.id);
    }
  }
  console.log(`  ✓ ${categoryIdBySlug.size} categories`);

  // Products ----------------------------------------------------------------
  let variantCount = 0;
  for (const [index, product] of PRODUCTS.entries()) {
    const seq = index + 1;
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        gender: product.gender,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents,
        isFeatured: product.isFeatured ?? false,
        brandId: brandIdByCode.get(product.brand)!,
        categoryId: categoryIdBySlug.get(product.category)!,
        images: {
          create: [
            {
              url: imageUrl(product.name, false),
              alt: `${product.name} — vista frontal`,
              position: 0,
            },
            {
              url: imageUrl(product.name, true),
              alt: `${product.name} — vista alternativa`,
              position: 1,
            },
          ],
        },
        variants: {
          create: product.sizes.map((size, variantIndex) => {
            variantCount += 1;
            return {
              sku: skuFor(product.brand, seq, size),
              size,
              color: product.color,
              stock: stockFor(index, variantIndex),
            };
          }),
        },
      },
    });
  }
  console.log(`  ✓ ${PRODUCTS.length} products / ${variantCount} variants`);

  console.log("✓ Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

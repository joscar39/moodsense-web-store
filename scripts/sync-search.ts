import "dotenv/config";

import { syncProductsIndex } from "@/lib/search/products-index";

/**
 * Script de `npm run search:sync`: reindexa por completo el índice `products`
 * de Meilisearch (settings + productos activos, borra los inactivos).
 *
 * @example
 * // npm run search:sync
 * // → Syncing Meilisearch products index…
 * //   ✓ 20 products indexed, 0 removed
 */
async function main() {
  console.log("→ Syncing Meilisearch products index…");
  const { indexed, removed } = await syncProductsIndex();
  console.log(`  ✓ ${indexed} products indexed, ${removed} removed`);
  console.log("✓ Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

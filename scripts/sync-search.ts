import "dotenv/config";

import { getMeiliClient } from "@/lib/search/client";
import { PRODUCTS_INDEX, syncProductsIndex } from "@/lib/search/products-index";

const SEARCH_KEY_NAME = "moodsense-search";

/**
 * Ensures a public search-only API key exists (safe for the browser, scoped
 * to the products index). Prints it on first creation so it can be copied to
 * NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY in .env.
 */
async function ensureSearchKey() {
  const client = getMeiliClient();
  const { results } = await client.getKeys({ limit: 100 });
  const existing = results.find((key) => key.name === SEARCH_KEY_NAME);

  if (existing) {
    console.log(`✓ search key "${SEARCH_KEY_NAME}" already exists (uid ${existing.uid})`);
    return;
  }

  const created = await client.createKey({
    name: SEARCH_KEY_NAME,
    description: "Public search-only key for the storefront (products index).",
    actions: ["search"],
    indexes: [PRODUCTS_INDEX],
    expiresAt: null,
  });

  console.log(`✓ created search-only key "${SEARCH_KEY_NAME}"`);
  console.log("  Copy it to NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY in your .env:");
  console.log(`  ${created.key}`);
}

async function main() {
  console.log("→ Syncing Meilisearch products index…");
  const { indexed, removed } = await syncProductsIndex();
  console.log(`  ✓ ${indexed} products indexed, ${removed} removed`);
  await ensureSearchKey();
  console.log("✓ Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

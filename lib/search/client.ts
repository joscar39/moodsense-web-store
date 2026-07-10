import { Meilisearch } from "meilisearch";

/**
 * Server-side Meilisearch client authenticated with the MASTER key.
 * Never import from client components — the browser must use the public
 * search-only key (NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY).
 */
export function getMeiliClient(): Meilisearch {
  const host = process.env.MEILISEARCH_HOST;
  const apiKey = process.env.MEILISEARCH_MASTER_KEY;

  if (!host || !apiKey) {
    throw new Error("MEILISEARCH_HOST and MEILISEARCH_MASTER_KEY must be set.");
  }

  return new Meilisearch({ host, apiKey });
}

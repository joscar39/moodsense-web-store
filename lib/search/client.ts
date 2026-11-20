import { Meilisearch } from "meilisearch";

/**
 * Cliente de Meilisearch del servidor, autenticado con la MASTER key. Nunca
 * importarlo desde componentes cliente: el navegador no habla con Meilisearch,
 * busca a través de GET /api/search.
 *
 * @example
 * const index = getMeiliClient().index("products");
 */
export function getMeiliClient(): Meilisearch {
  const host = process.env.MEILISEARCH_HOST;
  const apiKey = process.env.MEILISEARCH_MASTER_KEY;

  if (!host || !apiKey) {
    throw new Error("MEILISEARCH_HOST and MEILISEARCH_MASTER_KEY must be set.");
  }

  return new Meilisearch({ host, apiKey });
}

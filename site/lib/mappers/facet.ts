import type { ProductSearchFacetResult, ProductSearchFacetResultBucket } from '@commercetools/platform-sdk';
import type { FacetMeta, FacetResult, FacetBucket } from '@/lib/types';

function isBucketResult(result: ProductSearchFacetResult): result is ProductSearchFacetResultBucket {
  return 'buckets' in result;
}

/**
 * Maps commercetools ProductSearchFacetResult[] (distinct + ranges both return the
 * ProductSearchFacetResultBucket shape — { key, count }[]) to app FacetResult[],
 * matching each response entry to its request-time kind via facetMeta (by name).
 */
export function mapFacetResults(
  facets: ProductSearchFacetResult[] | undefined,
  facetMeta: FacetMeta[]
): FacetResult[] {
  if (!facets) return [];
  const results: FacetResult[] = [];

  for (const result of facets) {
    const meta = facetMeta.find((m) => m.name === result.name);
    if (!meta || !isBucketResult(result)) continue;

    const buckets: FacetBucket[] = result.buckets
      .filter((b) => b.count > 0)
      .map((b) => ({ key: b.key, label: b.key, count: b.count }));

    if (buckets.length > 0) {
      results.push({ name: result.name, kind: meta.kind, buckets });
    }
  }
  return results;
}

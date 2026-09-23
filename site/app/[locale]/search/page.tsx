import type { Metadata } from 'next';
import { getLocale } from '@/lib/session';
import { searchProducts } from '@/lib/ct/search';
import { parseFilters, parseSort, parseOffset, firstParam, type UrlSearchParams } from '@/lib/search-params';
import FacetPanel from '@/components/product/FacetPanel';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/product/Pagination';
import SortSelect from '@/components/product/SortSelect';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<UrlSearchParams>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const q = firstParam(resolved.q).trim();
  return { title: q ? `Search results for "${q}"` : 'Search' };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const [{ locale }, resolvedSearchParams, { country, currency }] = await Promise.all([
    params,
    searchParams,
    getLocale(),
  ]);

  const q = firstParam(resolvedSearchParams.q).trim();

  if (!q) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-charcoal">Search</h1>
        <p className="mt-12 text-center text-charcoal-light">Enter a search term above.</p>
      </div>
    );
  }

  const filters = parseFilters(resolvedSearchParams);
  const sort = parseSort(resolvedSearchParams);
  const offset = parseOffset(resolvedSearchParams);

  const result = await searchProducts({
    text: q,
    locale,
    currency,
    country,
    filters,
    sort,
    limit: 24,
    offset,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-charcoal">Search results for &quot;{q}&quot;</h1>
        <SortSelect />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-charcoal-light">
            Filters
          </h2>
          <FacetPanel facets={result.facets} facetMeta={result.facetMeta} />
        </aside>
        <div className="flex flex-col gap-8">
          {result.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border px-6 py-24 text-center">
              <p className="text-base font-medium text-charcoal">No results for &quot;{q}&quot;</p>
              <p className="text-sm text-charcoal-light">
                Try a different search term or clear your filters.
              </p>
            </div>
          ) : (
            <ProductGrid products={result.products} locale={locale} />
          )}
          <Pagination
            total={result.total}
            limit={result.limit}
            offset={result.offset}
            searchParams={resolvedSearchParams}
          />
        </div>
      </div>
    </div>
  );
}

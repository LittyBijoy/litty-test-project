import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from '@/lib/session';
import { getCategoryBySlug, getCategoryTree } from '@/lib/ct/categories';
import { searchProducts } from '@/lib/ct/search';
import { parseFilters, parseSort, parseOffset, type UrlSearchParams } from '@/lib/search-params';
import Breadcrumb from '@/components/layout/Breadcrumb';
import FacetPanel from '@/components/product/FacetPanel';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/product/Pagination';
import SortSelect from '@/components/product/SortSelect';
import type { Category } from '@/lib/types';

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<UrlSearchParams>;
}

/** Walks the in-memory category tree to find the root-to-node path, by id. No extra API calls. */
function findCategoryPath(nodes: Category[], targetId: string, trail: Category[] = []): Category[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.id === targetId) return nextTrail;
    if (node.children && node.children.length > 0) {
      const found = findCategoryPath(node.children, targetId, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug, locale);
  return { title: category?.name ?? 'Category' };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ locale, slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [{ country, currency }, category, categoryTree] = await Promise.all([
    getLocale(),
    getCategoryBySlug(slug, locale),
    getCategoryTree(locale),
  ]);

  if (!category) {
    notFound();
  }

  const filters = parseFilters(resolvedSearchParams);
  const sort = parseSort(resolvedSearchParams);
  const offset = parseOffset(resolvedSearchParams);

  const result = await searchProducts({
    categoryId: category.id,
    locale,
    currency,
    country,
    filters,
    sort,
    limit: 24,
    offset,
  });

  const path = findCategoryPath(categoryTree, category.id) ?? [category];
  const breadcrumbItems = path.map((c) => ({ name: c.name, href: `/category/${c.slug}` }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbItems} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-charcoal">{category.name}</h1>
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
          <ProductGrid products={result.products} locale={locale} />
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

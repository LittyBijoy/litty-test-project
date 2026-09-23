import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getCategoryTree } from '@/lib/ct/categories';
import { searchProducts } from '@/lib/ct/search';
import ProductGrid from '@/components/product/ProductGrid';

export const metadata: Metadata = {
  title: 'Your Shop — Thoughtfully made goods',
  description:
    'Discover thoughtfully made goods for everyday living — considered design, honest materials, and pieces made to last.',
};

export default async function HomePage() {
  const { locale, currency, country } = await getLocale();

  const [categoryTree, searchResult] = await Promise.all([
    getCategoryTree(locale),
    searchProducts({ locale, currency, country, limit: 8 }),
  ]);

  const featuredCategories = categoryTree.slice(0, 6);
  const heroHref = categoryTree[0] ? `/category/${categoryTree[0].slug}` : '/search';

  return (
    <div className="flex flex-col">
      <section className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
          Thoughtfully made goods for everyday living
        </h1>
        <p className="max-w-xl text-base text-charcoal-light">
          Considered design, honest materials, and pieces made to last. Explore the collection and find
          something to keep.
        </p>
        <Link
          href={heroHref}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-white hover:bg-charcoal-light"
        >
          Shop now
        </Link>
      </section>

      {featuredCategories.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex items-center justify-center rounded-lg border border-border bg-cream-dark px-4 py-8 text-center text-sm font-medium text-charcoal transition-colors hover:border-charcoal"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold text-charcoal">Featured products</h2>
        <ProductGrid products={searchResult.products} locale={locale} />
      </section>
    </div>
  );
}

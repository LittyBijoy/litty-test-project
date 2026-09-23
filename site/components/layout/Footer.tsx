import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getCategoryTree } from '@/lib/ct/categories';

export async function Footer() {
  const { locale } = await getLocale();
  const categoryTree = await getCategoryTree(locale).catch(() => []);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-cream-dark">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <span className="text-lg font-bold tracking-tight text-charcoal">YOUR SHOP</span>
          <p className="max-w-xs text-sm text-charcoal-light">
            Thoughtfully made goods for everyday living — considered design, honest materials.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-charcoal">About</h3>
          <Link href="/" className="text-sm text-charcoal-light hover:text-charcoal">
            Our story
          </Link>
          <Link href="/" className="text-sm text-charcoal-light hover:text-charcoal">
            Sustainability
          </Link>
          <Link href="/" className="text-sm text-charcoal-light hover:text-charcoal">
            Careers
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-charcoal">Help</h3>
          <Link href="/cart" className="text-sm text-charcoal-light hover:text-charcoal">
            Cart
          </Link>
          <Link href="/account" className="text-sm text-charcoal-light hover:text-charcoal">
            Account
          </Link>
          <Link href="/search" className="text-sm text-charcoal-light hover:text-charcoal">
            Search
          </Link>
        </div>

        {categoryTree.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-charcoal">Categories</h3>
            {categoryTree.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-sm text-charcoal-light hover:text-charcoal"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-charcoal-light sm:px-6 lg:px-8">
        © {year} Your Shop. All rights reserved.
      </div>
    </footer>
  );
}

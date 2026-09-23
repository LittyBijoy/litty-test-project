import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getCategoryTree } from '@/lib/ct/categories';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';
import LocaleSwitcher from './LocaleSwitcher';
import CartButton from './CartButton';
import { AccountIcon } from './icons';

export async function Header() {
  const { locale } = await getLocale();
  const categoryTree = await getCategoryTree(locale);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <MobileMenu categoryTree={categoryTree} />

        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-charcoal">
          YOUR SHOP
        </Link>

        <nav aria-label="Categories" className="hidden lg:block">
          <MegaMenu categoryTree={categoryTree} />
        </nav>

        <div className="hidden flex-1 md:block">
          <SearchBar className="ml-auto max-w-sm" />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LocaleSwitcher />
          <Link href="/account" aria-label="Account" className="rounded-full p-2 text-charcoal hover:bg-cream-dark">
            <AccountIcon className="h-5 w-5" />
          </Link>
          <CartButton />
        </div>
      </div>

      <div className="border-t border-border px-4 py-2.5 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}

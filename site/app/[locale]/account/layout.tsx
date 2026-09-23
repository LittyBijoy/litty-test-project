'use client';

import { useEffect, type ReactNode } from 'react';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useAccount, useAccountMutations } from '@/hooks/useAccount';

const NAV_ITEMS = [
  { href: '/account', label: 'Profile' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
] as const;

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { data: user } = useAccount();
  const { logout } = useAccountMutations();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, pathname, router]);

  // Loading, or signed out and about to redirect — render nothing to avoid a flash.
  if (user === undefined || user === null) {
    return null;
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-charcoal">My account</h1>
      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <aside className="shrink-0 md:w-48">
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors md:whitespace-normal ${
                    isActive ? 'bg-charcoal text-white' : 'text-charcoal-light hover:bg-cream-dark'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="whitespace-nowrap rounded-full px-4 py-2 text-left text-sm text-charcoal-light hover:bg-cream-dark"
            >
              Log out
            </button>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

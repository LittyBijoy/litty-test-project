import type { Metadata } from 'next';
import { SWRConfig } from 'swr';
import { getSession, getLocale } from '@/lib/session';
import { getActiveCart } from '@/lib/ct/cart';
import { KEY_CART, KEY_ACCOUNT } from '@/lib/cache-keys';
import type { Account } from '@/lib/types';
import './globals.css';

export const metadata: Metadata = {
  title: 'Store',
  description: 'A commercetools-powered storefront',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, { locale }] = await Promise.all([getSession(), getLocale()]);

  // Seed the SWR cache from the server so the cart/account hooks render with no spinner flash.
  const initialCart = session.cartId ? await getActiveCart(session.cartId, locale).catch(() => null) : null;
  // The session JWT already carries the customer's basic fields — no extra commercetools
  // call needed here; a full getCustomerById is only used on the account profile page.
  const initialUser: Account | null = session.customerId
    ? {
        id: session.customerId,
        email: session.customerEmail ?? '',
        firstName: session.customerFirstName,
        lastName: session.customerLastName,
        addresses: [],
      }
    : null;

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-charcoal">
        <SWRConfig value={{ fallback: { [KEY_CART]: initialCart, [KEY_ACCOUNT]: initialUser } }}>
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}

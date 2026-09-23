import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { getActiveCart } from '@/lib/ct/cart';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MiniCart } from '@/components/layout/MiniCart';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [messages, session] = await Promise.all([getMessages(), getSession()]);
  const initialCart = session.cartId ? await getActiveCart(session.cartId, locale).catch(() => null) : null;

  return (
    <NextIntlClientProvider messages={messages}>
      <CartProvider initialCart={initialCart}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MiniCart />
      </CartProvider>
    </NextIntlClientProvider>
  );
}

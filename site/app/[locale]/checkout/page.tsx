'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { checkoutFlow, type Message } from '@commercetools/checkout-browser-sdk';
import { useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartContext';
import { formatMoney } from '@/lib/utils';

/**
 * Full hosted checkout (checkoutFlow) — the Checkout Browser SDK owns address,
 * shipping, and payment entirely, and creates the order itself once payment succeeds.
 * PSP: Stripe (configured as a Connector in Merchant Center — not set up by this code).
 */
export default function CheckoutPage() {
  const router = useRouter();
  const locale = useLocale();
  const { cart, isLoading, mutateCart } = useCartContext();
  const [error, setError] = useState<string | null>(null);
  const [sdkLoading, setSdkLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!cart || cart.lineItems.length === 0) {
      router.replace('/cart');
    }
  }, [cart, isLoading, router]);

  useEffect(() => {
    if (isLoading || !cart || cart.lineItems.length === 0) return;
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const res = await fetch('/api/checkout/session', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start checkout');

        checkoutFlow({
          projectKey: data.projectKey,
          region: data.region,
          sessionId: data.sessionId,
          locale,
          styles: {
            '--font-family': 'var(--font-sans)',
            '--color-primary': '#1a1a1a',
            '--color-primary-hover': '#4a4a4a',
            '--border-radius': '0.375rem',
          },
          onInfo: (msg: Message) => {
            setSdkLoading(false);
            if (msg.code === 'checkout_completed') {
              const payload = msg.payload as { orderId?: string; order?: { id?: string } } | undefined;
              const orderId = payload?.orderId ?? payload?.order?.id;
              fetch('/api/checkout/complete', { method: 'POST' }).finally(() => {
                mutateCart.clearCart();
                router.push(orderId ? `/checkout/confirmation/${orderId}` : '/checkout/confirmation');
              });
            }
          },
          onError: (err: Message) => {
            setSdkLoading(false);
            setError(String(err.payload ?? err.code ?? 'Something went wrong with checkout'));
          },
        });
      } catch (e: unknown) {
        setSdkLoading(false);
        setError(e instanceof Error ? e.message : 'Failed to start checkout');
      }
    })();
  }, [cart, isLoading, locale, mutateCart, router]);

  if (isLoading || !cart) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-charcoal-light">Loading checkout…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>
      <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm">
        <span>{cart.totalLineItemQuantity} item{cart.totalLineItemQuantity === 1 ? '' : 's'}</span>
        <span className="font-medium">{formatMoney(cart.totalPrice.centAmount, cart.totalPrice.currencyCode, locale)}</span>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {sdkLoading && !error && (
        <div className="mb-4 text-center text-sm text-charcoal-light">Loading secure checkout…</div>
      )}

      {/* Required mount point for the Checkout Browser SDK — without it the widget
          mounts at the document root and occupies the full page. */}
      <div data-ctc />
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Drawer from '@/components/ui/Drawer';
import { useCartContext } from '@/context/CartContext';
import { formatMoney } from '@/lib/utils';
import { MinusIcon, PlusIcon, TrashIcon } from './icons';

const CHECKOUT_LINK_CLASSES =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-white hover:bg-charcoal-light';

export function MiniCart() {
  const locale = useLocale();
  const { cart, showMiniCart, closeMiniCart, mutateCart } = useCartContext();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const lineItems = cart?.lineItems ?? [];

  async function handleQuantityChange(lineItemId: string, quantity: number) {
    setError(null);
    setPendingId(lineItemId);
    try {
      if (quantity < 1) {
        await mutateCart.removeLineItem(lineItemId);
      } else {
        await mutateCart.changeQuantity(lineItemId, quantity);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your cart.');
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(lineItemId: string) {
    setError(null);
    setPendingId(lineItemId);
    try {
      await mutateCart.removeLineItem(lineItemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this item.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Drawer
      isOpen={showMiniCart}
      onClose={closeMiniCart}
      title="Your Cart"
      position="right"
      footer={
        cart && lineItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm font-medium text-charcoal">
              <span>Subtotal</span>
              <span>{formatMoney(cart.totalPrice.centAmount, cart.totalPrice.currencyCode, locale)}</span>
            </div>
            <Link href="/checkout" onClick={closeMiniCart} className={CHECKOUT_LINK_CLASSES}>
              Checkout
            </Link>
          </div>
        ) : undefined
      }
    >
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {lineItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm text-charcoal-light">Your cart is empty</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {lineItems.map((item) => (
            <li key={item.id} className="flex gap-3 py-4 first:pt-0">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-cream-dark">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/p/${item.sku}`}
                  onClick={closeMiniCart}
                  className="text-sm text-charcoal hover:text-terra-dark"
                >
                  {item.name}
                </Link>
                <span className="text-xs text-charcoal-light">
                  {formatMoney(item.price.centAmount, item.price.currencyCode, locale)}
                </span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      disabled={pendingId === item.id}
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="px-2 py-1 text-charcoal disabled:opacity-40"
                    >
                      <MinusIcon />
                    </button>
                    <span className="w-6 text-center text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={pendingId === item.id}
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="px-2 py-1 text-charcoal disabled:opacity-40"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={pendingId === item.id}
                    onClick={() => handleRemove(item.id)}
                    aria-label="Remove item"
                    className="p-1 text-charcoal-light hover:text-red-600 disabled:opacity-40"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
              <span className="whitespace-nowrap text-sm font-medium text-charcoal">
                {formatMoney(item.totalPrice.centAmount, item.totalPrice.currencyCode, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

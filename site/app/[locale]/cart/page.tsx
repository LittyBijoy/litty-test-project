'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { useCartContext } from '@/context/CartContext';
import { formatMoney } from '@/lib/utils';
import { MinusIcon, PlusIcon, TrashIcon } from '@/components/layout/icons';

const CHECKOUT_LINK_CLASSES =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3 text-base font-medium text-white hover:bg-charcoal-light';
const CONTINUE_SHOPPING_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-white hover:bg-charcoal-light';

export default function CartPage() {
  const locale = useLocale();
  const { cart, isLoading, mutateCart } = useCartContext();

  const [lineError, setLineError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [removingDiscountId, setRemovingDiscountId] = useState<string | null>(null);

  async function handleQuantityChange(lineItemId: string, quantity: number) {
    setLineError(null);
    setPendingId(lineItemId);
    try {
      if (quantity < 1) {
        await mutateCart.removeLineItem(lineItemId);
      } else {
        await mutateCart.changeQuantity(lineItemId, quantity);
      }
    } catch (err) {
      setLineError(err instanceof Error ? err.message : 'Could not update this item.');
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(lineItemId: string) {
    setLineError(null);
    setPendingId(lineItemId);
    try {
      await mutateCart.removeLineItem(lineItemId);
    } catch (err) {
      setLineError(err instanceof Error ? err.message : 'Could not remove this item.');
    } finally {
      setPendingId(null);
    }
  }

  async function handleApplyDiscount(e: FormEvent) {
    e.preventDefault();
    const code = discountCode.trim();
    if (!code) return;
    setDiscountError(null);
    setIsApplyingDiscount(true);
    try {
      await mutateCart.applyDiscountCode(code);
      setDiscountCode('');
    } catch (err) {
      setDiscountError(err instanceof Error ? err.message : 'This discount code could not be applied.');
    } finally {
      setIsApplyingDiscount(false);
    }
  }

  async function handleRemoveDiscount(discountCodeId: string) {
    setDiscountError(null);
    setRemovingDiscountId(discountCodeId);
    try {
      await mutateCart.removeDiscountCode(discountCodeId);
    } catch (err) {
      setDiscountError(err instanceof Error ? err.message : 'Could not remove this discount code.');
    } finally {
      setRemovingDiscountId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-charcoal">Your cart is empty</h1>
        <p className="text-sm text-charcoal-light">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/" className={CONTINUE_SHOPPING_CLASSES}>
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = cart.subtotalPrice ?? cart.totalPrice;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold text-charcoal">Your Cart</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {lineError && <p className="mb-4 text-sm text-red-600">{lineError}</p>}

          <ul className="flex flex-col divide-y divide-border">
            {cart.lineItems.map((item) => (
              <li key={item.id} className="flex gap-4 py-6 first:pt-0">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <Link href={`/p/${item.sku}`} className="text-sm font-medium text-charcoal hover:text-terra-dark">
                    {item.name}
                  </Link>
                  <span className="text-xs text-charcoal-light">SKU: {item.sku}</span>
                  <span className="text-sm text-charcoal-light">
                    {formatMoney(item.price.centAmount, item.price.currencyCode, locale)}
                  </span>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        disabled={pendingId === item.id}
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="px-3 py-1.5 text-charcoal disabled:opacity-40"
                      >
                        <MinusIcon />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={pendingId === item.id}
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="px-3 py-1.5 text-charcoal disabled:opacity-40"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={pendingId === item.id}
                      onClick={() => handleRemove(item.id)}
                      className="flex items-center gap-1 text-sm text-charcoal-light hover:text-red-600 disabled:opacity-40"
                    >
                      <TrashIcon /> Remove
                    </button>
                  </div>
                </div>
                <span className="whitespace-nowrap text-sm font-medium text-charcoal">
                  {formatMoney(item.totalPrice.centAmount, item.totalPrice.currencyCode, locale)}
                </span>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleApplyDiscount}
            className="mt-8 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <Input
                label="Discount code"
                placeholder="Enter code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                error={discountError ?? undefined}
              />
            </div>
            <Button type="submit" variant="outline" isLoading={isApplyingDiscount}>
              Apply
            </Button>
          </form>

          {cart.discountCodes.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {cart.discountCodes.map((dc) => (
                <li
                  key={dc.id}
                  className="flex items-center justify-between rounded-md bg-sage/10 px-3 py-2 text-sm text-sage"
                >
                  <span>{dc.code}</span>
                  <button
                    type="button"
                    disabled={removingDiscountId === dc.id}
                    onClick={() => handleRemoveDiscount(dc.id)}
                    className="text-xs underline disabled:opacity-40"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex h-fit flex-col gap-4 rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-charcoal">Order Summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-charcoal-light">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal.centAmount, subtotal.currencyCode, locale)}</span>
            </div>
            {cart.totalDiscount && cart.totalDiscount.centAmount > 0 && (
              <div className="flex justify-between text-sage">
                <span>Discount</span>
                <span>−{formatMoney(cart.totalDiscount.centAmount, cart.totalDiscount.currencyCode, locale)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-charcoal">
              <span>Total</span>
              <span>{formatMoney(cart.totalPrice.centAmount, cart.totalPrice.currencyCode, locale)}</span>
            </div>
          </div>
          <Link href="/checkout" className={CHECKOUT_LINK_CLASSES}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

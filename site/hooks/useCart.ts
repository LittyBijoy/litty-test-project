'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_CART } from '@/lib/cache-keys';
import type { Cart, Address } from '@/lib/types';

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

export function useCartSWR() {
  return useSWR<Cart | null>(
    KEY_CART,
    async () => {
      const res = await fetch('/api/cart');
      if (!res.ok) return null;
      const data = await res.json();
      return data.cart ?? null;
    },
    { revalidateOnFocus: true }
  );
}

export function useCartMutations() {
  const { mutate } = useSWRConfig();

  async function addItem(sku: string, quantity = 1) {
    const { cart } = await fetchJson('/api/cart', { method: 'POST', body: JSON.stringify({ sku, quantity }) });
    mutate(KEY_CART, cart, { revalidate: false });
    return cart as Cart;
  }

  async function removeLineItem(lineItemId: string) {
    const { cart } = await fetchJson(`/api/cart/line-items/${lineItemId}`, { method: 'DELETE' });
    mutate(KEY_CART, cart, { revalidate: false });
    return cart as Cart;
  }

  async function changeQuantity(lineItemId: string, quantity: number) {
    const { cart } = await fetchJson(`/api/cart/line-items/${lineItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    mutate(KEY_CART, cart, { revalidate: false });
    return cart as Cart;
  }

  async function applyDiscountCode(code: string) {
    const { cart } = await fetchJson('/api/cart/discount', { method: 'POST', body: JSON.stringify({ code }) });
    mutate(KEY_CART, cart, { revalidate: false });
    return cart as Cart;
  }

  async function removeDiscountCode(discountCodeId: string) {
    const { cart } = await fetchJson('/api/cart/discount', {
      method: 'DELETE',
      body: JSON.stringify({ discountCodeId }),
    });
    mutate(KEY_CART, cart, { revalidate: false });
    return cart as Cart;
  }

  async function setAddress(type: 'shipping' | 'billing', address: Address) {
    const { cart } = await fetchJson('/api/cart/address', { method: 'POST', body: JSON.stringify({ type, address }) });
    mutate(KEY_CART, cart, { revalidate: false });
    return cart as Cart;
  }

  async function setShippingMethod(shippingMethodId: string) {
    const { cart } = await fetchJson('/api/cart/shipping-method', {
      method: 'POST',
      body: JSON.stringify({ shippingMethodId }),
    });
    mutate(KEY_CART, cart, { revalidate: false });
    return cart as Cart;
  }

  function clearCart() {
    mutate(KEY_CART, null, { revalidate: false });
  }

  return {
    addItem,
    removeLineItem,
    changeQuantity,
    applyDiscountCode,
    removeDiscountCode,
    setAddress,
    setShippingMethod,
    clearCart,
  };
}

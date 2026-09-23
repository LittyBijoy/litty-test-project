'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useCartSWR, useCartMutations } from '@/hooks/useCart';
import type { Cart } from '@/lib/types';

interface CartContextValue {
  cart: Cart | null | undefined;
  isLoading: boolean;
  showMiniCart: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addToCart: (sku: string, quantity?: number) => Promise<void>;
  mutateCart: ReturnType<typeof useCartMutations>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children, initialCart }: { children: ReactNode; initialCart: Cart | null }) {
  const { data: cart, isLoading } = useCartSWR();
  const mutateCart = useCartMutations();
  const [showMiniCart, setShowMiniCart] = useState(false);

  const openMiniCart = useCallback(() => setShowMiniCart(true), []);
  const closeMiniCart = useCallback(() => setShowMiniCart(false), []);

  const addToCart = useCallback(
    async (sku: string, quantity = 1) => {
      await mutateCart.addItem(sku, quantity);
      openMiniCart();
    },
    [mutateCart, openMiniCart]
  );

  return (
    <CartContext.Provider
      value={{
        cart: cart === undefined ? initialCart : cart,
        isLoading,
        showMiniCart,
        openMiniCart,
        closeMiniCart,
        addToCart,
        mutateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within a CartProvider');
  return ctx;
}

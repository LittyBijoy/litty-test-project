'use client';

import { useCartContext } from '@/context/CartContext';
import { CartIcon } from './icons';

export default function CartButton() {
  const { cart, openMiniCart } = useCartContext();
  const count = cart?.totalLineItemQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openMiniCart}
      aria-label={`Open cart${count > 0 ? `, ${count} items` : ''}`}
      className="relative rounded-full p-2 text-charcoal hover:bg-cream-dark"
    >
      <CartIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terra px-1 text-[10px] font-semibold leading-none text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

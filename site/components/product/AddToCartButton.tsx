'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useCartContext } from '@/context/CartContext';

export default function AddToCartButton({ sku, disabled }: { sku: string; disabled?: boolean }) {
  const { addToCart } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddToCart() {
    setError(null);
    setIsSubmitting(true);
    try {
      await addToCart(sku, quantity);
    } catch {
      setError('Could not add this item to your cart. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={disabled}
            aria-label="Decrease quantity"
            className="px-3 py-2 text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            disabled={disabled}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            aria-label="Quantity"
            className="w-12 border-none bg-transparent text-center text-sm outline-none disabled:opacity-40"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            disabled={disabled}
            aria-label="Increase quantity"
            className="px-3 py-2 text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={disabled}
          isLoading={isSubmitting}
          onClick={handleAddToCart}
          className="flex-1"
        >
          {disabled ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

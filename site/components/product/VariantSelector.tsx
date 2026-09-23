import { Link } from '@/i18n/routing';
import Badge from '@/components/ui/Badge';
import type { Product } from '@/lib/types';

export default function VariantSelector({ product, activeSku }: { product: Product; activeSku: string }) {
  if (product.variants.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-charcoal">Options</span>
      <div className="flex flex-wrap gap-2">
        {product.variants.map((variant) => {
          const isActive = variant.sku === activeSku;
          const isOutOfStock = !variant.availability?.isOnStock;
          const label = variant.sku;

          return (
            <Link
              key={variant.sku}
              href={`/p/${variant.sku}`}
              aria-current={isActive ? 'true' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${
                isActive ? 'border-charcoal bg-charcoal text-white' : 'border-border bg-white text-charcoal hover:bg-cream-dark'
              } ${isOutOfStock ? 'opacity-50' : ''}`}
            >
              <span className={isOutOfStock ? 'line-through' : ''}>{label}</span>
              {isOutOfStock && (
                <Badge variant="info" className={isActive ? 'bg-white/20 text-white' : ''}>
                  Sold out
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

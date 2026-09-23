import { Link } from '@/i18n/routing';
import { formatMoney } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const variant = product.variants[0];
  const sku = variant?.sku;
  const image = variant?.images?.[0];
  const price = variant?.price;

  const card = (
    <>
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-cream-dark">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-charcoal-light">
            No image
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm text-charcoal">{product.name}</h3>
        {price ? (
          <div className="flex items-center gap-2">
            {price.discounted ? (
              <>
                <span className="text-sm font-medium text-terra-dark">
                  {formatMoney(price.discounted.centAmount, price.discounted.currencyCode, locale)}
                </span>
                <span className="text-xs text-charcoal-light line-through">
                  {formatMoney(price.centAmount, price.currencyCode, locale)}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-charcoal">
                {formatMoney(price.centAmount, price.currencyCode, locale)}
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-charcoal-light">Price unavailable</span>
        )}
      </div>
    </>
  );

  if (!sku) {
    return <div className="group">{card}</div>;
  }

  return (
    <Link href={`/p/${sku}`} className="group block">
      {card}
    </Link>
  );
}

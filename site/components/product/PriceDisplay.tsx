import { formatMoney } from '@/lib/utils';
import type { Price } from '@/lib/types';

export default function PriceDisplay({ price, locale }: { price: Price | undefined; locale: string }) {
  if (!price) {
    return <p className="text-charcoal-light">Price unavailable</p>;
  }

  if (price.discounted) {
    return (
      <p className="flex items-baseline gap-2.5">
        <span className="text-2xl font-semibold text-terra-dark">
          {formatMoney(price.discounted.centAmount, price.discounted.currencyCode, locale)}
        </span>
        <span className="text-base text-charcoal-light line-through">
          {formatMoney(price.centAmount, price.currencyCode, locale)}
        </span>
      </p>
    );
  }

  return (
    <p className="text-2xl font-semibold text-charcoal">
      {formatMoney(price.centAmount, price.currencyCode, locale)}
    </p>
  );
}

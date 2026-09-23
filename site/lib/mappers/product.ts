import type {
  ProductProjection,
  ProductVariant as CtProductVariant,
  Price as CtPrice,
  ProductDiscount,
  LocalizedString,
} from '@commercetools/platform-sdk';
import type { Product, Variant, Price } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { mapMoney } from './money';

function mapPrice(ctPrice: CtPrice | undefined, locale: string): Price | undefined {
  if (!ctPrice) return undefined;
  const discountObj = ctPrice.discounted?.discount?.obj as ProductDiscount | undefined;
  return {
    ...mapMoney(ctPrice.value),
    discounted: ctPrice.discounted
      ? {
          ...mapMoney(ctPrice.discounted.value),
          discountName: discountObj
            ? getLocalizedString(discountObj.name as LocalizedString, locale)
            : undefined,
        }
      : undefined,
  };
}

function mapVariant(variant: CtProductVariant, locale: string): Variant {
  return {
    id: variant.id!,
    sku: variant.sku ?? '',
    images: (variant.images ?? []).map((img) => img.url),
    price: mapPrice(variant.price, locale),
    prices: (variant.prices ?? []).map((p) => mapPrice(p, locale)!).filter(Boolean),
    attributes: (variant.attributes ?? []).map((attr) => ({ name: attr.name, value: attr.value })),
    availability: variant.availability?.availableQuantity !== undefined
      ? {
          isOnStock: variant.availability.isOnStock,
          availableQuantity: variant.availability.availableQuantity,
        }
      : undefined,
  };
}

export function mapProductProjection(projection: ProductProjection, locale: string): Product {
  const variants = [projection.masterVariant, ...(projection.variants ?? [])].map((v) =>
    mapVariant(v, locale)
  );
  return {
    type: 'Product',
    id: projection.id,
    name: getLocalizedString(projection.name, locale),
    slug: getLocalizedString(projection.slug, locale),
    description: projection.description ? getLocalizedString(projection.description, locale) : undefined,
    categories: (projection.categories ?? []).map((c) => ({ id: c.id })),
    variants,
  };
}

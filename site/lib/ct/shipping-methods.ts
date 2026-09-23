import { apiRoot } from './client';
import { mapMoney } from '@/lib/mappers/money';
import type { ShippingMethod } from '@/lib/types';

export async function getShippingMethodsForCart(cartId: string): Promise<ShippingMethod[]> {
  const { body } = await apiRoot
    .shippingMethods()
    .matchingCart()
    .get({ queryArgs: { cartId } })
    .execute();

  return body.results.map((method) => {
    const rate = method.zoneRates.flatMap((zr) => zr.shippingRates).find((r) => r.isMatching) ??
      method.zoneRates[0]?.shippingRates[0];
    return {
      id: method.id,
      name: method.name,
      description: method.description,
      price: mapMoney(rate?.price),
      isDefault: method.isDefault ?? false,
    };
  }).filter((m) => m.price.centAmount >= 0);
}

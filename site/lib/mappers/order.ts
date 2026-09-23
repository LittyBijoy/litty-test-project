import type { Order as CtOrder } from '@commercetools/platform-sdk';
import type { Order } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { mapMoney } from './money';

export function mapOrder(order: CtOrder, locale: string): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderState: order.orderState,
    createdAt: order.createdAt,
    lineItems: (order.lineItems ?? []).map((li) => ({
      id: li.id,
      productId: li.productId,
      variantId: li.variant.id,
      slug: getLocalizedString(li.productSlug, locale),
      name: getLocalizedString(li.name, locale),
      sku: li.variant.sku ?? '',
      image: li.variant.images?.[0]?.url,
      quantity: li.quantity,
      price: { ...mapMoney(li.price.value) },
      totalPrice: mapMoney(li.totalPrice),
    })),
    totalPrice: mapMoney(order.totalPrice),
    shippingAddress: order.shippingAddress?.country
      ? {
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          streetName: order.shippingAddress.streetName,
          streetNumber: order.shippingAddress.streetNumber,
          city: order.shippingAddress.city,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        }
      : undefined,
    billingAddress: order.billingAddress?.country
      ? {
          firstName: order.billingAddress.firstName,
          lastName: order.billingAddress.lastName,
          streetName: order.billingAddress.streetName,
          streetNumber: order.billingAddress.streetNumber,
          city: order.billingAddress.city,
          postalCode: order.billingAddress.postalCode,
          country: order.billingAddress.country,
        }
      : undefined,
    shippingInfo: order.shippingInfo
      ? { shippingMethodName: order.shippingInfo.shippingMethodName, price: mapMoney(order.shippingInfo.price) }
      : undefined,
  };
}

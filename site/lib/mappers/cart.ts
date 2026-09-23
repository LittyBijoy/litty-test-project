import type { Cart as CtCart, LineItem as CtLineItem } from '@commercetools/platform-sdk';
import type { Cart, LineItem, Address } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { mapMoney } from './money';

function mapAddress(address: CtCart['shippingAddress']): Address | undefined {
  if (!address || !address.country) return undefined;
  return {
    id: address.id,
    firstName: address.firstName,
    lastName: address.lastName,
    streetName: address.streetName,
    streetNumber: address.streetNumber,
    additionalStreetInfo: address.additionalStreetInfo,
    city: address.city,
    region: address.region,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    email: address.email,
  };
}

function mapLineItem(lineItem: CtLineItem, locale: string): LineItem {
  const price = lineItem.price;
  return {
    id: lineItem.id,
    productId: lineItem.productId,
    variantId: lineItem.variant.id,
    slug: getLocalizedString(lineItem.productSlug, locale),
    name: getLocalizedString(lineItem.name, locale),
    sku: lineItem.variant.sku ?? '',
    image: lineItem.variant.images?.[0]?.url,
    quantity: lineItem.quantity,
    price: {
      ...mapMoney(price.value),
      discounted: price.discounted ? { ...mapMoney(price.discounted.value) } : undefined,
    },
    totalPrice: mapMoney(lineItem.totalPrice),
    availability: lineItem.variant.availability?.availableQuantity !== undefined
      ? {
          isOnStock: lineItem.variant.availability.isOnStock,
          availableQuantity: lineItem.variant.availability.availableQuantity,
        }
      : undefined,
  };
}

export function mapCart(cart: CtCart, locale: string): Cart {
  return {
    id: cart.id,
    version: cart.version,
    customerId: cart.customerId,
    lineItems: (cart.lineItems ?? []).map((li) => mapLineItem(li, locale)),
    totalPrice: mapMoney(cart.totalPrice),
    subtotalPrice: cart.lineItems?.length
      ? {
          centAmount: cart.lineItems.reduce((sum, li) => sum + li.price.value.centAmount * li.quantity, 0),
          currencyCode: cart.totalPrice.currencyCode,
        }
      : undefined,
    totalDiscount: cart.discountOnTotalPrice
      ? mapMoney(cart.discountOnTotalPrice.discountedAmount)
      : undefined,
    shippingAddress: mapAddress(cart.shippingAddress),
    billingAddress: mapAddress(cart.billingAddress),
    shippingInfo: cart.shippingInfo
      ? {
          shippingMethodId: cart.shippingInfo.shippingMethod?.id ?? '',
          shippingMethodName: cart.shippingInfo.shippingMethodName,
          price: mapMoney(cart.shippingInfo.price),
        }
      : undefined,
    discountCodes: (cart.discountCodes ?? []).map((dc) => ({
      id: dc.discountCode.id,
      code: dc.discountCode.obj?.code ?? '',
      state: dc.state,
    })),
    totalLineItemQuantity: cart.totalLineItemQuantity ?? 0,
    taxedPrice: cart.taxedPrice
      ? {
          totalGross: mapMoney(cart.taxedPrice.totalGross),
          totalNet: mapMoney(cart.taxedPrice.totalNet),
          totalTax: cart.taxedPrice.taxPortions?.length
            ? {
                centAmount: cart.taxedPrice.totalGross.centAmount - cart.taxedPrice.totalNet.centAmount,
                currencyCode: cart.taxedPrice.totalGross.currencyCode,
              }
            : undefined,
        }
      : undefined,
  };
}

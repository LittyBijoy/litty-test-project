import { apiRoot } from './client';
import { mapCart } from '@/lib/mappers/cart';
import type { BaseAddress, CartUpdateAction } from '@commercetools/platform-sdk';
import type { Address, Cart } from '@/lib/types';

// Expand the applied discount codes so the mapper can read the human-readable `code` string.
const CART_EXPAND = ['discountCodes[*].discountCode'];

interface CreateCartParams {
  currency: string;
  country: string;
  locale: string;
  customerId?: string;
}

export async function createCart({ currency, country, locale, customerId }: CreateCartParams): Promise<Cart> {
  const { body } = await apiRoot
    .carts()
    .post({
      body: {
        currency,
        country,
        customerId,
        shippingMode: 'Single',
      },
    })
    .execute();
  return mapCart(body, locale);
}

export async function getCart(cartId: string, locale: string): Promise<Cart> {
  const { body } = await apiRoot.carts().withId({ ID: cartId }).get({ queryArgs: { expand: CART_EXPAND } }).execute();
  return mapCart(body, locale);
}

/** Throws if the cart is no longer Active (e.g. Ordered, Merged) — callers should clear the stale cartId from session. */
export async function getActiveCart(cartId: string, locale: string): Promise<Cart> {
  const { body } = await apiRoot.carts().withId({ ID: cartId }).get({ queryArgs: { expand: CART_EXPAND } }).execute();
  if (body.cartState !== 'Active') {
    throw new Error('CartNotActive');
  }
  return mapCart(body, locale);
}

/** Re-fetches the current version before a write — avoids stale-version 409s on rapid sequential updates. */
async function getCurrentVersion(cartId: string): Promise<number> {
  const { body } = await apiRoot.carts().withId({ ID: cartId }).get().execute();
  return body.version;
}

async function updateCart(cartId: string, actions: CartUpdateAction[], locale: string): Promise<Cart> {
  const version = await getCurrentVersion(cartId);
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({ body: { version, actions }, queryArgs: { expand: CART_EXPAND } })
    .execute();
  return mapCart(body, locale);
}

export async function addLineItem(
  cartId: string,
  sku: string,
  quantity: number,
  locale: string
): Promise<Cart> {
  return updateCart(cartId, [{ action: 'addLineItem', sku, quantity }], locale);
}

export async function removeLineItem(cartId: string, lineItemId: string, locale: string): Promise<Cart> {
  return updateCart(cartId, [{ action: 'removeLineItem', lineItemId }], locale);
}

export async function changeLineItemQuantity(
  cartId: string,
  lineItemId: string,
  quantity: number,
  locale: string
): Promise<Cart> {
  return updateCart(cartId, [{ action: 'changeLineItemQuantity', lineItemId, quantity }], locale);
}

function toBaseAddress(address: Address): BaseAddress {
  return {
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

export async function setShippingAddress(cartId: string, address: Address, locale: string): Promise<Cart> {
  return updateCart(cartId, [{ action: 'setShippingAddress', address: toBaseAddress(address) }], locale);
}

export async function setBillingAddress(cartId: string, address: Address, locale: string): Promise<Cart> {
  return updateCart(cartId, [{ action: 'setBillingAddress', address: toBaseAddress(address) }], locale);
}

export async function setShippingMethod(cartId: string, shippingMethodId: string, locale: string): Promise<Cart> {
  return updateCart(
    cartId,
    [{ action: 'setShippingMethod', shippingMethod: { typeId: 'shipping-method', id: shippingMethodId } }],
    locale
  );
}

export async function addDiscountCode(cartId: string, code: string, locale: string): Promise<Cart> {
  return updateCart(cartId, [{ action: 'addDiscountCode', code }], locale);
}

export async function removeDiscountCode(cartId: string, discountCodeId: string, locale: string): Promise<Cart> {
  return updateCart(
    cartId,
    [{ action: 'removeDiscountCode', discountCode: { typeId: 'discount-code', id: discountCodeId } }],
    locale
  );
}

export async function setCustomerEmail(cartId: string, email: string, locale: string): Promise<Cart> {
  return updateCart(cartId, [{ action: 'setCustomerEmail', email }], locale);
}

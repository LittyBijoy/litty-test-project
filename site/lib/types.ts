export interface Money {
  centAmount: number;
  currencyCode: string;
}

export interface Price {
  centAmount: number;
  currencyCode: string;
  discounted?: { centAmount: number; currencyCode: string; discountName?: string };
}

export interface Variant {
  id: number;
  sku: string;
  images: string[];
  price?: Price;
  prices: Price[];
  attributes: Array<{ name: string; value: unknown }>;
  availability?: { isOnStock?: boolean; availableQuantity?: number };
}

export interface Product {
  type: 'Product';
  id: string;
  name: string;
  slug: string;
  description?: string;
  categories: Array<{ id: string }>;
  variants: Variant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: { id: string };
  children?: Category[];
}

export interface FacetBucket {
  key: string;
  label: string;
  count: number;
}

export interface FacetResult {
  name: string;
  kind: 'distinct' | 'ranges';
  buckets: FacetBucket[];
}

export interface FacetMeta {
  name: string;
  field: string;
  fieldType: string;
  kind: 'distinct' | 'ranges';
}

export interface SearchResult {
  products: Product[];
  total: number;
  offset: number;
  limit: number;
  facets: FacetResult[];
  facetMeta: FacetMeta[];
}

export interface Address {
  id?: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  city?: string;
  region?: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface LineItem {
  id: string;
  productId: string;
  variantId: number;
  slug: string;
  name: string;
  sku: string;
  image?: string;
  quantity: number;
  price: Price;
  totalPrice: Money;
  availability?: { isOnStock?: boolean; availableQuantity?: number };
}

export interface DiscountCode {
  id: string;
  code: string;
  state: string;
}

export interface Cart {
  id: string;
  version: number;
  customerId?: string;
  lineItems: LineItem[];
  totalPrice: Money;
  subtotalPrice?: Money;
  totalDiscount?: Money;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingInfo?: { shippingMethodId: string; shippingMethodName: string; price: Money };
  discountCodes: DiscountCode[];
  totalLineItemQuantity: number;
  taxedPrice?: { totalGross: Money; totalNet: Money; totalTax?: Money };
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: Money;
  isDefault: boolean;
}

export interface Account {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export type OrderLineItem = LineItem;

export interface Order {
  id: string;
  orderNumber?: string;
  orderState: string;
  createdAt: string;
  lineItems: OrderLineItem[];
  totalPrice: Money;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingInfo?: { shippingMethodName: string; price: Money };
}

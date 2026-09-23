// Hand-written query/mutation-result types — see the note in
// `use-categories-connector/types.ts` for why these aren't codegen-produced.
// Verified field-by-field against `schemas/ctp.json` (Customer, Address, Order,
// Cart, LineItem, Money, RawCustomField, CustomerUpdateAction).

export interface TMoney {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
}

export interface TAddress {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  streetName?: string | null;
  streetNumber?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country: string;
  phone?: string | null;
}

export interface TRawCustomField {
  name: string;
  value: unknown;
}

export interface TCustomer {
  id: string;
  version: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  customerNumber?: string | null;
  defaultShippingAddressId?: string | null;
  defaultBillingAddressId?: string | null;
  addresses: TAddress[];
  custom?: { customFieldsRaw: TRawCustomField[] } | null;
}

export interface TFetchCustomerByEmailQuery {
  customers: { total: number; results: TCustomer[] };
}
export interface TFetchCustomerByEmailQueryVariables {
  where: string;
}

export interface TOrder {
  id: string;
  orderNumber?: string | null;
  orderState: string;
  createdAt: string;
  totalPrice: TMoney;
}

export interface TFetchCustomerOrdersQuery {
  orders: { total: number; results: TOrder[] };
}
export interface TFetchCustomerOrdersQueryVariables {
  where: string;
  limit: number;
  offset: number;
  sort?: string[];
}

export interface TLocalizedField {
  locale: string;
  value: string;
}

export interface TLineItem {
  id: string;
  quantity: number;
  nameAllLocales: TLocalizedField[];
  totalPrice: TMoney;
}

export interface TCart {
  id: string;
  totalLineItemQuantity: number;
  lastModifiedAt: string;
  totalPrice: TMoney;
  lineItems: TLineItem[];
}

export interface TFetchCustomerActiveCartQuery {
  carts: { total: number; results: TCart[] };
}
export interface TFetchCustomerActiveCartQueryVariables {
  where: string;
}

// Generic commercetools GraphQL update-action shape: one key naming the
// action, whose value is that action's payload — matches every
// `<Resource>UpdateAction` input object.
export type TCustomerUpdateAction = {
  setCustomField: { name: string; value?: string | null };
};

export interface TUpdateCustomerNotesMutation {
  updateCustomer: {
    id: string;
    version: number;
    custom?: { customFieldsRaw: TRawCustomField[] } | null;
  };
}
export interface TUpdateCustomerNotesMutationVariables {
  id: string;
  version: number;
  actions: TCustomerUpdateAction[];
}

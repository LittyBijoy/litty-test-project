import type { Customer as CtCustomer } from '@commercetools/platform-sdk';
import type { Account, Address } from '@/lib/types';

function mapAddress(address: NonNullable<CtCustomer['addresses']>[number]): Address {
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
    country: address.country ?? '',
    phone: address.phone,
    email: address.email,
  };
}

export function mapCustomer(customer: CtCustomer): Account {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    addresses: (customer.addresses ?? []).map(mapAddress),
    defaultShippingAddressId: customer.defaultShippingAddressId,
    defaultBillingAddressId: customer.defaultBillingAddressId,
  };
}

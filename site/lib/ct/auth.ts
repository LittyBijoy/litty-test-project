import { apiRoot } from './client';
import { mapCustomer } from '@/lib/mappers/customer';
import type { Account, Address } from '@/lib/types';

export interface SignInResult {
  customer: Account;
  cartId?: string;
}

/**
 * apiRoot.login().post() is the only valid commercetools login endpoint —
 * apiRoot.customers().login() does not exist in SDK v2.
 */
export async function signInCustomer(
  email: string,
  password: string,
  anonymousCartId?: string
): Promise<SignInResult> {
  const { body } = await apiRoot
    .login()
    .post({
      body: {
        email,
        password,
        ...(anonymousCartId && {
          anonymousCartId,
          anonymousCartSignInMode: 'MergeWithExistingCustomerCart',
        }),
      },
    })
    .execute();
  return { customer: mapCustomer(body.customer), cartId: body.cart?.id };
}

export async function signUpCustomer(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<void> {
  await apiRoot
    .customers()
    .post({ body: { email, password, firstName, lastName } })
    .execute();
  // customers().post() creates the account but does not log the customer in —
  // the register route handler calls signInCustomer() immediately after this.
}

export async function getCustomerById(id: string): Promise<Account | null> {
  try {
    const { body } = await apiRoot.customers().withId({ ID: id }).get().execute();
    return mapCustomer(body);
  } catch {
    return null;
  }
}

export async function updateCustomerProfile(
  id: string,
  firstName?: string,
  lastName?: string
): Promise<Account> {
  const { body: current } = await apiRoot.customers().withId({ ID: id }).get().execute();
  const { body } = await apiRoot
    .customers()
    .withId({ ID: id })
    .post({
      body: {
        version: current.version,
        actions: [
          ...(firstName !== undefined ? [{ action: 'setFirstName' as const, firstName }] : []),
          ...(lastName !== undefined ? [{ action: 'setLastName' as const, lastName }] : []),
        ],
      },
    })
    .execute();
  return mapCustomer(body);
}

export async function addCustomerAddress(id: string, address: Address): Promise<Account> {
  const { body: current } = await apiRoot.customers().withId({ ID: id }).get().execute();
  const { body } = await apiRoot
    .customers()
    .withId({ ID: id })
    .post({
      body: {
        version: current.version,
        actions: [{ action: 'addAddress', address }],
      },
    })
    .execute();
  return mapCustomer(body);
}

export async function removeCustomerAddress(id: string, addressId: string): Promise<Account> {
  const { body: current } = await apiRoot.customers().withId({ ID: id }).get().execute();
  const { body } = await apiRoot
    .customers()
    .withId({ ID: id })
    .post({
      body: {
        version: current.version,
        actions: [{ action: 'removeAddress', addressId }],
      },
    })
    .execute();
  return mapCustomer(body);
}

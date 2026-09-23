/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import {
  useMcLazyQuery,
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchCustomerByEmailQuery from './fetch-customer-by-email.ctp.graphql';
import FetchCustomerOrdersQuery from './fetch-customer-orders.ctp.graphql';
import FetchCustomerActiveCartQuery from './fetch-customer-active-cart.ctp.graphql';
import UpdateCustomerNotesMutation from './update-customer-notes.ctp.graphql';
import type {
  TFetchCustomerByEmailQuery,
  TFetchCustomerByEmailQueryVariables,
  TFetchCustomerOrdersQuery,
  TFetchCustomerOrdersQueryVariables,
  TFetchCustomerActiveCartQuery,
  TFetchCustomerActiveCartQueryVariables,
  TUpdateCustomerNotesMutation,
  TUpdateCustomerNotesMutationVariables,
  TCustomer,
  TOrder,
  TCart,
} from './types';

const SUPPORT_NOTES_FIELD_NAME = 'supportNotes';

// GraphQL `where` predicates are built from user input — quote-escape it so a
// value like `o'brien@example.com` can't break out of the string literal.
const escapePredicateValue = (value: string) => value.replace(/"/g, '\\"');

export const useCustomerByEmailLookup = (): {
  lookupCustomer: (email: string) => void;
  customer?: TCustomer | null;
  notFound: boolean;
  error?: ApolloError;
  loading: boolean;
} => {
  // Apollo Client 3.14 splits lazy-query options: `fetchPolicy` must stay on
  // the hook, while `context` is deprecated there and must move to each
  // `execute()` call instead — asymmetric, but that's what it enforces.
  const [execute, { data, error, loading, called }] = useMcLazyQuery<
    TFetchCustomerByEmailQuery,
    TFetchCustomerByEmailQueryVariables
  >(FetchCustomerByEmailQuery, {
    fetchPolicy: 'network-only',
  });

  const lookupCustomer = (email: string) => {
    execute({
      variables: { where: `email="${escapePredicateValue(email)}"` },
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    });
  };

  return {
    lookupCustomer,
    customer: data?.customers.results[0],
    notFound: called && !loading && !error && data?.customers.total === 0,
    error,
    loading,
  };
};

export const useCustomerOrders = (
  customerId?: string
): {
  orders: TOrder[];
  total: number;
  loading: boolean;
  error?: ApolloError;
} => {
  const { data, error, loading } = useMcQuery<
    TFetchCustomerOrdersQuery,
    TFetchCustomerOrdersQueryVariables
  >(FetchCustomerOrdersQuery, {
    skip: !customerId,
    variables: {
      where: `customerId="${customerId}"`,
      limit: 20,
      offset: 0,
      sort: ['createdAt desc'],
    },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
  });

  return {
    orders: data?.orders.results ?? [],
    total: data?.orders.total ?? 0,
    loading,
    error,
  };
};

export const useCustomerActiveCart = (
  customerId?: string
): { cart?: TCart; loading: boolean; error?: ApolloError } => {
  const { data, error, loading } = useMcQuery<
    TFetchCustomerActiveCartQuery,
    TFetchCustomerActiveCartQueryVariables
  >(FetchCustomerActiveCartQuery, {
    skip: !customerId,
    variables: {
      where: `customerId="${customerId}" and cartState="Active"`,
    },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
  });

  return { cart: data?.carts.results[0], loading, error };
};

export const useUpdateCustomerNotes = () => {
  const [updateCustomerNotes, { loading }] = useMcMutation<
    TUpdateCustomerNotesMutation,
    TUpdateCustomerNotesMutationVariables
  >(UpdateCustomerNotesMutation);

  const execute = async (
    customer: Pick<TCustomer, 'id' | 'version'>,
    notes: string
  ) => {
    const { data } = await updateCustomerNotes({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: {
        id: customer.id,
        version: customer.version,
        actions: [
          {
            setCustomField: {
              name: SUPPORT_NOTES_FIELD_NAME,
              value: JSON.stringify(notes),
            },
          },
        ],
      },
    });
    return data?.updateCustomer;
  };

  return { execute, loading };
};

export { SUPPORT_NOTES_FIELD_NAME };

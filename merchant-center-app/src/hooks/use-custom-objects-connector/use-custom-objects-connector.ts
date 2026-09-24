/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import {
  useMcQuery,
  useMcLazyQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { TDataTableSortingState } from '@commercetools-uikit/hooks';
import FetchCustomObjectsQuery from './fetch-custom-objects.ctp.graphql';
import FetchCustomObjectQuery from './fetch-custom-object.ctp.graphql';
import CreateOrUpdateCustomObjectMutation from './create-or-update-custom-object.ctp.graphql';
import DeleteCustomObjectMutation from './delete-custom-object.ctp.graphql';
import type {
  TFetchCustomObjectsQuery,
  TFetchCustomObjectsQueryVariables,
  TFetchCustomObjectQuery,
  TFetchCustomObjectQueryVariables,
  TCreateOrUpdateCustomObjectMutation,
  TCreateOrUpdateCustomObjectMutationVariables,
  TDeleteCustomObjectMutation,
  TDeleteCustomObjectMutationVariables,
  TCustomObjectSummary,
  TCustomObjectDraft,
  TCustomObject,
} from './types';

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
};
type TUseCustomObjectsFetcher = (
  container: string,
  paginationAndSortingProps: PaginationAndSortingProps
) => {
  customObjectsPaginatedResult?: {
    total: number;
    count: number;
    offset: number;
    results: TCustomObjectSummary[];
  };
  error?: ApolloError;
  loading: boolean;
};

export const useCustomObjectsFetcher: TUseCustomObjectsFetcher = (
  container,
  { page, perPage, tableSorting }
) => {
  const { data, error, loading } = useMcQuery<
    TFetchCustomObjectsQuery,
    TFetchCustomObjectsQueryVariables
  >(FetchCustomObjectsQuery, {
    skip: !container,
    variables: {
      container,
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
  });

  return {
    customObjectsPaginatedResult: data?.customObjects,
    error,
    loading,
  };
};

export const useCustomObjectFetcher = (): {
  fetchCustomObject: (container: string, key: string) => void;
  customObject?: TCustomObject | null;
  error?: ApolloError;
  loading: boolean;
  called: boolean;
} => {
  const [execute, { data, error, loading, called }] = useMcLazyQuery<
    TFetchCustomObjectQuery,
    TFetchCustomObjectQueryVariables
  >(FetchCustomObjectQuery, { fetchPolicy: 'network-only' });

  const fetchCustomObject = (container: string, key: string) => {
    execute({
      variables: { container, key },
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    });
  };

  return {
    fetchCustomObject,
    customObject: data?.customObject,
    error,
    loading,
    called,
  };
};

export const useCustomObjectSaver = () => {
  const [createOrUpdate, { loading }] = useMcMutation<
    TCreateOrUpdateCustomObjectMutation,
    TCreateOrUpdateCustomObjectMutationVariables
  >(CreateOrUpdateCustomObjectMutation);

  const execute = async (draft: TCustomObjectDraft) => {
    const { data } = await createOrUpdate({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: { draft },
    });
    return data?.createOrUpdateCustomObject;
  };

  return { execute, loading };
};

export const useCustomObjectDeleter = () => {
  const [deleteCustomObject, { loading }] = useMcMutation<
    TDeleteCustomObjectMutation,
    TDeleteCustomObjectMutationVariables
  >(DeleteCustomObjectMutation);

  const execute = async (container: string, key: string, version?: number) => {
    await deleteCustomObject({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: { container, key, version },
    });
  };

  return { execute, loading };
};

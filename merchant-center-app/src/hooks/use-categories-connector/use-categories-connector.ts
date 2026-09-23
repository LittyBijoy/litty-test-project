/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { TDataTableSortingState } from '@commercetools-uikit/hooks';
import type {
  TFetchCategoriesQuery,
  TFetchCategoriesQueryVariables,
  TCategoryQueryResult,
} from './types';
import FetchCategoriesQuery from './fetch-categories.ctp.graphql';

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
};
type TUseCategoriesFetcher = (
  paginationAndSortingProps: PaginationAndSortingProps
) => {
  categoriesPaginatedResult?: TCategoryQueryResult;
  error?: ApolloError;
  loading: boolean;
};

export const useCategoriesFetcher: TUseCategoriesFetcher = ({
  page,
  perPage,
  tableSorting,
}) => {
  const { data, error, loading } = useMcQuery<
    TFetchCategoriesQuery,
    TFetchCategoriesQueryVariables
  >(FetchCategoriesQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    categoriesPaginatedResult: data?.categories,
    error,
    loading,
  };
};

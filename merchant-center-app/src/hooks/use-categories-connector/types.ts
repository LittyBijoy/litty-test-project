// Hand-written query-result types for FetchCategories.
//
// The Channels feature this mirrors gets its types from `src/types/generated/ctp.ts`,
// produced by a GraphQL codegen run against `schemas/ctp.json` in the upstream
// template repo's own toolchain. That codegen script isn't wired into this scaffolded
// project (no `codegen`/`graphql-codegen` script in package.json), so these types are
// written by hand against the same schema file instead — verified field-by-field
// against `schemas/ctp.json`'s `Category` and `CategoryQueryResult` types.
export interface TLocalizedField {
  locale: string;
  value: string;
}

export interface TCategory {
  id: string;
  key?: string | null;
  childCount: number;
  stagedProductCount: number;
  orderHint: string;
  nameAllLocales: TLocalizedField[];
}

export interface TCategoryQueryResult {
  total: number;
  count: number;
  offset: number;
  results: TCategory[];
}

export interface TFetchCategoriesQuery {
  categories: TCategoryQueryResult;
}

export interface TFetchCategoriesQueryVariables {
  limit: number;
  offset: number;
  sort?: string[];
}

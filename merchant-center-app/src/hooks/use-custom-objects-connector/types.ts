// Hand-written query/mutation-result types — see the note in
// `use-categories-connector/types.ts` for why these aren't codegen-produced.
// Verified field-by-field against `schemas/ctp.json` (CustomObject,
// CustomObjectQueryResult, CustomObjectDraft, and the customObject(s) /
// createOrUpdateCustomObject / deleteCustomObject Query & Mutation fields).

export interface TCustomObjectSummary {
  id: string;
  container: string;
  key: string;
  version: number;
  lastModifiedAt: string;
}

export interface TCustomObject extends TCustomObjectSummary {
  // `Json` scalar — arrives already parsed as a native JS value (object,
  // array, string, number, boolean, or null), never a JSON-encoded string.
  value: unknown;
  createdAt: string;
}

export interface TFetchCustomObjectsQuery {
  customObjects: {
    total: number;
    count: number;
    offset: number;
    results: TCustomObjectSummary[];
  };
}
export interface TFetchCustomObjectsQueryVariables {
  container: string;
  limit: number;
  offset: number;
  sort?: string[];
}

export interface TFetchCustomObjectQuery {
  customObject: TCustomObject | null;
}
export interface TFetchCustomObjectQueryVariables {
  container: string;
  key: string;
}

// CustomObjectDraft.value is `String!` over GraphQL — the caller must
// JSON.stringify() the actual value before sending it.
export interface TCustomObjectDraft {
  container: string;
  key: string;
  value: string;
  version?: number;
}

export interface TCreateOrUpdateCustomObjectMutation {
  createOrUpdateCustomObject: TCustomObject;
}
export interface TCreateOrUpdateCustomObjectMutationVariables {
  draft: TCustomObjectDraft;
}

export interface TDeleteCustomObjectMutation {
  deleteCustomObject: { id: string };
}
export interface TDeleteCustomObjectMutationVariables {
  container: string;
  key: string;
  version?: number;
}

import { apiRoot } from './client';
import { mapProductProjection } from '@/lib/mappers/product';
import { mapFacetResults } from '@/lib/mappers/facet';
import { getSearchableAttributes } from './product-types';
import type {
  AttributeDefinition,
  AttributeType,
  ProductSearchFacetExpression,
  ProductSearchRequest,
  SearchFieldType,
  _SearchQuery,
} from '@commercetools/platform-sdk';
import type { FacetMeta, Product, SearchResult } from '@/lib/types';

export interface SearchParams {
  text?: string;
  categoryId?: string;
  sku?: string;
  locale: string;
  currency: string;
  country: string;
  /** facet name -> raw URL value (comma-joined for distinct, "<from>-<to>" for ranges) */
  filters?: Record<string, string>;
  sort?: { field: string; order: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

const RANGE_TYPES = new Set<SearchFieldType>([
  'number',
  'money',
  'date',
  'datetime',
  'time',
  'set_number',
  'set_money',
  'set_date',
  'set_datetime',
  'set_time',
]);

function toSearchFieldType(type: AttributeType): SearchFieldType | undefined {
  if (type.name === 'set') {
    const inner = toSearchFieldType(type.elementType);
    return inner ? (`set_${inner}` as SearchFieldType) : undefined;
  }
  if (type.name === 'reference' || type.name === 'nested') return undefined;
  if (type.name === 'lenum') return 'enum'; // lenum queries by its .key subfield, typed as plain enum
  return type.name as SearchFieldType;
}

function facetField(attr: AttributeDefinition, fieldType: SearchFieldType): string {
  const base = `variants.attributes.${attr.name}`;
  return fieldType === 'enum' || fieldType === 'set_enum' ? `${base}.key` : base;
}

interface FacetConfig {
  expressions: ProductSearchFacetExpression[];
  meta: FacetMeta[];
}

function buildFacetConfig(attributes: AttributeDefinition[], locale: string): FacetConfig {
  const expressions: ProductSearchFacetExpression[] = [];
  const meta: FacetMeta[] = [];

  // Always-present facets first.
  expressions.push({
    distinct: { name: 'isOnStock', field: 'variants.availability.isOnStock', fieldType: 'boolean' },
  } as ProductSearchFacetExpression);
  meta.push({ name: 'isOnStock', field: 'variants.availability.isOnStock', fieldType: 'boolean', kind: 'distinct' });

  expressions.push({
    ranges: {
      name: 'price',
      field: 'variants.prices.centAmount',
      fieldType: 'money',
      ranges: [{ from: 0 }],
    },
  } as ProductSearchFacetExpression);
  meta.push({ name: 'price', field: 'variants.prices.centAmount', fieldType: 'number', kind: 'ranges' });

  for (const attr of attributes) {
    const fieldType = toSearchFieldType(attr.type);
    if (!fieldType) continue; // skip reference / nested
    const field = facetField(attr, fieldType);
    const isRange = RANGE_TYPES.has(fieldType);

    if (isRange) {
      expressions.push({
        ranges: { name: attr.name, field, fieldType, ranges: [{ from: 0 }] },
      } as ProductSearchFacetExpression);
      meta.push({ name: attr.name, field, fieldType, kind: 'ranges' });
    } else {
      expressions.push({
        distinct: { name: attr.name, field, fieldType, language: locale },
      } as ProductSearchFacetExpression);
      meta.push({ name: attr.name, field, fieldType, kind: 'distinct' });
    }
  }

  return { expressions, meta };
}

function buildPostFilter(
  filters: Record<string, string> | undefined,
  meta: FacetMeta[],
  locale: string
): _SearchQuery | undefined {
  if (!filters) return undefined;
  const clauses: _SearchQuery[] = [];

  for (const [name, rawValue] of Object.entries(filters)) {
    const m = meta.find((f) => f.name === name);
    if (!m || !rawValue) continue;

    if (m.kind === 'distinct') {
      const values = rawValue.split(',').filter(Boolean);
      if (values.length === 0) continue;
      const exacts = values.map((v) => ({
        exact: {
          field: m.field,
          fieldType: m.fieldType,
          language: m.fieldType === 'boolean' ? undefined : locale,
          value: m.fieldType === 'boolean' ? v === 'true' : v,
        },
      }));
      clauses.push(exacts.length === 1 ? exacts[0] : { or: exacts });
    } else {
      const [fromStr, toStr] = rawValue.split('-');
      const gte = fromStr && fromStr !== '*' ? Number(fromStr) : undefined;
      const lte = toStr && toStr !== '*' ? Number(toStr) : undefined;
      const isMoneyOrNumber = m.fieldType === 'number' || m.fieldType === 'money' ||
        m.fieldType === 'set_number' || m.fieldType === 'set_money';
      clauses.push({
        range: { field: m.field, fieldType: m.fieldType, ...(gte !== undefined && { gte }), ...(lte !== undefined && { lte }) },
      } as _SearchQuery);
      void isMoneyOrNumber; // both number and long ranges share the { range: {...} } shape on the wire
    }
  }

  if (clauses.length === 0) return undefined;
  return clauses.length === 1 ? clauses[0] : { and: clauses };
}

export async function searchProducts(params: SearchParams): Promise<SearchResult> {
  const { text, categoryId, locale, currency, country, filters, sort, limit = 24, offset = 0 } = params;
  const attributes = await getSearchableAttributes();
  const { expressions, meta } = buildFacetConfig(attributes, locale);

  const queryClauses: _SearchQuery[] = [];
  if (text) {
    queryClauses.push({ fullText: { field: 'name', language: locale, value: text } });
  }
  if (categoryId) {
    queryClauses.push({ exact: { field: 'categoriesSubTree', value: categoryId } });
  }

  const searchRequest: ProductSearchRequest = {
    query: queryClauses.length === 0 ? undefined : queryClauses.length === 1 ? queryClauses[0] : { and: queryClauses },
    postFilter: buildPostFilter(filters, meta, locale),
    facets: expressions,
    sort: sort ? [{ field: sort.field, order: sort.order }] : undefined,
    productProjectionParameters: {
      priceCurrency: currency,
      priceCountry: country,
      localeProjection: [locale],
      expand: ['masterVariant.price.discounted.discount', 'variants[*].price.discounted.discount'],
    },
    markMatchingVariants: true,
    limit,
    offset,
  };

  const { body } = await apiRoot.products().search().post({ body: searchRequest }).execute();

  const products: Product[] = body.results
    .map((r) => r.productProjection)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => mapProductProjection(p, locale));

  return {
    products,
    total: body.total ?? products.length,
    offset: body.offset ?? offset,
    limit: body.limit ?? limit,
    facets: mapFacetResults(body.facets, meta),
    facetMeta: meta,
  };
}

export async function getProductBySku(
  sku: string,
  locale: string,
  currency: string,
  country: string
): Promise<Product | null> {
  const { body } = await apiRoot
    .products()
    .search()
    .post({
      body: {
        query: { exact: { field: 'variants.sku', value: sku } },
        productProjectionParameters: {
          priceCurrency: currency,
          priceCountry: country,
          localeProjection: [locale],
          expand: ['masterVariant.price.discounted.discount', 'variants[*].price.discounted.discount'],
        },
        limit: 1,
      },
    })
    .execute();

  const projection = body.results[0]?.productProjection;
  return projection ? mapProductProjection(projection, locale) : null;
}

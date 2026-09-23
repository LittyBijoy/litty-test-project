import type { SearchParams as CtSearchParams } from '@/lib/ct/search';

/** The shape Next.js hands page components for `searchParams` once awaited. */
export type UrlSearchParams = Record<string, string | string[] | undefined>;

export function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

/** Every `f_<name>` key becomes a facet filter, `name` -> raw URL value. */
export function parseFilters(searchParams: UrlSearchParams): Record<string, string> {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (!key.startsWith('f_')) continue;
    const raw = firstParam(value);
    if (raw) filters[key.slice(2)] = raw;
  }
  return filters;
}

const SORT_FIELDS = new Set(['name', 'price']);

/** Maps the `sort` URL value (e.g. `name-asc`) to a searchProducts sort clause. */
export function parseSort(searchParams: UrlSearchParams): CtSearchParams['sort'] | undefined {
  const raw = firstParam(searchParams.sort);
  if (!raw) return undefined;
  const [field, order] = raw.split('-');
  if (!field || !SORT_FIELDS.has(field) || (order !== 'asc' && order !== 'desc')) return undefined;
  return { field, order };
}

export function parseOffset(searchParams: UrlSearchParams): number {
  const raw = firstParam(searchParams.offset);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

import { unstable_cache } from 'next/cache';
import { apiRoot } from './client';
import { getLocalizedString } from '@/lib/utils';
import type { AttributeDefinition } from '@commercetools/platform-sdk';

async function fetchAllAttributes(): Promise<AttributeDefinition[]> {
  const { body } = await apiRoot.productTypes().get({ queryArgs: { limit: 500 } }).execute();
  const byName = new Map<string, AttributeDefinition>();
  for (const productType of body.results) {
    for (const attr of productType.attributes ?? []) {
      if (!byName.has(attr.name)) {
        byName.set(attr.name, attr);
      }
    }
  }
  return Array.from(byName.values());
}

// Product type schemas change rarely — cache aggressively (shared across requests, no per-user data).
const getAllAttributes = unstable_cache(fetchAllAttributes, ['all-attributes'], { revalidate: 3600 });

export async function getSearchableAttributes(): Promise<AttributeDefinition[]> {
  const attributes = await getAllAttributes();
  return attributes.filter((a) => a.isSearchable);
}

/** Localized attribute name -> display label, for rendering product spec tables without hardcoding names. */
export async function getAttributeLabels(locale: string): Promise<Record<string, string>> {
  const attributes = await getAllAttributes();
  return Object.fromEntries(attributes.map((a) => [a.name, getLocalizedString(a.label, locale)]));
}

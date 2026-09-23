import { unstable_cache } from 'next/cache';
import { apiRoot } from './client';
import { mapCategory, buildCategoryTree } from '@/lib/mappers/category';
import type { Category } from '@/lib/types';

async function fetchCategoryTree(locale: string): Promise<Category[]> {
  const { body } = await apiRoot.categories().get({ queryArgs: { limit: 500 } }).execute();
  return buildCategoryTree(body.results, locale);
}

// Category tree is stable and reused across every page — cache with a short TTL.
export const getCategoryTree = unstable_cache(fetchCategoryTree, ['category-tree'], { revalidate: 60 });

export async function getCategoryBySlug(slug: string, locale: string): Promise<Category | null> {
  const { body } = await apiRoot
    .categories()
    .get({ queryArgs: { where: `slug(${locale}="${slug}")`, limit: 1 } })
    .execute();
  const category = body.results[0];
  return category ? mapCategory(category, locale) : null;
}

export async function getCategoryById(id: string, locale: string): Promise<Category | null> {
  try {
    const { body } = await apiRoot.categories().withId({ ID: id }).get().execute();
    return mapCategory(body, locale);
  } catch {
    return null;
  }
}

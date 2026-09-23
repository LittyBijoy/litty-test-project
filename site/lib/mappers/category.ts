import type { Category as CtCategory } from '@commercetools/platform-sdk';
import type { Category } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

export function mapCategory(category: CtCategory, locale: string): Category {
  return {
    id: category.id,
    name: getLocalizedString(category.name, locale),
    slug: getLocalizedString(category.slug, locale),
    parent: category.parent ? { id: category.parent.id } : undefined,
  };
}

export function buildCategoryTree(categories: CtCategory[], locale: string): Category[] {
  const mapped = new Map<string, Category>(
    categories.map((c) => [c.id, mapCategory(c, locale)])
  );
  const roots: Category[] = [];
  for (const category of categories) {
    const node = mapped.get(category.id)!;
    if (category.parent && mapped.has(category.parent.id)) {
      const parent = mapped.get(category.parent.id)!;
      parent.children = parent.children ? [...parent.children, node] : [node];
    } else {
      roots.push(node);
    }
  }
  return roots;
}

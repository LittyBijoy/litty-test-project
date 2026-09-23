'use client';

import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { FacetResult } from '@/lib/types';

interface Pill {
  paramKey: string;
  value: string;
  label: string;
}

interface ActiveFiltersProps {
  facets: FacetResult[];
  searchParams: ReadonlyURLSearchParams;
  onNavigate: (updates: Record<string, string | null>) => void;
}

export default function ActiveFilters({ facets, searchParams, onNavigate }: ActiveFiltersProps) {
  const pills: Pill[] = [];

  for (const facet of facets) {
    const paramKey = `f_${facet.name}`;
    const raw = searchParams.get(paramKey);
    if (!raw) continue;
    for (const value of raw.split(',').filter(Boolean)) {
      const bucket = facet.buckets.find((b) => b.key === value);
      pills.push({ paramKey, value, label: bucket?.label ?? value });
    }
  }

  if (pills.length === 0) return null;

  function removePill(pill: Pill) {
    const raw = searchParams.get(pill.paramKey) ?? '';
    const remaining = raw.split(',').filter((v) => v && v !== pill.value);
    onNavigate({ [pill.paramKey]: remaining.length > 0 ? remaining.join(',') : null });
  }

  function clearAll() {
    const updates: Record<string, string | null> = {};
    for (const facet of facets) updates[`f_${facet.name}`] = null;
    onNavigate(updates);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
      {pills.map((pill) => (
        <button
          key={`${pill.paramKey}-${pill.value}`}
          type="button"
          onClick={() => removePill(pill)}
          className="inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1 text-xs text-charcoal hover:bg-border"
        >
          {pill.label}
          <span aria-hidden="true">×</span>
        </button>
      ))}
      {pills.length >= 2 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-terra-dark hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

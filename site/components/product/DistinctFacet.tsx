'use client';

import type { FacetResult } from '@/lib/types';

interface DistinctFacetProps {
  facet: FacetResult;
  current: string;
  onChange: (value: string | null) => void;
}

export default function DistinctFacet({ facet, current, onChange }: DistinctFacetProps) {
  const selected = current ? current.split(',').filter(Boolean) : [];

  function toggle(key: string) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
    onChange(next.length > 0 ? next.join(',') : null);
  }

  return (
    <ul className="flex flex-col gap-2">
      {facet.buckets.map((bucket) => (
        <li key={bucket.key}>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal-light hover:text-charcoal">
            <input
              type="checkbox"
              checked={selected.includes(bucket.key)}
              onChange={() => toggle(bucket.key)}
              className="h-4 w-4 rounded border-border accent-terra"
            />
            <span className="flex-1">{bucket.label}</span>
            <span className="text-xs text-charcoal-light">{bucket.count}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

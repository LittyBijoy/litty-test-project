'use client';

import type { FacetResult } from '@/lib/types';

interface RangeFacetProps {
  facet: FacetResult;
  current: string;
  onChange: (value: string | null) => void;
}

export default function RangeFacet({ facet, current, onChange }: RangeFacetProps) {
  return (
    <ul className="flex flex-col gap-2">
      {facet.buckets.map((bucket) => {
        const isSelected = current === bucket.key;
        return (
          <li key={bucket.key}>
            <button
              type="button"
              onClick={() => onChange(isSelected ? null : bucket.key)}
              aria-pressed={isSelected}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                isSelected
                  ? 'bg-terra/15 font-medium text-terra-dark'
                  : 'text-charcoal-light hover:bg-cream-dark hover:text-charcoal'
              }`}
            >
              <span>{bucket.label}</span>
              <span className="text-xs">{bucket.count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

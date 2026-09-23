'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import type { FacetResult, FacetMeta } from '@/lib/types';
import DistinctFacet from './DistinctFacet';
import RangeFacet from './RangeFacet';
import ActiveFilters from './ActiveFilters';

interface FacetPanelProps {
  facets: FacetResult[];
  facetMeta: FacetMeta[];
}

export default function FacetPanel({ facets, facetMeta }: FacetPanelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    }
    params.delete('offset');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  const activeFacets = facets.filter((facet) => facet.buckets.length > 0);

  if (activeFacets.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <ActiveFilters facets={activeFacets} searchParams={searchParams} onNavigate={navigate} />
      {activeFacets.map((facet) => {
        const meta = facetMeta.find((m) => m.name === facet.name);
        const kind = meta?.kind ?? facet.kind;
        const current = searchParams.get(`f_${facet.name}`) ?? '';
        return (
          <div key={facet.name} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
            <h3 className="mb-3 text-sm font-semibold capitalize text-charcoal">{facet.name}</h3>
            {kind === 'distinct' ? (
              <DistinctFacet
                facet={facet}
                current={current}
                onChange={(value) => navigate({ [`f_${facet.name}`]: value })}
              />
            ) : (
              <RangeFacet
                facet={facet}
                current={current}
                onChange={(value) => navigate({ [`f_${facet.name}`]: value })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

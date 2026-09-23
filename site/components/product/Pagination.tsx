import { Link } from '@/i18n/routing';

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  /** Current URL search params (already resolved on the server), used to preserve q/sort/f_* when paging. */
  searchParams: Record<string, string | string[] | undefined>;
}

function buildHref(searchParams: Record<string, string | string[] | undefined>, offset: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'offset' || value === undefined) continue;
    if (Array.isArray(value)) {
      if (value[0] !== undefined) params.set(key, value[0]);
    } else {
      params.set(key, value);
    }
  }
  if (offset > 0) params.set('offset', String(offset));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default function Pagination({ total, limit, offset, searchParams }: PaginationProps) {
  if (total === 0) return null;

  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + limit, total);

  const prevOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
      <p className="text-sm text-charcoal-light">
        Showing {rangeStart}–{rangeEnd} of {total}
      </p>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildHref(searchParams, prevOffset) || '?'}
            className="rounded-full border border-border px-4 py-2 text-sm text-charcoal hover:bg-cream-dark"
          >
            Previous
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-full border border-border px-4 py-2 text-sm text-charcoal-light/50">
            Previous
          </span>
        )}
        {hasNext ? (
          <Link
            href={buildHref(searchParams, nextOffset)}
            className="rounded-full border border-border px-4 py-2 text-sm text-charcoal hover:bg-cream-dark"
          >
            Next
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-full border border-border px-4 py-2 text-sm text-charcoal-light/50">
            Next
          </span>
        )}
      </div>
    </div>
  );
}

import type { Variant } from '@/lib/types';

function isEnumLike(value: unknown): value is { key?: unknown; label?: unknown } {
  return typeof value === 'object' && value !== null && ('label' in value || 'key' in value);
}

function renderPrimitive(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (isEnumLike(value)) {
    const { label, key } = value;
    if (typeof label === 'string') return label;
    if (typeof key === 'string') return key;
  }
  return '';
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value.map((v) => renderPrimitive(v)).filter(Boolean).join(', ');
  }
  return renderPrimitive(value);
}

export default function AttributesTable({
  attributes,
  labels,
}: {
  attributes: Variant['attributes'];
  labels: Record<string, string>;
}) {
  const rows = attributes
    .map((attr) => ({ label: labels[attr.name] ?? attr.name, value: renderValue(attr.value) }))
    .filter((row) => row.value !== '');

  if (rows.length === 0) return null;

  return (
    <div className="border-t border-border pt-6">
      <h2 className="mb-3 text-sm font-medium text-charcoal">Specifications</h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 border-b border-border py-2 sm:justify-start">
            <dt className="text-charcoal-light">{row.label}</dt>
            <dd className="text-charcoal sm:ml-auto">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

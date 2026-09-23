'use client';

import { useState, type ChangeEvent } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { COUNTRY_CONFIG } from '@/lib/utils';

export default function LocaleSwitcher() {
  const router = useRouter();
  const currentLocale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const locale = e.target.value;
    if (locale === currentLocale) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) throw new Error('Could not switch region');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not switch region');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col">
      <select
        aria-label="Country and currency"
        defaultValue={currentLocale}
        onChange={handleChange}
        disabled={isSubmitting}
        className="rounded-full border border-border bg-transparent px-3 py-2 text-sm text-charcoal outline-none disabled:opacity-50"
      >
        {Object.values(COUNTRY_CONFIG).map((c) => (
          <option key={c.locale} value={c.locale}>
            {c.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

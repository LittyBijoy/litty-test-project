'use client';

import useSWR from 'swr';
import type { ShippingMethod } from '@/lib/types';

/** Keyed on country+currency so it refetches on locale change and never fetches before both are known. */
export function useShippingMethods(country: string | null, currency: string | null) {
  const key = country && currency ? `shipping-methods-${country}-${currency}` : null;
  return useSWR<ShippingMethod[]>(
    key,
    async () => {
      const res = await fetch('/api/shipping-methods');
      if (!res.ok) return [];
      const data = await res.json();
      return data.shippingMethods ?? [];
    },
    { revalidateOnFocus: false }
  );
}

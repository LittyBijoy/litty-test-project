'use client';

import useSWR from 'swr';
import { KEY_ORDERS } from '@/lib/cache-keys';
import type { Order } from '@/lib/types';

export function useOrders() {
  return useSWR<Order[]>(
    KEY_ORDERS,
    async () => {
      const res = await fetch('/api/account/orders');
      if (!res.ok) return [];
      const data = await res.json();
      return data.orders ?? [];
    },
    { revalidateOnFocus: false }
  );
}

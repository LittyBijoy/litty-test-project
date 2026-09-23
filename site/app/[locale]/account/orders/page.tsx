'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useOrders } from '@/hooks/useOrders';
import { formatMoney } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

const STATE_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  Complete: 'success',
  Confirmed: 'success',
  Open: 'info',
  Cancelled: 'error',
};

export default function OrdersPage() {
  const { data, isLoading } = useOrders();
  const orders = data ?? [];
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-charcoal-light">
        <Spinner className="h-4 w-4" />
        <span>Loading orders…</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-12">
        <h2 className="text-lg font-medium text-charcoal">Orders</h2>
        <p className="mt-3 text-sm text-charcoal-light">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-terra px-6 py-2.5 text-sm text-white hover:bg-terra-dark"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-charcoal">Orders</h2>
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[640px] divide-y divide-border rounded-lg border border-border bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between gap-4 px-4 py-4 text-sm hover:bg-cream-dark"
            >
              <span className="font-medium text-charcoal">#{order.orderNumber ?? order.id}</span>
              <span className="text-charcoal-light">{dateFormatter.format(new Date(order.createdAt))}</span>
              <Badge variant={STATE_VARIANT[order.orderState] ?? 'info'}>{order.orderState}</Badge>
              <span className="text-charcoal-light">
                {order.lineItems.length} item{order.lineItems.length === 1 ? '' : 's'}
              </span>
              <span className="font-medium text-charcoal">
                {formatMoney(order.totalPrice.centAmount, order.totalPrice.currencyCode, locale)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
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

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { data, isLoading } = useOrders();
  const orders = data ?? [];
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-charcoal-light">
        <Spinner className="h-4 w-4" />
        <span>Loading order…</span>
      </div>
    );
  }

  const order = orders.find((o) => o.id === params.orderId);

  if (!order) {
    return (
      <div className="py-12">
        <h2 className="text-lg font-medium text-charcoal">Order not found</h2>
        <Link href="/account/orders" className="mt-4 inline-block text-sm font-medium text-terra hover:text-terra-dark">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/account/orders" className="text-sm font-medium text-terra hover:text-terra-dark">
        Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-charcoal">Order #{order.orderNumber ?? order.id}</h2>
        <Badge variant={STATE_VARIANT[order.orderState] ?? 'info'}>{order.orderState}</Badge>
      </div>
      <p className="mt-1 text-sm text-charcoal-light">Placed on {dateFormatter.format(new Date(order.createdAt))}</p>

      <div className="mt-6 rounded-lg border border-border bg-white p-6">
        <h3 className="mb-4 font-medium text-charcoal">Items</h3>
        <ul className="divide-y divide-border">
          {order.lineItems.map((li) => (
            <li key={li.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span>
                {li.name} <span className="text-charcoal-light">× {li.quantity}</span>
              </span>
              <span className="font-medium">{formatMoney(li.totalPrice.centAmount, li.totalPrice.currencyCode, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 font-semibold">
          <span>Total</span>
          <span>{formatMoney(order.totalPrice.centAmount, order.totalPrice.currencyCode, locale)}</span>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="mt-6 rounded-lg border border-border bg-white p-6 text-sm">
          <h3 className="mb-2 font-medium text-charcoal">Shipping address</h3>
          <p className="text-charcoal-light">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            <br />
            {order.shippingAddress.streetNumber} {order.shippingAddress.streetName}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>
      )}
    </div>
  );
}

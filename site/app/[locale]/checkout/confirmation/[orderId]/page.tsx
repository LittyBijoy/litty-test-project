import { getOrderById } from '@/lib/ct/orders';
import { formatMoney } from '@/lib/utils';
import { Link } from '@/i18n/routing';

// Server-rendered, fetches the order fresh by id — never trust a just-revalidated
// client cache here, the order may not be reflected there yet.
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string; locale: string }>;
}) {
  const { orderId, locale } = await params;
  let order = null;
  try {
    order = await getOrderById(orderId, locale);
  } catch {
    // fall through to a minimal confirmation without line items
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Thank you for your order!</h1>
        <p className="mt-3 text-charcoal-light">
          {order?.orderNumber ? (
            <>
              Order <span className="font-medium text-charcoal">#{order.orderNumber}</span> has been placed.
            </>
          ) : (
            'Your order has been placed.'
          )}{' '}
          You&apos;ll receive a confirmation email shortly.
        </p>
      </div>

      {order && (
        <div className="mt-10 rounded-lg border border-border bg-white p-6">
          <h2 className="mb-4 font-medium">Order summary</h2>
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
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="inline-block rounded-full bg-terra px-6 py-2.5 text-white hover:bg-terra-dark">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

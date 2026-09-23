import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createCheckoutSession } from '@/lib/ct/checkout-session';

// Create the Checkout Session as late as possible (when the user lands on the
// checkout/payment page) — Checkout Sessions expire, so never create one at cart-create time.
export async function POST() {
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  try {
    const checkoutSession = await createCheckoutSession(session.cartId);
    return NextResponse.json(checkoutSession);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create checkout session';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

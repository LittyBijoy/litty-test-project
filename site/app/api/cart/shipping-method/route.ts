import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { setShippingMethod } from '@/lib/ct/cart';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  const { shippingMethodId } = (await req.json().catch(() => ({}))) as { shippingMethodId?: string };
  if (!shippingMethodId) {
    return NextResponse.json({ error: 'shippingMethodId is required' }, { status: 400 });
  }
  try {
    const { locale } = await getLocale();
    const cart = await setShippingMethod(session.cartId, shippingMethodId, locale);
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to set shipping method';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

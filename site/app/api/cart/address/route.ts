import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { setShippingAddress, setBillingAddress } from '@/lib/ct/cart';
import type { Address } from '@/lib/types';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  const { type, address } = (await req.json().catch(() => ({}))) as {
    type?: 'shipping' | 'billing';
    address?: Address;
  };
  if (!type || !address?.country) {
    return NextResponse.json({ error: 'type and address.country are required' }, { status: 400 });
  }
  try {
    const { locale } = await getLocale();
    const cart =
      type === 'shipping'
        ? await setShippingAddress(session.cartId, address, locale)
        : await setBillingAddress(session.cartId, address, locale);
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to set address';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

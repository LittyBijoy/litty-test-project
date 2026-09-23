import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale, createSessionToken, setSessionCookie } from '@/lib/session';
import { getActiveCart, createCart, addLineItem } from '@/lib/ct/cart';

export async function GET() {
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ cart: null });
  }
  const { locale } = await getLocale();
  try {
    const cart = await getActiveCart(session.cartId, locale);
    return NextResponse.json({ cart });
  } catch {
    // Cart no longer active, or no longer found — clear the stale reference.
    const res = NextResponse.json({ cart: null });
    const token = await createSessionToken({ ...session, cartId: undefined });
    return setSessionCookie(res, token);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const { country, currency, locale } = await getLocale();
  const body = await req.json().catch(() => ({}));
  const { sku, quantity } = body as { sku?: string; quantity?: number };

  try {
    let cart = session.cartId ? await getActiveCart(session.cartId, locale).catch(() => null) : null;
    if (!cart) {
      cart = await createCart({ currency, country, locale, customerId: session.customerId });
    }
    if (sku) {
      cart = await addLineItem(cart.id, sku, quantity ?? 1, locale);
    }

    const res = NextResponse.json({ cart });
    const token = await createSessionToken({ ...session, cartId: cart.id });
    return setSessionCookie(res, token);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create cart';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

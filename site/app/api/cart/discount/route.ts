import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { addDiscountCode, removeDiscountCode } from '@/lib/ct/cart';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 });
  }
  try {
    const { locale } = await getLocale();
    const cart = await addDiscountCode(session.cartId, code, locale);
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    // Surface the commercetools error message (e.g. invalid/expired code) back to the UI.
    const msg = e instanceof Error ? e.message : 'Invalid discount code';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  const { discountCodeId } = (await req.json().catch(() => ({}))) as { discountCodeId?: string };
  if (!discountCodeId) {
    return NextResponse.json({ error: 'discountCodeId is required' }, { status: 400 });
  }
  try {
    const { locale } = await getLocale();
    const cart = await removeDiscountCode(session.cartId, discountCodeId, locale);
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to remove discount code';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

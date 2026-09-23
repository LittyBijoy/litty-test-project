import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { addLineItem } from '@/lib/ct/cart';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  const { sku, quantity } = (await req.json().catch(() => ({}))) as { sku?: string; quantity?: number };
  if (!sku) {
    return NextResponse.json({ error: 'sku is required' }, { status: 400 });
  }
  try {
    const { locale } = await getLocale();
    const cart = await addLineItem(session.cartId, sku, quantity ?? 1, locale);
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to add line item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { removeLineItem, changeLineItemQuantity } from '@/lib/ct/cart';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  const { quantity } = (await req.json().catch(() => ({}))) as { quantity?: number };
  if (typeof quantity !== 'number') {
    return NextResponse.json({ error: 'quantity is required' }, { status: 400 });
  }
  try {
    const { locale } = await getLocale();
    const cart = await changeLineItemQuantity(session.cartId, id, quantity, locale);
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update line item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  try {
    const { locale } = await getLocale();
    const cart = await removeLineItem(session.cartId, id, locale);
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to remove line item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

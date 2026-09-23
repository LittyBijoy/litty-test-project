import { NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getCustomerOrders } from '@/lib/ct/orders';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { locale } = await getLocale();
    const orders = await getCustomerOrders(session.customerId, locale);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}

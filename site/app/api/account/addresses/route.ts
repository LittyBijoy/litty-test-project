import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { addCustomerAddress } from '@/lib/ct/auth';
import type { Address } from '@/lib/types';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const address = (await req.json().catch(() => null)) as Address | null;
  if (!address?.country) {
    return NextResponse.json({ error: 'country is required' }, { status: 400 });
  }
  try {
    const customer = await addCustomerAddress(session.customerId, address);
    return NextResponse.json({ customer });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to add address';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

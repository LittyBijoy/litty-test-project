import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { removeCustomerAddress } from '@/lib/ct/auth';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const customer = await removeCustomerAddress(session.customerId, id);
    return NextResponse.json({ customer });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to remove address';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

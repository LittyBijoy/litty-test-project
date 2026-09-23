import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCustomerById, updateCustomerProfile } from '@/lib/ct/auth';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ customer: null });
  }
  try {
    const customer = await getCustomerById(session.customerId);
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ customer: null });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { firstName, lastName } = (await req.json().catch(() => ({}))) as {
    firstName?: string;
    lastName?: string;
  };
  try {
    const customer = await updateCustomerProfile(session.customerId, firstName, lastName);
    return NextResponse.json({ customer });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update profile';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

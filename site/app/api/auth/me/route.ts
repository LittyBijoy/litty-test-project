import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCustomerById } from '@/lib/ct/auth';

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

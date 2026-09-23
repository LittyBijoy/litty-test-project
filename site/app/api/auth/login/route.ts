import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';
import { signInCustomer } from '@/lib/ct/auth';

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const session = await getSession();
    // Merge the anonymous cart (if any) into the customer's cart on sign-in.
    const { customer, cartId } = await signInCustomer(email, password, session.cartId);

    const res = NextResponse.json({ customer });
    const token = await createSessionToken({
      ...session,
      customerId: customer.id,
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      cartId: cartId ?? session.cartId,
    });
    return setSessionCookie(res, token);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid email or password';
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

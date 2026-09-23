import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';
import { signUpCustomer, signInCustomer } from '@/lib/ct/auth';

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const session = await getSession();
    await signUpCustomer(email, password, firstName, lastName);
    // customers().post() does not log the customer in — sign in immediately so the
    // session is populated and any anonymous cart is merged.
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
    const msg = e instanceof Error ? e.message : 'Could not create account';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

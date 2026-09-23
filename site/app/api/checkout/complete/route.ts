import { NextResponse } from 'next/server';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';

// Called once the Checkout SDK signals order completion — clears the now-Ordered
// cart's id from the session (a fresh cart is created on the next add-to-cart).
export async function POST() {
  const session = await getSession();
  const res = NextResponse.json({ ok: true });
  const token = await createSessionToken({ ...session, cartId: undefined });
  return setSessionCookie(res, token);
}

import { NextResponse } from 'next/server';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';

export async function POST() {
  const session = await getSession();
  // Preserve locale/currency/country; drop every user field (customerId, cartId, ...).
  const res = NextResponse.json({ ok: true });
  const token = await createSessionToken({
    country: session.country,
    currency: session.currency,
    locale: session.locale,
  });
  return setSessionCookie(res, token);
}

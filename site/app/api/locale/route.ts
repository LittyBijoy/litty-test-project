import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';
import { COUNTRY_CONFIG } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const { locale } = (await req.json().catch(() => ({}))) as { locale?: string };
  const config = locale ? COUNTRY_CONFIG[locale] : undefined;
  if (!config) {
    return NextResponse.json({ error: 'Unknown locale' }, { status: 400 });
  }
  const session = await getSession();
  const res = NextResponse.json({ country: config.country, currency: config.currency, locale: config.locale });
  res.cookies.set('your-shop-country-locale', config.locale, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
  });
  const token = await createSessionToken({
    ...session,
    country: config.country,
    currency: config.currency,
    locale: config.locale,
    // Cart currency is fixed at creation — force a fresh cart on the next add-to-cart.
    cartId: undefined,
  });
  return setSessionCookie(res, token);
}

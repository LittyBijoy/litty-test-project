// commercetools Sessions API has no @commercetools/platform-sdk request builder —
// it lives on a separate host (session.<region>.commercetools.com) and is called with
// a plain fetch(), exchanging a fresh client-credentials token first.

const PROJECT_KEY = process.env.CTP_PROJECT_KEY!;
const AUTH_URL = process.env.CTP_AUTH_URL!;
const API_URL = process.env.CTP_API_URL!;
const CLIENT_ID = process.env.CTP_CLIENT_ID!;
const CLIENT_SECRET = process.env.CTP_CLIENT_SECRET!;
const SCOPES = process.env.CTP_SCOPES!;
const CHECKOUT_APP_KEY = process.env.CTP_CHECKOUT_APP_KEY!;

// Derive region from CTP_API_URL — e.g. https://api.us-central1.gcp.commercetools.com → us-central1.gcp
const REGION = API_URL.replace(/^https?:\/\/api\./, '').replace(/\.commercetools\.com\/?$/, '');

async function getManageSessionsToken(): Promise<string> {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${AUTH_URL}/oauth/token?grant_type=client_credentials&scope=${encodeURIComponent(SCOPES)}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to obtain OAuth token: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export interface CheckoutSession {
  sessionId: string;
  projectKey: string;
  region: string;
}

export async function createCheckoutSession(cartId: string): Promise<CheckoutSession> {
  const token = await getManageSessionsToken();
  const res = await fetch(`https://session.${REGION}.commercetools.com/${PROJECT_KEY}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cart: { cartRef: { id: cartId } },
      metadata: { applicationKey: CHECKOUT_APP_KEY },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to create checkout session: ${res.status} ${body}`);
  }
  const data = await res.json();
  return { sessionId: data.id, projectKey: PROJECT_KEY, region: REGION };
}

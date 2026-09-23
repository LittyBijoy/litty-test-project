# Storefront

A B2C storefront built on Next.js 16 (App Router) + next-intl v4 + Tailwind v4, connected to commercetools via the TypeScript SDK, with checkout handled by the commercetools Checkout Browser SDK (`checkoutFlow`, full hosted mode).

## Features

- Home page, product listing with faceted navigation (commercetools Product Search API), full-text search, product detail pages
- Cart (add/remove/update line items, discount codes) with a mini-cart drawer and a full cart page
- Checkout via `@commercetools/checkout-browser-sdk` (`checkoutFlow`) — PSP: **Stripe** (connector configured separately, in Merchant Center)
- Customer registration/login, anonymous-cart merge on sign-in, protected account area (profile, addresses, order history)
- Locale/country/currency switching (`en-US`, `en-GB`, `de-DE` out of the box — see `lib/utils.ts` → `COUNTRY_CONFIG`)

## Before you can run this against real data

### 1. Fill in `.env.local`

Everything is pre-filled from the values provided during setup **except the client secret**:

```bash
CTP_CLIENT_SECRET=   # ← paste your API client's secret here
```

Get it from Merchant Center → Settings → Developer settings → your API client (or regenerate it there if you don't have it saved).

### 2. Set up commercetools Checkout + a Stripe Connector

The checkout page (`/checkout`) mounts the Checkout Browser SDK in full hosted mode. This needs a Checkout **Application** configured in Merchant Center, wired to a **Stripe** Connector:

1. In Merchant Center → Checkout, create an Application, connect a Stripe Connector to it, and register the app's **key**.
2. Set that key as `CTP_CHECKOUT_APP_KEY` in `.env.local` (currently a placeholder: `storefront-checkout`).
3. Register this storefront's confirmation URL as the Application's `paymentsConfiguration.paymentReturnUrl` (e.g. `https://yourdomain.com/en-US/checkout/confirmation`). Only one return URL per Connector.

Until this is configured, `/checkout` will load but the SDK will fail to mount (session creation will error).

### 3. Verify the connection

```bash
npm run dev
curl http://localhost:3000/api/health
# → {"ok":true,"projectKey":"litty_test_project"}
```

`app/api/health/route.ts` was a connectivity check only and has been removed ahead of deploying.

## Project layout

```
app/
  [locale]/            locale-prefixed routes (home, category, search, p/[sku], cart, checkout, login,
                        register, account/*)
  api/                 BFF Route Handlers (auth, account, cart, checkout, shipping-methods, locale)
lib/
  ct/                  server-only commercetools helpers (client singleton, cart, auth, orders, search, ...)
  mappers/              commercetools → app type mappers
  types.ts             app types (components import from here, never from @commercetools/platform-sdk)
  session.ts           signed-JWT session (jose), HTTP-only cookie
hooks/                 SWR client-state hooks (cart, account, orders, shipping methods)
context/               CartContext (cart provider + mini-cart open state)
components/
  ui/                  shared primitives (Button, Input, Select, Badge, Drawer, Modal, Spinner)
  layout/               Header, Footer, MiniCart, nav
  product/              PLP/PDP components (ProductCard, Gallery, FacetPanel, ...)
i18n/                  next-intl routing + request config
```

## Deploy

Deployed to Vercel — project `littybijoy-7438/site`, linked via the Vercel CLI (no git remote yet, so this is a CLI-only deploy; push to a git repo and connect it in the Vercel dashboard to get deploys-on-push).

- **Live URL:** https://site-littybijoy-7438.vercel.app
- **Dashboard:** https://vercel.com/littybijoy-7438/site
- Env vars (`CTP_PROJECT_KEY`, `CTP_AUTH_URL`, `CTP_API_URL`, `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `CTP_SCOPES`, `SESSION_SECRET`, `CTP_CHECKOUT_APP_KEY`) are set on both the Production and Preview environments in the Vercel project.
- To redeploy after further changes: `cd site && vercel deploy . --prod --scope littybijoy-7438` (omit `--prod` for a preview deployment).
- `CTP_CHECKOUT_APP_KEY` is still the placeholder value (`storefront-checkout`) — checkout won't complete a real payment until the Checkout Application + Stripe Connector are configured (see above) and this is updated, both locally and via `vercel env` on the deployed project.

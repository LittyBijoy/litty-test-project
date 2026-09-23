import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'My App',
  entryPointUriPath,
  cloudIdentifier: 'gcp-us',
  env: {
    development: {
      initialProjectKey: 'litty_test_project',
    },
    production: {
      applicationId: 'cmudrdtao000e01zxzxelpowc',
      // TODO(litty): replace with the real hosting URL once this app is deployed
      // (Connect, Vercel, or Netlify — see the "going to production" doc), then
      // update the URL on the registration in Merchant Center to match.
      url: 'https://placeholder.example.com',
    },
  },
  oAuthScopes: {
    view: ['view_products', 'view_customers', 'view_orders'],
    manage: ['manage_products', 'manage_customers'],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/rocket.svg}',
  mainMenuLink: {
    defaultLabel: 'Template starter',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
  submenuLinks: [
    {
      uriPath: 'channels',
      defaultLabel: 'Channels',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'categories',
      defaultLabel: 'Categories',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'customer-support',
      defaultLabel: 'Customer Support',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
  ],
};

export default config;

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
      // Deployed via commercetools Connect (sandbox deployment, key: litty-mc-app-sandbox).
      // Redeploy: `commercetools connect deployment redeploy --key litty-mc-app-sandbox`
      url: 'https://mc-app-nh1u0dm9nkaswygcn7b01a3f.us-central1.gcp.3.sandbox.commercetools.app',
    },
  },
  oAuthScopes: {
    view: [
      'view_products',
      'view_customers',
      'view_orders',
      'view_key_value_documents',
    ],
    manage: [
      'manage_products',
      'manage_customers',
      'manage_key_value_documents',
    ],
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
    {
      uriPath: 'custom-objects',
      defaultLabel: 'Custom Objects',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
  ],
};

export default config;

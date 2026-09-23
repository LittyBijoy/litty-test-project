import { lazy } from 'react';

const CustomerSupport = lazy(
  () => import('./customer-support' /* webpackChunkName: "customer-support" */)
);

export default CustomerSupport;

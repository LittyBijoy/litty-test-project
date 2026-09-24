import { lazy } from 'react';

const CustomObjects = lazy(
  () => import('./custom-objects' /* webpackChunkName: "custom-objects" */)
);

export default CustomObjects;

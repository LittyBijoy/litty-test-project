import { lazy } from 'react';

const Categories = lazy(
  () => import('./categories' /* webpackChunkName: "categories" */)
);

export default Categories;

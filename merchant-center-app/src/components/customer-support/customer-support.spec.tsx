import { graphql } from 'msw';
import { Customer } from '@commercetools/composable-commerce-test-data/customer';
import {
  OrderGraphql,
  type TOrderGraphql,
} from '@commercetools/composable-commerce-test-data/order';
import { buildGraphqlList } from '@commercetools/composable-commerce-test-data/core';
import { setupServer } from 'msw/node';
import {
  fireEvent,
  screen,
  mapResourceAccessToAppliedPermissions,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { entryPointUriPath, PERMISSIONS } from '../../constants';
import ApplicationRoutes from '../../routes';
import { renderApplicationWithRedux } from '../../test-utils';

const mockServer = setupServer();
afterEach(() => mockServer.resetHandlers());
beforeAll(() => {
  mockServer.listen({
    onUnhandledRequest: 'error',
  });
});
afterAll(() => {
  mockServer.close();
});

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route =
    options.route || `/my-project/${entryPointUriPath}/customer-support`;
  const { history } = renderApplicationWithRedux(<ApplicationRoutes />, {
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions([
        PERMISSIONS.View,
      ]),
    },
    ...options,
  });
  return { history };
};

it('should search for a customer by email and render their profile and orders', async () => {
  const customer = Customer.random()
    .id('customer-id-1')
    .version(1)
    .email('jane.doe@example.com')
    .firstName('Jane')
    .lastName('Doe')
    .customerNumber('C-1001')
    .addresses([])
    .build();

  mockServer.use(
    graphql.query('FetchCustomerByEmail', (_req, res, ctx) => {
      return res(
        ctx.data({
          customers: { total: 1, results: [{ ...customer, custom: null }] },
        })
      );
    }),
    graphql.query('FetchCustomerOrders', (_req, res, ctx) => {
      return res(
        ctx.data({
          orders: buildGraphqlList<TOrderGraphql>(
            [OrderGraphql.random().orderNumber('ORD-1')],
            { name: 'Order', total: 1 }
          ),
        })
      );
    }),
    graphql.query('FetchCustomerActiveCart', (_req, res, ctx) => {
      return res(ctx.data({ carts: { total: 0, results: [] } }));
    })
  );

  renderApp();

  // The route component is lazy-loaded, so wait for it before interacting.
  const emailInput = await screen.findByLabelText('Customer email');
  fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });
  fireEvent.click(screen.getByText('Search'));

  await screen.findByText('Jane Doe');
  expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
  await screen.findByText('ORD-1');
  expect(
    screen.getByText('This customer has no active cart.')
  ).toBeInTheDocument();
});

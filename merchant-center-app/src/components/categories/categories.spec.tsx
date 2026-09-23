import { graphql } from 'msw';
import {
  CategoryGraphql,
  type TCategoryGraphql,
} from '@commercetools/composable-commerce-test-data/category';
import { LocalizedString } from '@commercetools/composable-commerce-test-data/commons';
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
    // for debugging reasons we force an error when the test fires a request with a query or mutation which is not mocked
    // more: https://mswjs.io/docs/api/setup-worker/start#onunhandledrequest
    onUnhandledRequest: 'error',
  });
});
afterAll(() => {
  mockServer.close();
});

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route = options.route || `/my-project/${entryPointUriPath}/categories`;
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

it('should render categories and paginate to second page', async () => {
  mockServer.use(
    graphql.query('FetchCategories', (req, res, ctx) => {
      // Simulate a server side pagination.
      const { offset } = req.variables;
      const totalItems = 25; // 2 pages
      const itemsPerPage = offset === 0 ? 20 : 5;

      return res(
        ctx.data({
          categories: buildGraphqlList<TCategoryGraphql>(
            Array.from({ length: itemsPerPage }).map((_, index) =>
              CategoryGraphql.random()
                .nameAllLocales(LocalizedString.random())
                .key(`category-key-${offset === 0 ? index : 20 + index}`)
                .childCount(0)
                .stagedProductCount(0)
                .orderHint(`.${(offset === 0 ? index : 20 + index) + 1}`)
            ),
            {
              name: 'Category',
              total: totalItems,
            }
          ),
        })
      );
    })
  );
  renderApp();

  // First page
  await screen.findByText('category-key-0');
  expect(screen.queryByText('category-key-22')).not.toBeInTheDocument();

  // Go to second page
  fireEvent.click(screen.getByLabelText('Next page'));

  // Second page
  await screen.findByText('category-key-22');
  expect(screen.queryByText('category-key-0')).not.toBeInTheDocument();
});

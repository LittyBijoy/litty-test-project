import { graphql } from 'msw';
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
    options.route || `/my-project/${entryPointUriPath}/custom-objects`;
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

it('should browse a container, open an object, and save an edited value', async () => {
  mockServer.use(
    graphql.query('FetchCustomObjects', (_req, res, ctx) =>
      res(
        ctx.data({
          customObjects: {
            total: 1,
            count: 1,
            offset: 0,
            results: [
              {
                id: 'co-id-1',
                container: 'feature-flags',
                key: 'new-checkout',
                version: 1,
                lastModifiedAt: '2026-01-01T00:00:00.000Z',
              },
            ],
          },
        })
      )
    ),
    graphql.query('FetchCustomObject', (_req, res, ctx) =>
      res(
        ctx.data({
          customObject: {
            id: 'co-id-1',
            container: 'feature-flags',
            key: 'new-checkout',
            value: { enabled: false },
            version: 1,
            createdAt: '2026-01-01T00:00:00.000Z',
            lastModifiedAt: '2026-01-01T00:00:00.000Z',
          },
        })
      )
    ),
    graphql.mutation('CreateOrUpdateCustomObject', (_req, res, ctx) =>
      res(
        ctx.data({
          createOrUpdateCustomObject: {
            id: 'co-id-1',
            container: 'feature-flags',
            key: 'new-checkout',
            value: { enabled: true },
            version: 2,
            lastModifiedAt: '2026-01-02T00:00:00.000Z',
          },
        })
      )
    )
  );

  renderApp();

  const containerInput = await screen.findByLabelText('Container');
  fireEvent.change(containerInput, { target: { value: 'feature-flags' } });
  fireEvent.click(screen.getByText('Browse'));

  await screen.findByText('new-checkout');

  fireEvent.click(screen.getByText('new-checkout'));

  const valueField = await screen.findByLabelText('Value (JSON)');
  await screen.findByDisplayValue(/"enabled": false/);

  fireEvent.change(valueField, {
    target: { value: '{\n  "enabled": true\n}' },
  });
  fireEvent.click(screen.getByText('Save'));

  await screen.findByText('Saved.');
});

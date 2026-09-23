import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import Constraints from '@commercetools-uikit/constraints';
import DataTable from '@commercetools-uikit/data-table';
import FlatButton from '@commercetools-uikit/flat-button';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import { BackIcon } from '@commercetools-uikit/icons';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../helpers';
import { useCategoriesFetcher } from '../../hooks/use-categories-connector';
import type { TCategory } from '../../hooks/use-categories-connector/types';
import messages from './messages';

const columns = [
  { key: 'name', label: 'Category name' },
  { key: 'key', label: 'Key', isSortable: true },
  { key: 'childCount', label: 'Subcategories' },
  { key: 'stagedProductCount', label: 'Products' },
  { key: 'orderHint', label: 'Order hint', isSortable: true },
];

type TCategoriesProps = {
  linkToWelcome: string;
};

const Categories = (props: TCategoriesProps) => {
  const intl = useIntl();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({
    key: 'orderHint',
    order: 'asc',
  });
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));
  const { categoriesPaginatedResult, error, loading } = useCategoriesFetcher({
    page,
    perPage,
    tableSorting,
  });

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <FlatButton
          as={RouterLink}
          to={props.linkToWelcome}
          label={intl.formatMessage(messages.backToWelcome)}
          icon={<BackIcon />}
        />
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      <Constraints.Horizontal max={13}>
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.demoHint} />
        </ContentNotification>
      </Constraints.Horizontal>

      {loading && <LoadingSpinner />}

      {categoriesPaginatedResult ? (
        <Spacings.Stack scale="l">
          <DataTable<TCategory>
            isCondensed
            columns={columns}
            rows={categoriesPaginatedResult.results}
            itemRenderer={(item, column) => {
              switch (column.key) {
                case 'key':
                  return item.key ?? NO_VALUE_FALLBACK;
                case 'childCount':
                  return item.childCount;
                case 'stagedProductCount':
                  return item.stagedProductCount;
                case 'orderHint':
                  return item.orderHint;
                case 'name':
                  return formatLocalizedString(
                    {
                      name: transformLocalizedFieldToLocalizedString(
                        item.nameAllLocales ?? []
                      ),
                    },
                    {
                      key: 'name',
                      locale: dataLocale,
                      fallbackOrder: projectLanguages,
                      fallback: NO_VALUE_FALLBACK,
                    }
                  );
                default:
                  return null;
              }
            }}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
          />
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={categoriesPaginatedResult.total}
            perPageRange="s"
          />
        </Spacings.Stack>
      ) : null}
    </Spacings.Stack>
  );
};
Categories.displayName = 'Categories';

export default Categories;

import { useEffect, useState, type FormEvent } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import Card from '@commercetools-uikit/card';
import Constraints from '@commercetools-uikit/constraints';
import DataTable from '@commercetools-uikit/data-table';
import FlatButton from '@commercetools-uikit/flat-button';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import { BackIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import { getErrorMessage } from '../../helpers';
import {
  useCustomObjectsFetcher,
  useCustomObjectFetcher,
  useCustomObjectSaver,
  useCustomObjectDeleter,
} from '../../hooks/use-custom-objects-connector';
import type { TCustomObjectSummary } from '../../hooks/use-custom-objects-connector/types';
import messages from './messages';

const columns = [
  { key: 'key', label: 'Key', isSortable: true },
  { key: 'version', label: 'Version' },
  { key: 'lastModifiedAt', label: 'Last modified', isSortable: true },
];

const NEW_OBJECT = Symbol('new-object');
type TSelection = TCustomObjectSummary['key'] | typeof NEW_OBJECT | null;

const formatValue = (value: unknown): string => JSON.stringify(value, null, 2);

type TCustomObjectDetailProps = {
  container: string;
  selection: TSelection;
  onClose: () => void;
  onDeleted: () => void;
};

const CustomObjectDetail = (props: TCustomObjectDetailProps) => {
  const intl = useIntl();
  const isNew = props.selection === NEW_OBJECT;

  const [containerValue, setContainerValue] = useState(props.container);
  const [keyValue, setKeyValue] = useState(
    isNew ? '' : String(props.selection)
  );
  const [valueText, setValueText] = useState(isNew ? '{\n  \n}' : '');
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetcher = useCustomObjectFetcher();
  const saver = useCustomObjectSaver();
  const deleter = useCustomObjectDeleter();

  useEffect(() => {
    if (!isNew) {
      fetcher.fetchCustomObject(props.container, String(props.selection));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, props.container, props.selection]);

  useEffect(() => {
    if (fetcher.customObject) {
      setValueText(formatValue(fetcher.customObject.value));
      setVersion(fetcher.customObject.version);
    }
  }, [fetcher.customObject]);

  const handleSave = async () => {
    setSaveError(null);
    setSaved(false);
    setJsonError(null);

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(valueText);
    } catch (parseError) {
      setJsonError(
        intl.formatMessage(messages.invalidJson, {
          error:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        })
      );
      return;
    }

    try {
      const result = await saver.execute({
        container: containerValue.trim(),
        key: keyValue.trim(),
        value: JSON.stringify(parsedValue),
        version,
      });
      if (result) {
        setVersion(result.version);
        setSaved(true);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleDelete = async () => {
    if (isNew) return;

    if (!window.confirm(intl.formatMessage(messages.deleteConfirm))) return;
    setSaveError(null);
    try {
      await deleter.execute(containerValue.trim(), keyValue.trim(), version);
      props.onDeleted();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Spacings.Stack scale="l">
      <FlatButton
        onClick={props.onClose}
        label={intl.formatMessage(messages.backToList)}
        icon={<BackIcon />}
      />

      <Constraints.Horizontal max={13}>
        <Card type="raised" insetScale="l">
          <Spacings.Stack scale="m">
            <Text.Subheadline
              as="h4"
              intlMessage={isNew ? messages.newTitle : messages.title}
            />

            {!isNew && fetcher.loading && <LoadingSpinner />}

            {!isNew &&
              fetcher.called &&
              !fetcher.loading &&
              !fetcher.customObject && (
                <ContentNotification type="warning">
                  <Text.Body intlMessage={messages.notFound} />
                </ContentNotification>
              )}

            {fetcher.error && (
              <ContentNotification type="error">
                <Text.Body>{getErrorMessage(fetcher.error)}</Text.Body>
              </ContentNotification>
            )}

            {(isNew || fetcher.customObject) && (
              <>
                <TextField
                  name="container"
                  title={intl.formatMessage(messages.containerLabel)}
                  value={containerValue}
                  onChange={(event) => setContainerValue(event.target.value)}
                  isDisabled={!isNew}
                />
                <TextField
                  name="key"
                  title={intl.formatMessage(messages.keyLabel)}
                  value={keyValue}
                  onChange={(event) => setKeyValue(event.target.value)}
                  isDisabled={!isNew}
                />
                <MultilineTextField
                  name="value"
                  title={intl.formatMessage(messages.valueLabel)}
                  hint={intl.formatMessage(messages.valueHint)}
                  value={valueText}
                  onChange={(event) => setValueText(event.target.value)}
                />

                {jsonError && (
                  <ContentNotification type="error">
                    <Text.Body>{jsonError}</Text.Body>
                  </ContentNotification>
                )}
                {saveError && (
                  <ContentNotification type="error">
                    <Text.Body>{saveError}</Text.Body>
                  </ContentNotification>
                )}
                {saved && (
                  <ContentNotification type="success">
                    <Text.Body intlMessage={messages.saved} />
                  </ContentNotification>
                )}

                <Spacings.Inline>
                  <PrimaryButton
                    label={intl.formatMessage(messages.saveButton)}
                    onClick={handleSave}
                    isDisabled={
                      saver.loading ||
                      !containerValue.trim() ||
                      !keyValue.trim()
                    }
                  />
                  {!isNew && (
                    <SecondaryButton
                      label={intl.formatMessage(messages.deleteButton)}
                      onClick={handleDelete}
                      isDisabled={deleter.loading}
                    />
                  )}
                </Spacings.Inline>
              </>
            )}
          </Spacings.Stack>
        </Card>
      </Constraints.Horizontal>
    </Spacings.Stack>
  );
};
CustomObjectDetail.displayName = 'CustomObjectDetail';

type TCustomObjectsProps = {
  linkToWelcome: string;
};

const CustomObjects = (props: TCustomObjectsProps) => {
  const intl = useIntl();
  const [containerInput, setContainerInput] = useState('');
  const [browsedContainer, setBrowsedContainer] = useState('');
  const [selection, setSelection] = useState<TSelection>(null);

  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({
    key: 'lastModifiedAt',
    order: 'desc',
  });
  const { customObjectsPaginatedResult, error, loading } =
    useCustomObjectsFetcher(browsedContainer, { page, perPage, tableSorting });

  const handleBrowse = (event: FormEvent) => {
    event.preventDefault();
    setSelection(null);
    setBrowsedContainer(containerInput.trim());
  };

  const isDetailOpen = selection !== null;

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

      <Constraints.Horizontal max={16}>
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.demoHint} />
        </ContentNotification>
      </Constraints.Horizontal>

      {isDetailOpen ? (
        <CustomObjectDetail
          container={browsedContainer}
          selection={selection}
          onClose={() => setSelection(null)}
          onDeleted={() => setSelection(null)}
        />
      ) : (
        <>
          <Constraints.Horizontal max={13}>
            <form onSubmit={handleBrowse}>
              <Spacings.Inline scale="s" alignItems="flex-end">
                <TextField
                  name="container"
                  title={intl.formatMessage(messages.containerLabel)}
                  placeholder={intl.formatMessage(
                    messages.containerPlaceholder
                  )}
                  hint={intl.formatMessage(messages.containerHint)}
                  value={containerInput}
                  onChange={(event) => setContainerInput(event.target.value)}
                  horizontalConstraint="scale"
                />
                <PrimaryButton
                  type="submit"
                  label={intl.formatMessage(messages.browseButton)}
                  isDisabled={!containerInput.trim()}
                />
                {browsedContainer && (
                  <SecondaryButton
                    iconLeft={<PlusBoldIcon />}
                    label={intl.formatMessage(messages.newButton)}
                    onClick={() => setSelection(NEW_OBJECT)}
                  />
                )}
              </Spacings.Inline>
            </form>
          </Constraints.Horizontal>

          {error && (
            <ContentNotification type="error">
              <Text.Body>{getErrorMessage(error)}</Text.Body>
            </ContentNotification>
          )}

          {loading && <LoadingSpinner />}

          {browsedContainer && customObjectsPaginatedResult && (
            <Spacings.Stack scale="l">
              {customObjectsPaginatedResult.results.length === 0 ? (
                <Text.Body intlMessage={messages.noResults} />
              ) : (
                <>
                  <DataTable<TCustomObjectSummary>
                    isCondensed
                    columns={columns}
                    rows={customObjectsPaginatedResult.results}
                    onRowClick={(row) => setSelection(row.key)}
                    itemRenderer={(item, column) => {
                      switch (column.key) {
                        case 'key':
                          return item.key ?? NO_VALUE_FALLBACK;
                        case 'version':
                          return item.version;
                        case 'lastModifiedAt':
                          return new Intl.DateTimeFormat(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(item.lastModifiedAt));
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
                    totalItems={customObjectsPaginatedResult.total}
                    perPageRange="s"
                  />
                </>
              )}
            </Spacings.Stack>
          )}
        </>
      )}
    </Spacings.Stack>
  );
};
CustomObjects.displayName = 'CustomObjects';

export default CustomObjects;

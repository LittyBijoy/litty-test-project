import { useEffect, useState, type FormEvent } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import Card from '@commercetools-uikit/card';
import Constraints from '@commercetools-uikit/constraints';
import DataTable from '@commercetools-uikit/data-table';
import FlatButton from '@commercetools-uikit/flat-button';
import Grid from '@commercetools-uikit/grid';
import { BackIcon } from '@commercetools-uikit/icons';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import { ContentNotification } from '@commercetools-uikit/notifications';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import { getErrorMessage } from '../../helpers';
import {
  useCustomerByEmailLookup,
  useCustomerOrders,
  useCustomerActiveCart,
  useUpdateCustomerNotes,
  SUPPORT_NOTES_FIELD_NAME,
} from '../../hooks/use-customer-support-connector';
import type { TCustomer } from '../../hooks/use-customer-support-connector/types';
import messages from './messages';

const orderColumns = [
  { key: 'orderNumber', label: 'Order #' },
  { key: 'createdAt', label: 'Placed' },
  { key: 'orderState', label: 'State' },
  { key: 'totalPrice', label: 'Total' },
];

const formatMoney = (money: {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
}) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: money.currencyCode,
  }).format(money.centAmount / 10 ** money.fractionDigits);

const readNotes = (customer?: TCustomer | null): string => {
  const field = customer?.custom?.customFieldsRaw.find(
    (f) => f.name === SUPPORT_NOTES_FIELD_NAME
  );
  return typeof field?.value === 'string' ? field.value : '';
};

type TCustomerSupportProps = {
  linkToWelcome: string;
};

const CustomerSupport = (props: TCustomerSupportProps) => {
  const intl = useIntl();
  const [email, setEmail] = useState('');
  const [customer, setCustomer] = useState<TCustomer | null>(null);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const lookup = useCustomerByEmailLookup();
  const { orders, loading: ordersLoading } = useCustomerOrders(customer?.id);
  const { cart, loading: cartLoading } = useCustomerActiveCart(customer?.id);
  const notesUpdater = useUpdateCustomerNotes();

  useEffect(() => {
    if (lookup.customer) {
      setCustomer(lookup.customer);
      setNotes(readNotes(lookup.customer));
      setNotesSaved(false);
    }
  }, [lookup.customer]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setCustomer(null);
    setNotesSaved(false);
    if (email.trim()) {
      lookup.lookupCustomer(email.trim());
    }
  };

  const handleSaveNotes = async () => {
    if (!customer) return;
    setNotesError(null);
    setNotesSaved(false);
    try {
      const updated = await notesUpdater.execute(customer, notes);
      if (updated) {
        setCustomer((current) =>
          current ? { ...current, ...updated } : current
        );
        setNotesSaved(true);
      }
    } catch (error) {
      setNotesError(
        error instanceof Error ? error.message : 'Failed to save note'
      );
    }
  };

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

      <Constraints.Horizontal max={13}>
        <form onSubmit={handleSearch}>
          <Spacings.Inline scale="s" alignItems="flex-end">
            <TextField
              name="email"
              title={intl.formatMessage(messages.searchLabel)}
              placeholder={intl.formatMessage(messages.searchPlaceholder)}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              horizontalConstraint="scale"
            />
            <PrimaryButton
              type="submit"
              label={intl.formatMessage(messages.searchButton)}
              isDisabled={!email.trim()}
            />
          </Spacings.Inline>
        </form>
      </Constraints.Horizontal>

      {lookup.loading && <LoadingSpinner />}

      {lookup.error && (
        <ContentNotification type="error">
          <Text.Body>{getErrorMessage(lookup.error)}</Text.Body>
        </ContentNotification>
      )}

      {lookup.notFound && !customer && (
        <ContentNotification type="warning">
          <Text.Body intlMessage={messages.notFound} />
        </ContentNotification>
      )}

      {customer && (
        <Grid
          gridGap="16px"
          gridAutoColumns="1fr"
          gridTemplateColumns="1fr 1fr"
        >
          <Spacings.Stack scale="l">
            <Card type="raised" insetScale="l">
              <Spacings.Stack scale="m">
                <Text.Subheadline as="h4" intlMessage={messages.profileTitle} />
                <Text.Body isBold>
                  {[customer.firstName, customer.lastName]
                    .filter(Boolean)
                    .join(' ') || NO_VALUE_FALLBACK}
                </Text.Body>
                <Text.Body>{customer.email}</Text.Body>
                <Text.Detail>
                  {intl.formatMessage(messages.customerNumberLabel)}:{' '}
                  {customer.customerNumber ?? NO_VALUE_FALLBACK}
                </Text.Detail>

                <Text.Subheadline
                  as="h4"
                  intlMessage={messages.addressesTitle}
                />
                {customer.addresses.length === 0 ? (
                  <Text.Body intlMessage={messages.noAddresses} />
                ) : (
                  <Spacings.Stack scale="s">
                    {customer.addresses.map((address) => (
                      <Text.Detail key={address.id}>
                        {[
                          address.streetName,
                          address.streetNumber,
                          address.city,
                          address.postalCode,
                          address.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </Text.Detail>
                    ))}
                  </Spacings.Stack>
                )}
              </Spacings.Stack>
            </Card>

            <Card type="raised" insetScale="l">
              <Spacings.Stack scale="m">
                <MultilineTextField
                  name="notes"
                  title={intl.formatMessage(messages.notesLabel)}
                  hint={intl.formatMessage(messages.notesHint)}
                  value={notes}
                  onChange={(event) => {
                    setNotes(event.target.value);
                    setNotesSaved(false);
                  }}
                />
                {notesError && (
                  <ContentNotification type="error">
                    <Text.Body>{notesError}</Text.Body>
                  </ContentNotification>
                )}
                {notesSaved && (
                  <ContentNotification type="success">
                    <Text.Body intlMessage={messages.notesSaved} />
                  </ContentNotification>
                )}
                <Spacings.Inline>
                  <PrimaryButton
                    label={intl.formatMessage(messages.saveNotes)}
                    onClick={handleSaveNotes}
                    isDisabled={notesUpdater.loading}
                  />
                </Spacings.Inline>
              </Spacings.Stack>
            </Card>
          </Spacings.Stack>

          <Spacings.Stack scale="l">
            <Card type="raised" insetScale="l">
              <Spacings.Stack scale="m">
                <Text.Subheadline
                  as="h4"
                  intlMessage={messages.activeCartTitle}
                />
                {cartLoading && <LoadingSpinner />}
                {!cartLoading && !cart && (
                  <Text.Body intlMessage={messages.noActiveCart} />
                )}
                {cart && (
                  <Spacings.Stack scale="s">
                    <Text.Body>
                      {cart.totalLineItemQuantity} item
                      {cart.totalLineItemQuantity === 1 ? '' : 's'} —{' '}
                      {formatMoney(cart.totalPrice)}
                    </Text.Body>
                    {cart.lineItems.map((lineItem) => (
                      <Text.Detail key={lineItem.id}>
                        {lineItem.nameAllLocales[0]?.value ?? NO_VALUE_FALLBACK}{' '}
                        × {lineItem.quantity} —{' '}
                        {formatMoney(lineItem.totalPrice)}
                      </Text.Detail>
                    ))}
                  </Spacings.Stack>
                )}
              </Spacings.Stack>
            </Card>

            <Card type="raised" insetScale="l">
              <Spacings.Stack scale="m">
                <Text.Subheadline as="h4" intlMessage={messages.ordersTitle} />
                {ordersLoading && <LoadingSpinner />}
                {!ordersLoading && orders.length === 0 && (
                  <Text.Body intlMessage={messages.noOrders} />
                )}
                {orders.length > 0 && (
                  <DataTable
                    isCondensed
                    columns={orderColumns}
                    rows={orders}
                    itemRenderer={(item, column) => {
                      switch (column.key) {
                        case 'orderNumber':
                          return item.orderNumber ?? NO_VALUE_FALLBACK;
                        case 'createdAt':
                          return new Intl.DateTimeFormat().format(
                            new Date(item.createdAt)
                          );
                        case 'orderState':
                          return item.orderState;
                        case 'totalPrice':
                          return formatMoney(item.totalPrice);
                        default:
                          return null;
                      }
                    }}
                  />
                )}
              </Spacings.Stack>
            </Card>
          </Spacings.Stack>
        </Grid>
      )}
    </Spacings.Stack>
  );
};
CustomerSupport.displayName = 'CustomerSupport';

export default CustomerSupport;

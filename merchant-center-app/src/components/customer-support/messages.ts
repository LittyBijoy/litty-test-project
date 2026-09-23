import { defineMessages } from 'react-intl';

export default defineMessages({
  backToWelcome: {
    id: 'CustomerSupport.backToWelcome',
    defaultMessage: 'Back to Welcome page',
  },
  title: {
    id: 'CustomerSupport.title',
    defaultMessage: 'Customer support console',
  },
  demoHint: {
    id: 'CustomerSupport.demoHint',
    defaultMessage:
      'Look up a customer by email to see their profile, order history, and active cart, and leave an internal support note for other agents.',
  },
  searchLabel: {
    id: 'CustomerSupport.searchLabel',
    defaultMessage: 'Customer email',
  },
  searchPlaceholder: {
    id: 'CustomerSupport.searchPlaceholder',
    defaultMessage: 'customer@example.com',
  },
  searchButton: {
    id: 'CustomerSupport.searchButton',
    defaultMessage: 'Search',
  },
  notFound: {
    id: 'CustomerSupport.notFound',
    defaultMessage: 'No customer found with that email address.',
  },
  profileTitle: {
    id: 'CustomerSupport.profileTitle',
    defaultMessage: 'Profile',
  },
  customerNumberLabel: {
    id: 'CustomerSupport.customerNumberLabel',
    defaultMessage: 'Customer number',
  },
  addressesTitle: {
    id: 'CustomerSupport.addressesTitle',
    defaultMessage: 'Addresses',
  },
  noAddresses: {
    id: 'CustomerSupport.noAddresses',
    defaultMessage: 'No addresses on file.',
  },
  notesLabel: {
    id: 'CustomerSupport.notesLabel',
    defaultMessage: 'Internal support notes',
  },
  notesHint: {
    id: 'CustomerSupport.notesHint',
    defaultMessage:
      'Visible to support staff only — never shown to the customer.',
  },
  saveNotes: {
    id: 'CustomerSupport.saveNotes',
    defaultMessage: 'Save note',
  },
  notesSaved: {
    id: 'CustomerSupport.notesSaved',
    defaultMessage: 'Note saved.',
  },
  activeCartTitle: {
    id: 'CustomerSupport.activeCartTitle',
    defaultMessage: 'Active cart',
  },
  noActiveCart: {
    id: 'CustomerSupport.noActiveCart',
    defaultMessage: 'This customer has no active cart.',
  },
  ordersTitle: {
    id: 'CustomerSupport.ordersTitle',
    defaultMessage: 'Order history',
  },
  noOrders: {
    id: 'CustomerSupport.noOrders',
    defaultMessage: 'This customer has no orders yet.',
  },
});

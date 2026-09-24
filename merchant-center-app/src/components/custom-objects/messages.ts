import { defineMessages } from 'react-intl';

export default defineMessages({
  backToWelcome: {
    id: 'CustomObjects.backToWelcome',
    defaultMessage: 'Back to Welcome page',
  },
  title: {
    id: 'CustomObjects.title',
    defaultMessage: 'Custom Objects',
  },
  demoHint: {
    id: 'CustomObjects.demoHint',
    defaultMessage:
      'Custom Objects store arbitrary JSON data that doesn’t fit the standard data model — they can’t be managed from the standard Merchant Center UI, only via the API. This page fills that gap.',
  },
  containerLabel: {
    id: 'CustomObjects.containerLabel',
    defaultMessage: 'Container',
  },
  containerPlaceholder: {
    id: 'CustomObjects.containerPlaceholder',
    defaultMessage: 'e.g. feature-flags',
  },
  containerHint: {
    id: 'CustomObjects.containerHint',
    defaultMessage:
      'Custom Objects are namespaced by container — enter one to browse its objects.',
  },
  browseButton: {
    id: 'CustomObjects.browseButton',
    defaultMessage: 'Browse',
  },
  newButton: {
    id: 'CustomObjects.newButton',
    defaultMessage: 'Create new',
  },
  noResults: {
    id: 'CustomObjects.noResults',
    defaultMessage: 'No Custom Objects found in this container.',
  },
  backToList: {
    id: 'CustomObjects.backToList',
    defaultMessage: 'Back to list',
  },
  keyLabel: {
    id: 'CustomObjects.keyLabel',
    defaultMessage: 'Key',
  },
  valueLabel: {
    id: 'CustomObjects.valueLabel',
    defaultMessage: 'Value (JSON)',
  },
  valueHint: {
    id: 'CustomObjects.valueHint',
    defaultMessage:
      'Must be valid JSON — an object, array, string, number, boolean, or null.',
  },
  invalidJson: {
    id: 'CustomObjects.invalidJson',
    defaultMessage: 'This is not valid JSON: {error}',
  },
  saveButton: {
    id: 'CustomObjects.saveButton',
    defaultMessage: 'Save',
  },
  deleteButton: {
    id: 'CustomObjects.deleteButton',
    defaultMessage: 'Delete',
  },
  deleteConfirm: {
    id: 'CustomObjects.deleteConfirm',
    defaultMessage: 'Delete this Custom Object? This cannot be undone.',
  },
  saved: {
    id: 'CustomObjects.saved',
    defaultMessage: 'Saved.',
  },
  newTitle: {
    id: 'CustomObjects.newTitle',
    defaultMessage: 'New Custom Object',
  },
  notFound: {
    id: 'CustomObjects.notFound',
    defaultMessage: 'No Custom Object found for that container and key.',
  },
});

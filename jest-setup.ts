// myComponent.test.js
global.alert = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'), // Return a mock UUID string
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock ListName enum
jest.mock('./state/slices/listsSlice', () => ({
  ListName: {
    InCartList: 'InCartList',
    ShoppingList: 'ShoppingList',
    PreviouslyPurchased: 'PreviouslyPurchased',
  },
}));

jest.mock('@/constants/general', () => ({
  // Provide all necessary exports so that other modules won’t fail.
  SortOrder: {
    Ascending: 'ascending',
    Descending: 'descending',
  },
  SORT_ORDER_VALUE_BY_NAME_DEFAULT: {
    sortOrder: 'ascending',
    sortBy: 'Name',
  },
  DURATION_INITIAL: {
    number: 1,
    timeSpan: 'Week',
  },
  HOUR_IN_MS: 1000 * 60 * 60,
  DAY_IN_MS: 1000 * 60 * 60 * 24,
  WEEK_IN_MS: 1000 * 60 * 60 * 24 * 7,
  MONTH_IN_MS: 1000 * 60 * 60 * 24 * 30,
  YEAR_IN_MS: 1000 * 60 * 60 * 24 * 365,
}));

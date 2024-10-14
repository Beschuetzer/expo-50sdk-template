// myComponent.test.js
import { ListName } from './state/slices/listsSlice';

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

import {
  Item,
  StoreSpecificValuesMap,
  ItemWithStoreSpecificValues,
} from './Item';
import { Store } from './Store';
import { OriginalKeyProp, ItemProp, ItemsProp } from './general';
import { AddItemsListItemPayload } from './listSlice';

import { StorageManagerProps } from '@/components/StoreManager';

export type ItemFormValdation = {
  isValid: boolean;
  message: string;
};

export type ItemFormOnSave = {
  hasKeyChanged: boolean;
} & AddItemsListItemPayload &
  OriginalKeyProp;

export type ItemFormData = {
  selectedUrl: string;
} & Required<Pick<Item, '_id' | 'name' | 'upc'>>;

export type ItemFormProps = {
  autoSave?: boolean;
  autoSaveDebounce?: number;
  autoSaveOverride?: boolean;
  hideStoreManagerRow?: boolean;
  itemInList?: Item | null;
  canOverrideItem: boolean;
  currentStore: Store;
  initialQuantity?: number;
  onClose?: () => void;
  onDeleteImage?: (url: string) => void;
  onSave: (onSavePayload: ItemFormOnSave) => void;
  showContentOnly?: boolean;
  showOverrideMsgInitial?: boolean;
  shouldFocusFirstField?: boolean;
  shouldAddToCart?: boolean;
  storeManagerProps?: StorageManagerProps;
  storeSpecificValuesMap: StoreSpecificValuesMap;
} & Partial<ItemProp<ItemWithStoreSpecificValues>> &
  ItemsProp<Item> &
  OriginalKeyProp;

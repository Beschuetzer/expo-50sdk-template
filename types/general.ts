import { ReactElement, ReactNode } from 'react';
import { ViewStyle } from 'react-native';

import { Item, ItemWithStoreSpecificValues, Key } from './Item';
import { Store } from './Store';
import { UpcProduct } from './UpcResponse';

import { ListName } from '@/state/slices/listsSlice';

export enum TimeSpan {
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
}
export type Frequency = {
  number: number;
  timeSpan: TimeSpan;
};

export type ChildrenProp = {
  children?: ReactNode | ReactNode[];
};

export type SpacingProp = {
  spacing?: number | string;
};

export type HeadingTagProp = {
  /**
   *This is the component to use to render the header.
   **/
  headingTag?: any; //todo: figure out type here
};

export type OriginalKeyProp = {
  originalKey: Key;
};

export type KeyProp = {
  key: Key;
};

export type ListNameProp = {
  listName: ListName;
};

export type ItemProp<T> = {
  item: T;
};

export type ItemsProp<T> = {
  items: T[];
};

export type ItemOrItemWithStoreSpecificValuesProp = {
  item: Item | ItemWithStoreSpecificValues;
};

export type ItemWithStoreSpecificValuesProp = {
  itemWithStoreSpecificValues: ItemWithStoreSpecificValues;
};

export type UpcProp = {
  upc: string;
};

export type StoreProp = {
  store?: Store | null | undefined;
};

export type UpcProductProp = {
  upcProduct: UpcProduct;
};

export type StyleProp = {
  style?: ViewStyle;
};

export type ListRow<T> = { item: T; index: number };
export type FlatListItem = {
  jsx: ReactElement;
  key: number | string;
};

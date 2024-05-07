import { ColorSchemeType } from 'native-base/lib/typescript/components/types';
import { ReactElement, ReactNode } from 'react';
import { ViewStyle } from 'react-native';

import { Item, ItemWithStoreSpecificValues, Key } from './Item';
import { Store } from './Store';
import { UpcProduct } from './UpcResponse';

import { ListName } from '@/state/slices/listsSlice';

export enum ScanningMode {
  AddToCart = 'Add to Cart',
  ItemLookup = 'Item Lookup',
}

export enum TimeSpan {
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
}

export enum State {
  None = 'Select a State',
  Alabama = 'Alabama',
  Alaska = 'Alaska',
  Arizona = 'Arizona',
  Arkansas = 'Arkansas',
  California = 'California',
  Colorado = 'Colorado',
  Connecticut = 'Connecticut',
  Delaware = 'Delaware',
  Florida = 'Florida',
  Georgia = 'Georgia',
  Hawaii = 'Hawaii',
  Idaho = 'Idaho',
  Illinois = 'Illinois',
  Indiana = 'Indiana',
  Iowa = 'Iowa',
  Kansas = 'Kansas',
  Kentucky = 'Kentucky',
  Louisiana = 'Louisiana',
  Maine = 'Maine',
  Maryland = 'Maryland',
  Massachusetts = 'Massachusetts',
  Michigan = 'Michigan',
  Minnesota = 'Minnesota',
  Mississippi = 'Mississippi',
  Missouri = 'Missouri',
  Montana = 'Montana',
  Nebraska = 'Nebraska',
  Nevada = 'Nevada',
  NewHampshire = 'New Hampshire',
  NewJersey = 'New Jersey',
  NewMexico = 'New Mexico',
  NewYork = 'New York',
  NorthCarolina = 'North Carolina',
  NorthDakota = 'North Dakota',
  Ohio = 'Ohio',
  Oklahoma = 'Oklahoma',
  Oregon = 'Oregon',
  Pennsylvania = 'Pennsylvania',
  RhodeIsland = 'Rhode Island',
  SouthCarolina = 'South Carolina',
  SouthDakota = 'South Dakota',
  Tennessee = 'Tennessee',
  Texas = 'Texas',
  Utah = 'Utah',
  Vermont = 'Vermont',
  Virginia = 'Virginia',
  Washington = 'Washington',
  WestVirginia = 'West Virginia',
  Wisconsin = 'Wisconsin',
  Wyoming = 'Wyoming',
}

export type Address = {
  addressLineOne: string;
  addressLineTwo?: string;
  city: string;
  state: string;
  zipCode: string;
} | null;

export type ButtonOptions = {
  colorScheme?: ColorSchemeType;
  isEnabled?: boolean;
  text?: string;
};

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

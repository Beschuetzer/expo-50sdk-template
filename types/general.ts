import { ColorSchemeType } from 'native-base/lib/typescript/components/types';
import { ReactElement, ReactNode } from 'react';
import { ViewStyle } from 'react-native';

import {
  Item,
  ItemsList,
  ItemWithStoreSpecificValues,
  Key,
  LastPurchasedMap,
  StoreList,
  StoreSpecificValuesMap,
} from './Item';
import { GpsCoordinate, Store } from './Store';
import { UpcProduct } from './UpcResponse';
import { CurrentStoreNeeded, DispatchNeeded } from './bffService';
import { Inventory } from './inventory';
import { ListName } from './listSlice';

export enum ScanningMode {
  AddToCart = 'Add to Cart',
  ItemLookup = 'Item Lookup',
}

export enum TimeSpan {
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year',
}

export type TimeStamp = {
  timestamp: number;
};

export enum State {
  None = 'Select a State',
  Alabama = 'AL',
  Alaska = 'AK',
  AmericanSamoa = 'AS',
  Arizona = 'AZ',
  Arkansas = 'AR',
  California = 'CA',
  Colorado = 'CO',
  Connecticut = 'CT',
  Delaware = 'DE',
  DistrictOfColumbia = 'DC',
  Florida = 'FL',
  Georgia = 'GA',
  Guam = 'GU',
  Hawaii = 'HI',
  Idaho = 'ID',
  Illinois = 'IL',
  Indiana = 'IN',
  Iowa = 'IA',
  Kansas = 'KS',
  Kentucky = 'KY',
  Louisiana = 'LA',
  Maine = 'ME',
  Maryland = 'MD',
  Massachusetts = 'MA',
  Michigan = 'MI',
  Minnesota = 'MN',
  Mississippi = 'MS',
  Missouri = 'MO',
  Montana = 'MT',
  Nebraska = 'NE',
  Nevada = 'NV',
  NewHampshire = 'NH',
  NewJersey = 'NJ',
  NewMexico = 'NM',
  NewYork = 'NY',
  NorthCarolina = 'NC',
  NorthDakota = 'ND',
  NorthernMarianaIslands = 'MP',
  Ohio = 'OH',
  Oklahoma = 'OK',
  Oregon = 'OR',
  Pennsylvania = 'PA',
  PuertoRico = 'PR',
  RhodeIsland = 'RI',
  SouthCarolina = 'SC',
  SouthDakota = 'SD',
  Tennessee = 'TN',
  Texas = 'TX',
  Utah = 'UT',
  Vermont = 'VT',
  Virginia = 'VA',
  VirginIslands = 'VI',
  Washington = 'WA',
  WestVirginia = 'WV',
  Wisconsin = 'WI',
  Wyoming = 'WY',
}

export type AddressGeneric<T> = {
  addressLineOne: T;
  addressLineTwo?: T;
  city: T;
  country: T;
  state: T;
  zipCode: T;
};

export type Address = AddressGeneric<string>;

export type ButtonOptions = {
  colorScheme?: ColorSchemeType;
  isEnabled?: boolean;
  isVisible?: boolean;
  text?: string;
};

export type CurrentLocation = GpsCoordinate | null;

export type Duration = {
  number: number;
  timeSpan: TimeSpan;
};

export type ErrorNative = {
  stack?: string;
  message?: string;
};
export type Error = {
  error?: ErrorNative;
  message: string;
  statusCode?: number;
};

/**
 *This is how the server responds when an error occurs
 **/
export type ErrorMessage = {
  errorResponse: {
    message: string;
  };
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
export type UpcProducts = { [key: string]: UpcProduct & TimeStamp };

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

export type FileNames = {
  items: ItemsList;
  stores: StoreList & CurrentStoreNeeded;
  storeSpecificValues: StoreSpecificValuesMap;
  lastPurchasedMap: LastPurchasedMap;
  inventory: Inventory;
};
export type ResolvedType<T> = T extends Promise<infer R> ? R : T;
export type SetAppDataInput = FileNames & DispatchNeeded;

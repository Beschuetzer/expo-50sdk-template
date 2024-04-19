import { Store } from '@reduxjs/toolkit';
import { Button, ScrollView, useTheme } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  listToDisplaySelector,
  ListName,
  currentStoreSelector,
} from '@/state/slices/listsSlice';
import {
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
} from '@/types/Item';

export type ItemFormStoreSpecificValuesStoreModalOnConfirmValues = {
  [StoreSpecificValueKey.AisleNumber]: string;
  [StoreSpecificValueKey.ItemId]: string;
  [StoreSpecificValueKey.Price]: string;
};

type ItemFormStoreSpecificValuesStoreModalProps = {
  itemWithStoreSpecificValues: ItemWithStoreSpecificValues;
  onConfirm: (
    values: ItemFormStoreSpecificValuesStoreModalOnConfirmValues,
  ) => void;
} & Omit<ModalWithBlurProps, 'children' | 'onConfirm'>;

export function ItemFormStoreSpecificValuesStoreModal(
  props: ItemFormStoreSpecificValuesStoreModalProps,
) {
  const { itemWithStoreSpecificValues, isVisible, onCancel, onConfirm } = props;
  const theme = useTheme();
  const storesList = useSelector(
    listToDisplaySelector(ListName.StoresList),
  ) as Store[];
  const currentStore = useSelector(currentStoreSelector);
  const [storesWithValues, setStoresWithValues] = useState<Set<string>>(
    new Set(),
  );
  const haveStoresBeenCalculatedRef = useRef(false);
  const [currentlySelectedStore, setCurrentlySelectedStore] =
    useState(EMPTY_STRING);

  const onButtonPress = useCallback((store: string) => {
    setCurrentlySelectedStore(store);
  }, []);

  useEffect(() => {
    haveStoresBeenCalculatedRef.current = false;
    setCurrentlySelectedStore(EMPTY_STRING);
  }, [currentStore]);

  useEffect(() => {
    if (!isVisible || haveStoresBeenCalculatedRef.current) return;
    const storesWithValuesLocal = new Set<string>();
    for (const [, value] of Object.entries(itemWithStoreSpecificValues)) {
      if (typeof value !== 'object' || Array.isArray(value)) continue;
      const stores = Object.keys(value as any);
      stores.forEach((store) => storesWithValuesLocal.add(store));
    }
    storesWithValuesLocal.delete(currentStore.name);
    setStoresWithValues(storesWithValuesLocal);
    haveStoresBeenCalculatedRef.current = true;
  }, [currentStore, storesList, itemWithStoreSpecificValues, isVisible]);

  return (
    <ModalWithBlur
      {...props}
      confirmButton={{
        isEnabled: !!currentlySelectedStore,
      }}
      isVisible={isVisible}
      onCancel={onCancel}
      onConfirm={() => {
        const toReturn = {
          [StoreSpecificValueKey.AisleNumber]: EMPTY_STRING,
          [StoreSpecificValueKey.ItemId]: EMPTY_STRING,
          [StoreSpecificValueKey.Price]: EMPTY_STRING,
        } as ItemFormStoreSpecificValuesStoreModalOnConfirmValues;
        for (const [key, value] of Object.entries(
          itemWithStoreSpecificValues,
        )) {
          switch (key) {
            case StoreSpecificValueKey.AisleNumber:
              if ((value as any)[currentlySelectedStore]) {
                (toReturn as any)[StoreSpecificValueKey.AisleNumber] = (
                  value as any
                )[currentlySelectedStore];
              }
              break;
            case StoreSpecificValueKey.ItemId:
              if ((value as any)[currentlySelectedStore]) {
                (toReturn as any)[StoreSpecificValueKey.ItemId] = (
                  value as any
                )[currentlySelectedStore];
              }
              break;
            case StoreSpecificValueKey.Price:
              if ((value as any)[currentlySelectedStore]) {
                (toReturn as any)[StoreSpecificValueKey.Price] = (value as any)[
                  currentlySelectedStore
                ];
              }
              break;
          }
        }
        onConfirm && onConfirm(toReturn);
      }}
    >
      <ScrollView>
        {Array.from(storesWithValues).map((store) => {
          return (
            <Button
              key={store}
              mt={theme.space[FORM_INTER_ITEM_SPACING]}
              variant="subtle"
              isDisabled={currentlySelectedStore === store}
              onPress={() => onButtonPress(store)}
            >
              {store}
            </Button>
          );
        })}
      </ScrollView>
    </ModalWithBlur>
  );
}

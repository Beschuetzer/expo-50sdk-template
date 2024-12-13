import { Button, ScrollView, useTheme } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  listToDisplaySelector,
  currentStoreSelector,
} from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import {
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
} from '@/types/Item';
import { Store } from '@/types/Store';
import { ListName } from '@/types/listSlice';

export type ItemFormStoreSpecificValuesStoreModalOnConfirmValues = {
  [StoreSpecificValueKey.AisleNumber]: string;
  [StoreSpecificValueKey.ItemId]: string;
  [StoreSpecificValueKey.Price]: string;
  [StoreSpecificValueKey.Note]: string;
};

type StoreId = string;
type StoreName = string;
type StoreMap = Record<StoreId, StoreName>;
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
  const storesList = useAppSelector(
    listToDisplaySelector(ListName.StoresList),
  ) as Store[];
  const currentStore = useAppSelector(currentStoreSelector);
  const [storeIdToNameMap, setStoreIdToNameMap] = useState<StoreMap>({});
  const haveStoresBeenCalculatedRef = useRef(false);
  const [currentlySelectedStore, setCurrentlySelectedStore] =
    useState<StoreMap>({});

  const onButtonPress = useCallback((storeMap: StoreMap) => {
    setCurrentlySelectedStore(storeMap);
  }, []);

  useEffect(() => {
    haveStoresBeenCalculatedRef.current = false;
    setCurrentlySelectedStore({});
  }, [currentStore]);

  useEffect(() => {
    if (!isVisible || haveStoresBeenCalculatedRef.current) return;
    const storeIdsWithValues = new Set<string>();

    for (const [, value] of Object.entries(itemWithStoreSpecificValues)) {
      if (typeof value !== 'object' || Array.isArray(value)) continue;
      const stores = Object.keys(value as any);
      stores.forEach((store) => storeIdsWithValues.add(store));
    }
    storeIdsWithValues.delete(currentStore._id);

    const mapToUse = {} as StoreMap;
    Array.from(storeIdsWithValues).forEach((storeId) => {
      storesList.find((storeInList) => {
        if (storeInList._id === storeId) {
          mapToUse[storeId] = storeInList.name;
        }
      });
    });

    setStoreIdToNameMap(mapToUse);
    haveStoresBeenCalculatedRef.current = true;
  }, [currentStore, storesList, itemWithStoreSpecificValues, isVisible]);

  return (
    <ModalWithBlur
      {...props}
      confirmButton={{
        isEnabled: Object.keys(currentlySelectedStore || {}).length > 0,
      }}
      isVisible={isVisible}
      onCancel={onCancel}
      onConfirm={() => {
        const toReturn = {
          [StoreSpecificValueKey.AisleNumber]: EMPTY_STRING,
          [StoreSpecificValueKey.ItemId]: EMPTY_STRING,
          [StoreSpecificValueKey.Note]: EMPTY_STRING,
          [StoreSpecificValueKey.Price]: EMPTY_STRING,
        } as ItemFormStoreSpecificValuesStoreModalOnConfirmValues;
        for (const [key, value] of Object.entries(
          itemWithStoreSpecificValues,
        )) {
          const [storeId] = Object.keys(currentlySelectedStore);

          switch (key) {
            case StoreSpecificValueKey.AisleNumber:
              if ((value as any)[storeId]) {
                (toReturn as any)[StoreSpecificValueKey.AisleNumber] = (
                  value as any
                )[storeId];
              }
              break;
            case StoreSpecificValueKey.ItemId:
              if ((value as any)[storeId]) {
                (toReturn as any)[StoreSpecificValueKey.ItemId] = (
                  value as any
                )[storeId];
              }
              break;
            case StoreSpecificValueKey.Price:
              if ((value as any)[storeId]) {
                (toReturn as any)[StoreSpecificValueKey.Price] = (value as any)[
                  storeId
                ];
              }
              break;
            case StoreSpecificValueKey.Note:
              if ((value as any)[storeId]) {
                (toReturn as any)[StoreSpecificValueKey.Note] = (value as any)[
                  storeId
                ];
              }
              break;
          }
        }
        onConfirm && onConfirm(toReturn);
      }}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        {Object.entries(storeIdToNameMap).map(([storeId, storeName]) => {
          return (
            <Button
              key={storeName}
              mt={theme.space[FORM_INTER_ITEM_SPACING]}
              variant="subtle"
              isDisabled={
                Object.keys(currentlySelectedStore || {})[0] === storeId
              }
              onPress={() => onButtonPress({ [storeId]: storeName })}
            >
              {storeName}
            </Button>
          );
        })}
      </ScrollView>
    </ModalWithBlur>
  );
}

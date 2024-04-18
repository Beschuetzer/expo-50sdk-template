import { Store } from '@reduxjs/toolkit';
import { Heading, ScrollView, Text, useTheme } from 'native-base';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { listToDisplaySelector, ListName } from '@/state/slices/listsSlice';
import {
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
} from '@/types/Item';

type ItemFormStoreSpecificValuesStoreModalOnConfirmValues = {
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

  useEffect(() => {
    if (!isVisible) return;
    console.log({ storesList, itemWithStoreSpecificValues });
    for (const [key, value] of Object.entries(itemWithStoreSpecificValues)) {
      const keysToUse = Object.values(StoreSpecificValueKey) as string[];
      if (keysToUse.includes(value as string)) {
        console.log({ key, value });
      }
    }
  }, [storesList, itemWithStoreSpecificValues, isVisible]);

  return (
    <ModalWithBlur
      isVisible={isVisible}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Heading
        textAlign="center"
        size="sm"
        pb={theme.space[FORM_INTER_ITEM_SPACING]}
      >
        Select a Store
      </Heading>
      <ScrollView>
        {Array.from({ length: 100 }, (_, i) => i + 1).map((item) => {
          return <Text>ItemFormStoreSpecificValuesStoreModal {item}</Text>;
        })}
      </ScrollView>
    </ModalWithBlur>
  );
}

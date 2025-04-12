import { Button, FlatList } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { ListItemSeparator } from '../lists/ListItemSeparator';

import { LIST_HAPTICS } from '@/constants/general';
import {
  storesListSelector,
  currentStoreSelector,
} from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import { Store } from '@/types/Store';
import { getKeyToUse, getStoreDescriptor } from '@/utils/helpers';

export type StoreSelectionModalProps = Omit<
  ModalWithBlurProps,
  'children' | 'onConfirm'
> & {
  canSelectCurrentStore?: boolean;
  storesToOmit?: Store[];
  onConfirm: (selectedStore: Store | null) => void;
};

export function StoreSelectionModal(props: StoreSelectionModalProps) {
  const {
    canSelectCurrentStore,
    isVisible,
    onConfirm,
    onCancel,
    storesToOmit = [],
  } = props;
  const storesList = useAppSelector(storesListSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const onCancelPressLocal = useCallback(() => {
    onCancel && onCancel();
  }, [onCancel]);

  const onConfirmPressLocal = useCallback(() => {
    onConfirm && onConfirm(selectedStore);
  }, [onConfirm, selectedStore]);

  useEffect(() => {
    setSelectedStore(null);
  }, [isVisible]);

  if (!isVisible) return null;
  return (
    <ModalWithBlur
      {...props}
      onConfirm={onConfirmPressLocal}
      onCancel={onCancelPressLocal}
    >
      <FlatList
        keyboardShouldPersistTaps="always"
        data={storesList.data.filter((store) => {
          let shouldInclude = true;
          const isNotIsStoresToOmit = storesToOmit?.every(
            (s) => s._id !== store._id,
          );
          if (!canSelectCurrentStore) {
            shouldInclude = store._id !== currentStore._id;
          }
          return shouldInclude && isNotIsStoresToOmit;
        })}
        keyExtractor={(store) => store._id}
        ItemSeparatorComponent={() => <ListItemSeparator />}
        renderItem={({ item: store, index }) => (
          <Button
            key={getKeyToUse(store)}
            onPress={() => {
              setSelectedStore(store);
              LIST_HAPTICS.handleSelection();
            }}
            variant="ghost"
            isDisabled={
              !!(
                selectedStore &&
                getKeyToUse(selectedStore) === getKeyToUse(store)
              )
            }
          >
            {getStoreDescriptor(store)}
          </Button>
        )}
      />
    </ModalWithBlur>
  );
}

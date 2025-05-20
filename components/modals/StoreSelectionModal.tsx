import { FlashList } from '@shopify/flash-list';
import { Button } from 'native-base';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { ListItemSeparator } from '../lists/ListItemSeparator';

import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_STORE_SELECTION_MODAL,
  LIST_HAPTICS,
} from '@/constants/general';
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
  initialStoreId?: Store['_id'];
  storesToOmit?: Store[];
  onConfirm: (selectedStore: Store | null) => void;
};

export function StoreSelectionModal(props: StoreSelectionModalProps) {
  const {
    canSelectCurrentStore,
    initialStoreId = EMPTY_STRING,
    isVisible,
    onConfirm,
    onCancel,
    storesToOmit = [],
  } = props;
  const storesList = useAppSelector(storesListSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const initialStoreToUse = useMemo(
    () =>
      initialStoreId
        ? storesList?.data?.find(
            (store) => getKeyToUse(store) === initialStoreId,
          ) || null
        : null,
    [initialStoreId, storesList.data],
  );
  const [selectedStore, setSelectedStore] = useState<Store | null>(
    initialStoreToUse,
  );
  const hasUserSelectedStoreRef = useRef(false);

  const onCancelPressLocal = useCallback(() => {
    onCancel && onCancel();
  }, [onCancel]);

  const onConfirmPressLocal = useCallback(() => {
    onConfirm && onConfirm(selectedStore || initialStoreToUse);
  }, [onConfirm, selectedStore, initialStoreToUse]);

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
      <FlashList
        estimatedItemSize={ESTIMATED_SIZE_FOR_STORE_SELECTION_MODAL}
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
        renderItem={({ item: store, index }) => {
          let isSelected = false;
          if (selectedStore) {
            isSelected = getKeyToUse(store) === getKeyToUse(selectedStore);
          } else if (initialStoreToUse && !hasUserSelectedStoreRef.current) {
            isSelected = getKeyToUse(store) === getKeyToUse(initialStoreToUse);
          }
          return (
            <Button
              key={getKeyToUse(store)}
              onPress={() => {
                hasUserSelectedStoreRef.current = true;
                setSelectedStore(store);
                LIST_HAPTICS.handleSelection();
              }}
              variant="ghost"
              isDisabled={isSelected}
            >
              {getStoreDescriptor(store)}
            </Button>
          );
        }}
      />
    </ModalWithBlur>
  );
}

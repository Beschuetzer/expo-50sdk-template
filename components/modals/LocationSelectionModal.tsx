import { FlashList } from '@shopify/flash-list';
import { Button } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { ListItemSeparator } from '../lists/ListItemSeparator';

import {
  ESTIMATED_SIZE_FOR_LOCATION_SELECTION_MODAL,
  LIST_HAPTICS,
} from '@/constants/general';
import {
  inventoryLocationsSelector,
  currentInventoryLocationSelector,
} from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import { InventoryLocation } from '@/types/inventory';
import { getKeyToUse } from '@/utils/helpers';

export type LocationSelectionModalProps = Omit<
  ModalWithBlurProps,
  'children' | 'onConfirm'
> & {
  canSelectCurrentLocation?: boolean;
  locationsToOmit?: InventoryLocation[];
  onConfirm: (selectedLocation?: InventoryLocation) => void;
};

export function LocationSelectionModal(props: LocationSelectionModalProps) {
  const {
    canSelectCurrentLocation,
    isVisible,
    onConfirm,
    onCancel,
    locationsToOmit = [],
  } = props;
  const inventoryLocations = useAppSelector(inventoryLocationsSelector);
  const currentInventoryLocation = useAppSelector(
    currentInventoryLocationSelector,
  );
  const [selectedStore, setSelectedStore] = useState<
    InventoryLocation | undefined
  >(undefined);

  const onCancelPressLocal = useCallback(() => {
    onCancel && onCancel();
  }, [onCancel]);

  const onConfirmPressLocal = useCallback(() => {
    onConfirm && onConfirm(selectedStore);
  }, [onConfirm, selectedStore]);

  useEffect(() => {
    setSelectedStore(undefined);
  }, [isVisible]);

  if (!isVisible) return null;
  return (
    <ModalWithBlur
      {...props}
      onConfirm={onConfirmPressLocal}
      onCancel={onCancelPressLocal}
    >
      <FlashList
        estimatedItemSize={ESTIMATED_SIZE_FOR_LOCATION_SELECTION_MODAL}
        keyboardShouldPersistTaps="always"
        data={inventoryLocations.filter((location) => {
          let shouldInclude = true;
          const isNotInLocationsToOmit = locationsToOmit?.every(
            (l) => l._id !== location._id,
          );
          if (!canSelectCurrentLocation) {
            shouldInclude = location._id !== currentInventoryLocation?._id;
          }
          return shouldInclude && isNotInLocationsToOmit;
        })}
        keyExtractor={(store) => store._id}
        ItemSeparatorComponent={() => <ListItemSeparator />}
        renderItem={({ item: location, index }) => (
          <Button
            key={getKeyToUse(location)}
            onPress={() => {
              setSelectedStore(location);
              LIST_HAPTICS.handleSelection();
            }}
            variant="ghost"
            isDisabled={
              !!(
                selectedStore &&
                getKeyToUse(selectedStore) === getKeyToUse(location)
              )
            }
          >
            {location.name}
          </Button>
        )}
      />
    </ModalWithBlur>
  );
}

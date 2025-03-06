import { Text } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ModalWithBlur } from './ModalWithBlur';

import { EMPTY_STRING } from '@/constants/general';
import {
  currentLocationSelector,
  currentStoreSelector,
  setCurrentStoreId,
  storesListSelector,
} from '@/state/slices/listsSlice';
import { autoSetStoreSelector } from '@/state/slices/optionsSlice';
import { Store } from '@/types/Store';
import { getIndexOfSmallestField, getKeyToUse } from '@/utils/helpers';

export type AutoSetStoreModalProps = object;

/**
 *This is in miles and determines how close you have to be to the store to assume you are there.
 **/
export const AutoSetStoreModal = (props: AutoSetStoreModalProps) => {
  const currentLocation = useSelector(currentLocationSelector);
  const currentStore = useSelector(currentStoreSelector);
  const autoSetStore = useSelector(autoSetStoreSelector);
  const storesList = useSelector(storesListSelector);
  const dispatch = useDispatch();
  const [storeToAskAbout, setStoreToAskAbout] = useState<Store | null>(null);

  const onCancelPress = useCallback(() => {
    setStoreToAskAbout(null);
  }, []);

  const onConfirmPress = useCallback((store: Store | null) => {
    dispatch(setCurrentStoreId(getKeyToUse(store || EMPTY_STRING)));
    onCancelPress();
  }, []);

  useEffect(() => {
    console.log({ currentLocation, storesList });
    
    const storesMeetingCriteria: Store[] = [];
    for (const store of storesList.data) {
      const storeIsCloseEnough =
        store.calculatedDistance != null &&
        store.calculatedDistance <= autoSetStore.maxDistanceInMiles;
        console.log({ storeIsCloseEnough });
        
      if (storeIsCloseEnough) {
        storesMeetingCriteria.push(store);
      }
    }

    console.log({ storesMeetingCriteria });
    
    if (storesMeetingCriteria.length > 0) {
      const assumedStore =
        storesMeetingCriteria[
          getIndexOfSmallestField<Store>(
            storesMeetingCriteria,
            'calculatedDistance',
          )
        ];
      const isCurrentStoreAssumedStore =
        currentStore.name.trim().toLowerCase() ===
        assumedStore?.name.trim().toLowerCase();

        console.log({ assumedStore, isCurrentStoreAssumedStore });
        
      if (!isCurrentStoreAssumedStore && autoSetStore.enabled) {
        onConfirmPress(assumedStore);
      } else if (!isCurrentStoreAssumedStore) {
        setStoreToAskAbout(assumedStore);
      }
    }
  }, [currentLocation, storesList]);

  return (
    <ModalWithBlur
      title="Auto-set Store"
      isVisible={!!storeToAskAbout}
      onConfirm={() => onConfirmPress(storeToAskAbout)}
      onCancel={onCancelPress}
    >
      <Text>
        Would you like to set{' '}
        <Text fontWeight={900} fontStyle="italic">
          {storeToAskAbout?.name}
        </Text>{' '}
        as your current store?
      </Text>
    </ModalWithBlur>
  );
};

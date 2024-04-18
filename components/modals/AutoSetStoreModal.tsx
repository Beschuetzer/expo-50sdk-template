import { Text, useTheme, Heading } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ModalWithBlur } from './ModalWithBlur';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  currentLocationSelector,
  currentStoreSelector,
  setCurrentStoreName,
  storesListSelector,
} from '@/state/slices/listsSlice';
import { autoSetStoreSelector } from '@/state/slices/optionsSlice';
import { Store } from '@/types/Store';
import { getIndexOfSmallestField } from '@/utils/helpers';

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
  const theme = useTheme();
  const [storeToAskAbout, setStoreToAskAbout] = useState<Store | null>(null);

  const onCancelPress = useCallback(() => {
    setStoreToAskAbout(null);
  }, []);

  const onConfirmPress = useCallback((store: Store | null) => {
    dispatch(setCurrentStoreName(store?.name));
    onCancelPress();
  }, []);

  useEffect(() => {
    const storesMeetingCriteria: Store[] = [];
    for (const store of storesList.data) {
      const storeIsCloseEnough =
        store.calculatedDistance != null &&
        store.calculatedDistance <= autoSetStore.maxDistanceInMiles;
      if (storeIsCloseEnough) {
        storesMeetingCriteria.push(store);
      }
    }

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

      if (!isCurrentStoreAssumedStore && autoSetStore.enabled) {
        onConfirmPress(assumedStore);
      } else if (!isCurrentStoreAssumedStore) {
        setStoreToAskAbout(assumedStore);
      }
    }
  }, [currentLocation, storesList.data]);

  return (
    <ModalWithBlur
      isVisible={!!storeToAskAbout}
      onConfirm={() => onConfirmPress(storeToAskAbout)}
      onCancel={onCancelPress}
    >
      <Heading mb={theme.space[FORM_INTER_ITEM_SPACING]} size="sm">
        It looks like you are at {storeToAskAbout?.name}
      </Heading>
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

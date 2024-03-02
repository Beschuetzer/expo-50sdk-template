import { View, Text, useTheme, Heading } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  currentLocationSelector,
  currentStoreSelector,
  setCurrentStoreName,
  storesListSelector,
} from '@/state/slices/listsSlice';
import { Store } from '@/types/Store';

export type CurrentStoreModalProps = object;

/**
 *This is in miles and determines how close you have to be to the store to assume you are there.
 **/
const DISTANCE_THRESHOLD = 0.1;
export const CurrentStoreModal = (props: CurrentStoreModalProps) => {
  const currentLocation = useSelector(currentLocationSelector);
  const currentStore = useSelector(currentStoreSelector);
  const storesList = useSelector(storesListSelector);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [storeToAskAbout, setStoreToAskAbout] = useState<Store | null>(null);

  const onCancelPress = useCallback(() => {
    setStoreToAskAbout(null);
  }, []);

  const onConfirmPress = useCallback(() => {
    dispatch(setCurrentStoreName(storeToAskAbout?.name));
    onCancelPress();
  }, [storeToAskAbout]);

  useEffect(() => {
    for (const store of storesList.data) {
      if (
        store.calculatedDistance !== undefined &&
        store.calculatedDistance <= DISTANCE_THRESHOLD &&
        currentStore.name.trim().toLowerCase() !==
          store?.name.trim().toLowerCase()
      ) {
        setStoreToAskAbout(store);
      }
    }
  }, [currentLocation]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={!!storeToAskAbout}
      onRequestClose={onCancelPress}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 20,
            }}
          >
            <TouchableOpacity onPress={onConfirmPress}>
              <Text style={{ color: theme.colors.green[900] }}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancelPress}>
              <Text style={{ color: theme.colors.danger[900] }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

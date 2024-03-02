import { BlurView } from 'expo-blur';
import { View, Text, useTheme, Heading } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { MODAL_BLUR_VIEW_COLOR } from '@/constants/colors';
import {
  AUTO_SET_STORE_DISTANCE_THRESHOLD,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import {
  currentLocationSelector,
  currentStoreSelector,
  setCurrentStoreName,
  storesListSelector,
} from '@/state/slices/listsSlice';
import { autoSetStoreWhenCloseEnoughSelector } from '@/state/slices/optionsSlice';
import { Store } from '@/types/Store';
import { getButtonHitSlop } from '@/utils/helpers';

export type AutoSetStoreModalProps = object;

/**
 *This is in miles and determines how close you have to be to the store to assume you are there.
 **/
export const AutoSetStoreModal = (props: AutoSetStoreModalProps) => {
  const currentLocation = useSelector(currentLocationSelector);
  const currentStore = useSelector(currentStoreSelector);
  const shouldAutoSetStore = useSelector(autoSetStoreWhenCloseEnoughSelector);
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
    for (const store of storesList.data) {
      if (
        store.calculatedDistance !== undefined &&
        store.calculatedDistance <= AUTO_SET_STORE_DISTANCE_THRESHOLD &&
        currentStore.name.trim().toLowerCase() !==
          store?.name.trim().toLowerCase()
      ) {
        if (shouldAutoSetStore) {
          onConfirmPress(store);
        } else {
          setStoreToAskAbout(store);
        }
      }
    }
  }, [currentLocation]);

  return (
    <>
      <Modal
        animationType="fade"
        transparent
        visible={!!storeToAskAbout}
        onRequestClose={onCancelPress}
      >
        <BlurView
          intensity={100}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: MODAL_BLUR_VIEW_COLOR,
          }}
        >
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
              <TouchableOpacity
                hitSlop={getButtonHitSlop(4)}
                onPress={() => onConfirmPress(storeToAskAbout)}
              >
                <Text style={{ color: theme.colors.green[900] }}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={getButtonHitSlop(4)}
                onPress={onCancelPress}
              >
                <Text style={{ color: theme.colors.danger[900] }}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </>
  );
};

import { FontAwesome } from '@expo/vector-icons';
import { Row, useTheme, Stack, FormControl } from 'native-base';
import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { ConfirmModal, ConfirmModalProps } from '../modals/ConfirmModal';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  currentStoreSelector,
  itemsListSelector,
  setCurrentStoreName,
  setItemsList,
  setStoresList,
  setStoreSpecificValues,
  storesListSelector,
  storeSpecificValuesMapSelector,
} from '@/state/slices/listsSlice';
import {
  setUpcProducts,
  upcProductsSelector,
} from '@/state/slices/scannerSlice';
import { loadAppStateFromFile, saveAppStateToFile } from '@/utils/helpers';

type SaveLoadStateProps = object;

const FILE_NAMES = {
  items: 'items',
  stores: 'stores',
  storeSpecificValues: 'storeSpecificValues',
  upcProducts: 'upcProducts',
};

export const SaveLoadState = (props: SaveLoadStateProps) => {
  const theme = useTheme();
  const itemsList = useSelector(itemsListSelector);
  const storeSpecificValues = useSelector(storeSpecificValuesMapSelector);
  const upcProducts = useSelector(upcProductsSelector);
  const stores = useSelector(storesListSelector);
  const currentStore = useSelector(currentStoreSelector);
  const dispatch = useDispatch();
  const iconSize = useMemo(() => theme.sizes[6], [theme]);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {},
  );

  const onLoadItemsPress = useCallback(async () => {
    setConfirmModalProps({
      isVisible: true,
      message:
        'Loading items will delete all of your current items.  Continue?',
      onCancel: () => setConfirmModalProps({ isVisible: false }),
      onConfirm: async () => {
        const itemsLoaded = await loadAppStateFromFile(FILE_NAMES.items);
        const storeSpecificValues = await loadAppStateFromFile(
          FILE_NAMES.storeSpecificValues,
        );
        const upcProducts = await loadAppStateFromFile(FILE_NAMES.upcProducts);
        dispatch(setStoreSpecificValues(storeSpecificValues));
        dispatch(setItemsList(itemsLoaded));
        dispatch(setUpcProducts(upcProducts));
        setConfirmModalProps({ isVisible: false });
      },
    });
  }, []);

  const onSaveItemsPress = useCallback(async () => {
    setConfirmModalProps({
      isVisible: true,
      message: 'Are you sure you wan to save items?',
      onCancel: () => setConfirmModalProps({ isVisible: false }),
      onConfirm: async () => {
        await saveAppStateToFile(FILE_NAMES.items, itemsList);
        await saveAppStateToFile(
          FILE_NAMES.storeSpecificValues,
          storeSpecificValues,
        );
        await saveAppStateToFile(FILE_NAMES.upcProducts, upcProducts);
        setConfirmModalProps({ isVisible: false });
      },
    });
  }, [upcProducts, itemsList, storeSpecificValues]);

  const onLoadStoresPress = useCallback(async () => {
    setConfirmModalProps({
      isVisible: true,
      message:
        'Loading stores will delete all of your current stores.  Continue?',
      onCancel: () => setConfirmModalProps({ isVisible: false }),
      onConfirm: async () => {
        const storesLoaded = await loadAppStateFromFile(FILE_NAMES.stores);
        dispatch(setStoresList(storesLoaded));
        dispatch(setCurrentStoreName());
        setConfirmModalProps({ isVisible: false });
      },
    });
  }, []);

  const onSaveStoresPress = useCallback(async () => {
    setConfirmModalProps({
      isVisible: true,
      message: 'Are you sure you wan to save stores?',
      onCancel: () => setConfirmModalProps({ isVisible: false }),
      onConfirm: async () => {
        await saveAppStateToFile(FILE_NAMES.stores, {
          ...stores,
          currentStoreName: currentStore.name,
        });
        setConfirmModalProps({ isVisible: false });
      },
    });
  }, [stores]);

  return (
    <Stack space={theme.space[FORM_INTER_ITEM_SPACING]}>
      <Row space={theme.space[5]} alignItems="center">
        <FormControl.Label>Items:</FormControl.Label>
        <TouchableOpacity onPress={onLoadItemsPress}>
          <FontAwesome name="download" size={iconSize} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSaveItemsPress}>
          <FontAwesome name="save" size={iconSize} />
        </TouchableOpacity>
      </Row>
      <Row space={theme.space[5]} alignItems="center">
        <FormControl.Label>Stores:</FormControl.Label>
        <TouchableOpacity onPress={onLoadStoresPress}>
          <FontAwesome name="download" size={iconSize} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSaveStoresPress}>
          <FontAwesome name="save" size={iconSize} />
        </TouchableOpacity>
      </Row>
      <ConfirmModal {...confirmModalProps} />
    </Stack>
  );
};

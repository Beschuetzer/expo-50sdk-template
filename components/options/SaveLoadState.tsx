import { FontAwesome } from '@expo/vector-icons';
import { Row, useTheme, Stack, Text } from 'native-base';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { FILE_NAMES, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { maxWidth } from '@/constants/styles';
import {
  currentStoreSelector,
  inventorySelector,
  itemsListSelector,
  lastPurchasedMapSelector,
  mutuallyExclusiveGroupsSelector,
  storesListSelector,
  storeSpecificValuesMapSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import {
  displayAlert,
  getDirectory,
  getKeyToUse,
  importAppData,
  makeNewDirectory,
  saveAppStateToFile,
  setAppData,
} from '@/utils/helpers';

type SaveLoadStateProps = object;

export const SaveLoadState = (props: SaveLoadStateProps) => {
  const theme = useTheme();
  const itemsList = useAppSelector(itemsListSelector);
  const storeSpecificValues = useAppSelector(storeSpecificValuesMapSelector);
  const lastPurchasedMap = useAppSelector(lastPurchasedMapSelector);
  const inventory = useAppSelector(inventorySelector);
  const stores = useAppSelector(storesListSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const mutuallyExclusiveGroups = useAppSelector(
    mutuallyExclusiveGroupsSelector,
  );
  const dispatch = useAppDispatch();
  const iconSize = useMemo(() => theme.sizes[6], [theme]);

  const onLoadItemsPress = useCallback(async () => {
    try {
      const dir = await getDirectory();
      const data = await importAppData(dir);
      setAppData({ ...data, dispatch });
    } catch (error) {
      displayAlert({
        msg: 'Unable to import app data.',
        error: (error as Error).message,
      });
    }
  }, []);

  const onBackupPress = useCallback(async () => {
    try {
      const dir = await getDirectory();
      const newFolderName = new Date().toISOString();
      const madeDirectory = await makeNewDirectory(dir, newFolderName);

      await saveAppStateToFile(FILE_NAMES.items, madeDirectory, itemsList);
      await saveAppStateToFile(
        FILE_NAMES.storeSpecificValues,
        madeDirectory,
        storeSpecificValues,
      );
      await saveAppStateToFile(
        FILE_NAMES.lastPurchasedMap,
        madeDirectory,
        lastPurchasedMap,
      );
      await saveAppStateToFile(FILE_NAMES.inventory, madeDirectory, inventory);
      await saveAppStateToFile(FILE_NAMES.stores, madeDirectory, {
        ...stores,
        currentStoreId: getKeyToUse(currentStore),
      });
      await saveAppStateToFile(
        FILE_NAMES.mutuallyExclusiveGroups,
        madeDirectory,
        mutuallyExclusiveGroups,
      );
    } catch (error) {
      displayAlert({
        msg: 'Unable to save app data.',
        error,
      });
    }
  }, [
    currentStore.name,
    inventory,
    itemsList,
    lastPurchasedMap,
    mutuallyExclusiveGroups,
    stores,
    storeSpecificValues,
  ]);

  return (
    <Stack space={theme.space[FORM_INTER_ITEM_SPACING]}>
      <Row
        space={theme.space[2]}
        justifyContent="space-between"
        alignItems="center"
        {...maxWidth}
      >
        <Text>Data (Restore/Backup):</Text>
        <TouchableOpacity onPress={onLoadItemsPress}>
          <FontAwesome name="download" size={iconSize} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onBackupPress}>
          <FontAwesome name="save" size={iconSize} />
        </TouchableOpacity>
      </Row>
    </Stack>
  );
};

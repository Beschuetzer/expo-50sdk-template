import { FontAwesome } from '@expo/vector-icons';
import { Row, useTheme, Stack, Text } from 'native-base';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { maxWidth } from '@/constants/styles';
import {
  accountSelector,
  isUpToDateSelector,
} from '@/state/slices/generalSlice';
import {
  currentStoreSelector,
  inventorySelector,
  itemsListSelector,
  lastPurchasedMapSelector,
  storesListSelector,
  storeSpecificValuesMapSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { loadAll, saveAll } from '@/state/thunks';
import { getKeyToUse } from '@/utils/helpers';

type SaveLoadStateViaDbProps = object;

export const SaveLoadStateViaDb = (props: SaveLoadStateViaDbProps) => {
  const theme = useTheme();
  const itemsList = useAppSelector(itemsListSelector);
  const storesList = useAppSelector(storesListSelector);
  const storeSpecificValues = useAppSelector(storeSpecificValuesMapSelector);
  const lastPurchasedMap = useAppSelector(lastPurchasedMapSelector);
  const inventory = useAppSelector(inventorySelector);
  const stores = useAppSelector(storesListSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const userAccount = useAppSelector(accountSelector);
  const isUpToDate = useAppSelector(isUpToDateSelector);

  const dispatch = useAppDispatch();
  const iconSize = useMemo(() => theme.sizes[6], [theme]);
  const greenColor = useMemo(() => theme.colors.green[900], [theme]);
  const redColor = useMemo(() => theme.colors.red[900], [theme]);

  const onLoadItemsPress = useCallback(async () => {
    dispatch(loadAll());
  }, []);

  const onBackupPress = useCallback(async () => {
    dispatch(
      saveAll({
        inventory,
        items: itemsList,
        lastPurchasedMap,
        stores: {
          ...storesList,
          currentStoreId: getKeyToUse(currentStore),
        },
        storeSpecificValues,
      }),
    );
  }, [
    currentStore.name,
    itemsList,
    inventory,
    lastPurchasedMap,
    stores,
    storeSpecificValues,
  ]);

  if (!userAccount || !userAccount._id) return null;
  return (
    <Stack>
      <Row justifyContent="space-between" alignItems="center" {...maxWidth}>
        <Text>Cloud Data (Restore/Backup):</Text>
        <TouchableOpacity onPress={onLoadItemsPress}>
          <FontAwesome name="download" size={iconSize} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onBackupPress}>
          <FontAwesome name="save" size={iconSize} />
        </TouchableOpacity>
      </Row>
      <Row
        space={theme.space[FORM_INTER_ITEM_SPACING]}
        justifyContent="flex-start"
        alignItems="center"
      >
        {isUpToDate ? (
          <>
            <FontAwesome name="check" color={greenColor} />
            <Text color={greenColor}>in sync</Text>
          </>
        ) : (
          <>
            <FontAwesome name="close" color={redColor} />
            <Text color={redColor}>sync needed</Text>
          </>
        )}
      </Row>
    </Stack>
  );
};

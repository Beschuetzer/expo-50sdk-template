import { useNavigation } from 'expo-router';
import { Stack, Row, theme, Text } from 'native-base';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { DeveloperInfo } from './DeveloperInfo';
import { TileIsSelectedBackground } from './ItemTileIsSelectedColumn';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import {
  ListsState,
  setCurrentStoreId,
  storeItemsCountSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch } from '@/state/store';
import { Address, StoreProp } from '@/types/general';
import { getAddressString, getKeyToUse } from '@/utils/helpers';

type StoreTileProps = {
  currentStore: StoreProp['store'];
} & StoreProp &
  Pick<ListsState, 'currentStoreId'>;

export function StoreTile(props: StoreTileProps) {
  const { currentStoreId, store } = props;
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const storeKeyToUse = useMemo(
    () => getKeyToUse(store || EMPTY_STRING),
    [store],
  );
  const storeItemsCount = useSelector(storeItemsCountSelector(storeKeyToUse));

  const onLongPress = useCallback(() => {
    // @ts-ignore
    navigation.navigate(Routes.StoreModal, {
      store,
    });
  }, [navigation, store]);

  const onTilePress = useCallback(() => {
    dispatch(setCurrentStoreId(storeKeyToUse));
    // @ts-ignore
    navigation.navigate(Routes.ShoppingListScreen);
  }, [navigation, dispatch, storeKeyToUse]);

  return (
    <RectButton
      style={styles.rectButton}
      onPress={onTilePress}
      onLongPress={onLongPress}
    >
      <Stack>
        <Row
          px={theme.space[FORM_INTER_ITEM_SPACING]}
          space={theme.space[2]}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack flex={1} justifyContent="center">
            <Text fontSize={theme.fontSizes['lg']}>
              {store?.name} ({storeItemsCount})
            </Text>
            {store?.addressLineTwo ? <Text>{store.addressLineTwo}</Text> : null}
            {store?.city || store?.state || store?.zipCode ? (
              <Text>{getAddressString(store as Address)}</Text>
            ) : null}
            {store?.calculatedDistance != null &&
            store?.calculatedDistance >= 0 ? (
              <Text>Estimated Distance: {store.calculatedDistance}mi.</Text>
            ) : null}
            <DeveloperInfo {...store} />
          </Stack>
          <TileIsSelectedBackground
            isMultiSelectMode
            isSelected={storeKeyToUse === currentStoreId}
          />
        </Row>
      </Stack>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    ...tileContainerStyles,
    position: 'relative',
  },
});

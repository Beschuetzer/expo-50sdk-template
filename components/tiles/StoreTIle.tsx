import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Stack, Row, theme, Text } from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { DeveloperInfo } from './DeveloperInfo';
import { TileIsSelectedBackground } from './ItemTileIsSelectedColumn';
import { StoreMutuallyExclusiveGroupsModal } from '../modals/StoreMutuallyExclusiveGroupsModal';
import { StoreReturnItemsModal } from '../modals/StoreReturnItemsModal';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import {
  ListsState,
  mutuallyExclusiveGroupsSelector,
  returnItemsSelector,
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
  const returnItemsMap = useSelector(returnItemsSelector);
  const meGroups = useSelector(mutuallyExclusiveGroupsSelector);
  const returnItemsCount = returnItemsMap[storeKeyToUse]?.length ?? 0;
  const meGroupsCount = meGroups.filter(
    (g) => g.storeId === storeKeyToUse,
  ).length;
  const [isReturnItemsModalVisible, setIsReturnItemsModalVisible] =
    useState(false);
  const [isMeGroupsModalVisible, setIsMeGroupsModalVisible] = useState(false);

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
          <Row space={2} alignItems="center">
            {returnItemsCount > 0 && (
              <TouchableOpacity
                onPress={() => setIsReturnItemsModalVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Row
                  alignItems="center"
                  space={1}
                  bg={theme.colors.orange[100]}
                  borderRadius={4}
                  px={2}
                  py={1}
                >
                  <FontAwesome
                    name="reply"
                    size={12}
                    color={theme.colors.orange[600]}
                  />
                  <Text fontSize="xs" color={theme.colors.orange[700]}>
                    {returnItemsCount}
                  </Text>
                </Row>
              </TouchableOpacity>
            )}
            {meGroupsCount > 0 && (
              <TouchableOpacity
                onPress={() => setIsMeGroupsModalVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Row
                  alignItems="center"
                  space={1}
                  bg={theme.colors.primary[100]}
                  borderRadius={4}
                  px={2}
                  py={1}
                >
                  <FontAwesome
                    name="random"
                    size={12}
                    color={theme.colors.primary[700]}
                  />
                  <Text fontSize="xs" color={theme.colors.primary[700]}>
                    {meGroupsCount}
                  </Text>
                </Row>
              </TouchableOpacity>
            )}
            <TileIsSelectedBackground
              isMultiSelectMode
              isSelected={storeKeyToUse === currentStoreId}
            />
          </Row>
        </Row>
      </Stack>
      <StoreReturnItemsModal
        isVisible={isReturnItemsModalVisible}
        storeId={storeKeyToUse}
        onClose={() => setIsReturnItemsModalVisible(false)}
      />
      <StoreMutuallyExclusiveGroupsModal
        isVisible={isMeGroupsModalVisible}
        storeId={storeKeyToUse}
        onClose={() => setIsMeGroupsModalVisible(false)}
      />
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    ...tileContainerStyles,
    position: 'relative',
  },
});

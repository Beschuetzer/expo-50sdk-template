import { FlashList } from '@shopify/flash-list';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
import { Text, Stack, useTheme, Row } from 'native-base';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RectButton } from 'react-native-gesture-handler';

import { FontAwesomeButton } from '@/components/FontAwesomeButton';
import { useMenu } from '@/components/hooks/useMenu';
import { SwipeableRow } from '@/components/lists/SwipeableRow';
import { LocationSelectionModal } from '@/components/modals/LocationSelectionModal';
import { ItemTile } from '@/components/tiles/ItemTile';
import {
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  TIME_TO_EXPIRATION_DEFAULT,
} from '@/constants/general';
import {
  currentInventoryLocationIdSelector,
  inventoryItemSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import {
  addInventoryItemsThunk,
  deleteInventoryItemsThunk,
  moveInventoryItemExpirationDatesThunk,
} from '@/state/thunks';
import { InventoryLocation } from '@/types/inventory';
import { InventoryItemSelectorProps } from '@/types/inventorySlice';
import { ListName } from '@/types/listSlice';
import { getSortedExpirationDates } from '@/utils/getSortedExpirationDates';

type ExpirationItem = {
  key: string;
  date: string;
  quantity: number;
  // index corresponds to the group index from sorted expiration dates (if needed)
  groupIndex: number;
};

export default function InventoryScreenItem() {
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { itemId, locationId } =
    useGlobalSearchParams<InventoryItemSelectorProps>();
  const { item, inventoryItem } = useAppSelector(
    inventoryItemSelector({ itemId, locationId }),
  );
  const currentInventoryLocationId = useAppSelector(
    currentInventoryLocationIdSelector,
  );
  const [isLocationSelectionModalVisible, setIsLocationSelectionModalVisible] =
    useState(false);
  const selectedItemIndexRef = useRef<number | null>(null);
  const expirationDatesToUse = useMemo(
    () => inventoryItem?.expirationDates || {},
    [inventoryItem?.expirationDates],
  );

  // Flatten the sorted expiration dates into a list that FlashList can use.
  // For each sorted pair, we create as many items as the quantity.
  const expirationData: ExpirationItem[] = useMemo(() => {
    const sorted = getSortedExpirationDates(expirationDatesToUse);
    const data: ExpirationItem[] = [];
    sorted.forEach(([date, qty], groupIndex) => {
      for (let i = 0; i < qty; i++) {
        data.push({
          key: `${groupIndex}-${i}`,
          date,
          quantity: qty,
          groupIndex,
        });
      }
    });
    return data;
  }, [expirationDatesToUse]);

  const closeIsLocationSelectionModal = useCallback(() => {
    setIsLocationSelectionModalVisible(false);
  }, []);

  const onLocationSelectionModalConfirm = useCallback(
    (location?: InventoryLocation) => {
      if (selectedItemIndexRef.current == null) return;
      // Get the expiration date key from the flattened data.
      const expirationDateToUse =
        expirationData[selectedItemIndexRef.current]?.date;
      dispatch(
        moveInventoryItemExpirationDatesThunk([
          {
            itemId,
            originLocationId: currentInventoryLocationId || EMPTY_STRING,
            targetLocationId: location?._id || EMPTY_STRING,
            expirationDates: [expirationDateToUse],
          },
        ]),
      );
      closeIsLocationSelectionModal();
    },
    [
      currentInventoryLocationId,
      expirationData,
      itemId,
      dispatch,
      closeIsLocationSelectionModal,
    ],
  );

  const onPlusPress = useCallback(() => {
    dispatch(
      addInventoryItemsThunk([
        {
          itemId,
          locationId: currentInventoryLocationId,
          item: {
            expirationDates: {
              [Date.now() +
              (item?.timeToExpiration || TIME_TO_EXPIRATION_DEFAULT)]: 1,
            },
          },
        },
      ]),
    );
  }, [itemId, currentInventoryLocationId, item?.timeToExpiration, dispatch]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Manage Inventory for '${item?.name || item?.upc || 'Item'}'`,
    });
  }, [item?.name, item?.upc, navigation]);

  useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerRight: () => (
        <FontAwesomeButton name="plus" onPress={onPlusPress} />
      ),
    }),
  });

  // Render item for FlashList.
  const renderExpirationItem = useCallback(
    ({ item, index }: { item: ExpirationItem; index: number }) => {
      return (
        <SwipeableRow
          key={item.key}
          leftSwipe={{
            title: 'Delete',
            onPress: () => {
              dispatch(
                deleteInventoryItemsThunk([
                  {
                    itemId,
                    expirationDates: {
                      [item.date]: 1,
                    },
                  },
                ]),
              );
            },
            backgroundColor: theme.colors.danger[900],
          }}
          rightSwipe={{
            title: 'Move',
            onPress: () => {
              // Save the index of the selected item within the flattened array.
              selectedItemIndexRef.current = index;
              setIsLocationSelectionModalVisible(true);
            },
            backgroundColor: theme.colors.green[900],
          }}
        >
          <RectButton
            style={{
              paddingVertical: theme.space[FORM_INTER_ITEM_SPACING] * 10,
              paddingHorizontal: theme.space[FORM_INTER_ITEM_SPACING] * 2,
              backgroundColor: theme.colors.white,
            }}
          >
            <Row justifyContent="space-between" alignItems="center">
              <Text fontWeight={900}>
                One expiring on{' '}
                {new Date(Number(item.date)).toLocaleDateString()}
              </Text>
            </Row>
          </RectButton>
        </SwipeableRow>
      );
    },
    [dispatch, itemId, theme, currentInventoryLocationId],
  );

  return (
    <>
      <Stack
        p={theme.space[FORM_INTER_ITEM_SPACING]}
        backgroundColor={theme.colors.white}
        flex={1}
      >
        <Row
          borderBottomColor={theme.colors.gray[200]}
          borderBottomWidth={2}
          pb={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          <ItemTile
            item={item as any}
            isMultiSelectMode={false}
            isSelected={false}
            listName={ListName.InventoryList}
          />
        </Row>
        <FlashList
          data={expirationData}
          renderItem={renderExpirationItem}
          keyExtractor={(item) => item.key}
          estimatedItemSize={64}
          contentContainerStyle={{ backgroundColor: theme.colors.white }}
        />
      </Stack>
      <LocationSelectionModal
        title="Select Location"
        isVisible={isLocationSelectionModalVisible}
        onConfirm={onLocationSelectionModalConfirm}
        onBlurPress={closeIsLocationSelectionModal}
        onCancel={closeIsLocationSelectionModal}
      />
    </>
  );
}

import { FontAwesome } from '@expo/vector-icons';
import {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
} from '@gorhom/bottom-sheet';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTileWithStoreSpecificValues } from './ItemTileWithStoreSpecificValues';
import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  currentStoreSelector,
  updateStoreSpecificValues,
  itemsPurchasedAtStoreSelector,
  updateSelectedItemsFromRecommendedItems,
  setIsMultiSelectModeForRecommendedItems,
  selectedItemsFromRecommendedItemsSelector,
  ListName,
  lastPurchasedMapSelector,
  isMultiSelectModeForRecommendedItemsSelector,
} from '@/state/slices/listsSlice';
import { ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { getKeyToUse } from '@/utils/helpers';

type RecommendedItemsListProps = object;

const listName: ListName = ListName.RecommendedItemsList;
/**
 *The items for this list are actually not in the recommendations.data POS in redux.
 *Instead they are calculated based on the storeSpecificValuesMap in the storeSpecificListSelector
 **/
export function RecommendedItemsList(props: RecommendedItemsListProps) {
  const itemsPurchasedAtStore = useSelector(itemsPurchasedAtStoreSelector);
  const lastPurchasedMap = useSelector(lastPurchasedMapSelector);
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<BottomSheetFlatListMethods | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const selectedItems = useSelector(selectedItemsFromRecommendedItemsSelector);
  const isMultiSelectMode = useSelector(
    isMultiSelectModeForRecommendedItemsSelector,
  );

  console.log({ itemsPurchasedAtStore, lastPurchasedMap });

  const onSwipeRight = useCallback((key: Key) => {
    setRefreshing(false);
    dispatch(
      updateStoreSpecificValues({
        key,
        storeSpecificValuesToUpdate: {
          quantity: (currentQuantity: number) =>
            currentQuantity > 0 ? currentQuantity + 1 : 1,
        },
      }),
    );
  }, []);

  //   const onSwipeLeft = useCallback(
  //     (key: Key) => {
  //       dispatch(
  //         updateStoreSpecificValues({
  //           key,
  //           storeSpecificValuesToUpdate: {
  //             isInCart: (current) => false,
  //             quantity: (current) => 0,
  //           },
  //         }),
  //       );
  //       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  //     },
  //     [listRef],
  //   );

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    // const key = {
    //   name: item.name,
    //   upc: item.upc,
    // } as Key;
    const keyToUse = getKeyToUse(item);
    const now = Date.now();
    const lastPurchaseDate = lastPurchasedMap[keyToUse]?.[currentStore.name];
    const isRecommended =
      item.frequency &&
      lastPurchaseDate &&
      lastPurchaseDate + item.frequency <= now;

    return (
      <SwipeableRow
        key={index}
        rightSwipe={{
          backgroundColor: theme.colors.primary[900],
          onPress: onSwipeRight.bind(null, item),
          title: currentStore.name ? (
            <Stack
              paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
              alignItems="center"
            >
              <FontAwesome
                name="plus"
                color={theme.colors.white}
                size={theme.sizes[8]}
              />
              <Text color={theme.colors.white}>To Cart</Text>
            </Stack>
          ) : (
            <Text
              width={150}
              numberOfLines={2}
              paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
              color={theme.colors.white}
            >
              Select a Store to Add to Shopping List
            </Text>
          ),
        }}
      >
        <ItemTileWithStoreSpecificValues
          isRecommended={!!isRecommended}
          isMultiSelectMode={isMultiSelectMode}
          listName={listName}
          item={item}
          buttonProps={{
            onLongPress: () => {
              dispatch(
                updateSelectedItemsFromRecommendedItems({
                  operation: 'set',
                  item: isMultiSelectMode ? undefined : item,
                }),
              );
              dispatch(
                setIsMultiSelectModeForRecommendedItems(!isMultiSelectMode),
              );
            },
          }}
          onSelect={(item) => {
            const isSelected = !!selectedItems.find(
              (itemLocal) => getKeyToUse(item) === getKeyToUse(itemLocal),
            );
            if (isSelected) {
              dispatch(
                updateSelectedItemsFromRecommendedItems({
                  operation: 'remove',
                  item,
                }),
              );
            } else {
              dispatch(
                updateSelectedItemsFromRecommendedItems({
                  operation: 'add',
                  item,
                }),
              );
            }
          }}
          isSelected={
            !!selectedItems.find(
              (itemLocal) => getKeyToUse(item) === getKeyToUse(itemLocal),
            )
          }
        />
      </SwipeableRow>
    );
  }

  return (
    <BottomSheetFlatList
      ref={listRef}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }}
      data={itemsPurchasedAtStore}
      renderItem={renderItem}
      keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
        getKeyToUse(item)
      }
      ItemSeparatorComponent={() => <ListItemSeparator />}
    />
  );
}

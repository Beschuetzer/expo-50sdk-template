import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTileWithStoreSpecificValues } from './ItemTileWithStoreSpecificValues';
import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  currentStoreSelector,
  isMultiSelectModeForShoppingCartSelector,
  selectedItemsFromShoppingCartSelector,
  updateStoreSpecificValues,
  recommendedShoppingListItemsSelector,
  updateSelectedItemsFromRecommendedItems,
  setIsMultiSelectModeForRecommendedItems,
  selectedItemsFromRecommendedItemsSelector,
} from '@/state/slices/listsSlice';
import { ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { getKeyToUse } from '@/utils/helpers';

type RecommendedItemsListProps = object;

/**
 *The items for this list are actually not in the recommendations.data POS in redux.
 *Instead they are calculated based on the storeSpecificValuesMap in the storeSpecificListSelector
 **/
export function RecommendedItemsList(props: RecommendedItemsListProps) {
  const recommendedItems = useSelector(recommendedShoppingListItemsSelector);
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const selectedItems = useSelector(selectedItemsFromRecommendedItemsSelector);
  const isMultiSelectMode = useSelector(
    setIsMultiSelectModeForRecommendedItems,
  );

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
    return (
      <SwipeableRow
        // leftSwipe={{
        //   title: (
        //     <Stack paddingRight={theme.space[2]} alignItems="center">
        //       <FontAwesome
        //         name="remove"
        //         color={theme.colors.white}
        //         size={theme.sizes[8]}
        //       />
        //       <Text color={theme.colors.white}>Remove</Text>
        //     </Stack>
        //   ),
        //   backgroundColor: theme.colors.red[900],
        //   onPress: onSwipeLeft.bind(null, key),
        // }}
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
          isMultiSelectMode={isMultiSelectMode}
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
    <>
      <FlashList
        ref={listRef}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        data={recommendedItems}
        renderItem={renderItem}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          getKeyToUse(item)
        }
        estimatedItemSize={120}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
    </>
  );
}

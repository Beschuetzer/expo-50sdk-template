import { FontAwesome } from '@expo/vector-icons';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTileForPreviouslyPurchased } from './ItemTileForPreviouslyPurchasedItems';
import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  currentStoreSelector,
  updateStoreSpecificValues,
  itemsPurchasedAtStoreSelector,
  updateSelectedItemsFromPreviouslyPurchased,
  setIsMultiSelectModeForPreviouslyPurchased,
  selectedItemsFromPreviouslyPurchasedSelector,
  ListName,
  lastPurchasedMapSelector,
  isMultiSelectModeForPreviouslyPurchasedSelector,
  storeSpecificListSelector,
} from '@/state/slices/listsSlice';
import { ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { getKeyToUse } from '@/utils/helpers';

type PreviouslyPurchasedListProps = object;

const listName: ListName = ListName.PreviouslyPurchased;
/**
 *The items for this list are actually not in the recommendations.data POS in redux.
 *Instead they are calculated based on the storeSpecificValuesMap in the storeSpecificListSelector
 **/
export function PreviouslyPurchasedList(props: PreviouslyPurchasedListProps) {
  const itemsPurchasedAtStore = useSelector(itemsPurchasedAtStoreSelector);
  const lastPurchasedMap = useSelector(lastPurchasedMapSelector);
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const selectedItems = useSelector(
    selectedItemsFromPreviouslyPurchasedSelector,
  );
  const isMultiSelectMode = useSelector(
    isMultiSelectModeForPreviouslyPurchasedSelector,
  );
  const itemsInCart = useSelector(
    storeSpecificListSelector(ListName.InCartList),
  );
  const itemsInShopping = useSelector(
    storeSpecificListSelector(ListName.ShoppingList),
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

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    const keyToUse = getKeyToUse(item);
    const now = Date.now();
    const lastPurchaseDate = lastPurchasedMap[keyToUse]?.[currentStore.name];
    const isRecommended =
      item.frequency &&
      lastPurchaseDate &&
      lastPurchaseDate + item.frequency <= now;
    const itemInCart = itemsInCart.find(
      (item) => getKeyToUse(item) === keyToUse,
    );
    const itemInShopping = itemsInShopping.find(
      (item) => getKeyToUse(item) === keyToUse,
    );

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
                size={theme.sizes[6]}
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
        <ItemTileForPreviouslyPurchased
          isInCart={!!itemInCart}
          isInShopping={!!itemInShopping}
          isRecommended={!!isRecommended}
          isMultiSelectMode={isMultiSelectMode}
          listName={listName}
          item={item}
          buttonProps={{
            onLongPress: () => {
              dispatch(
                updateSelectedItemsFromPreviouslyPurchased({
                  operation: 'set',
                  item: isMultiSelectMode ? undefined : item,
                }),
              );
              dispatch(
                setIsMultiSelectModeForPreviouslyPurchased(!isMultiSelectMode),
              );
            },
          }}
          onSelect={(item) => {
            const isSelected = !!selectedItems.find(
              (itemLocal) => getKeyToUse(item) === getKeyToUse(itemLocal),
            );
            if (isSelected) {
              dispatch(
                updateSelectedItemsFromPreviouslyPurchased({
                  operation: 'remove',
                  item,
                }),
              );
            } else {
              dispatch(
                updateSelectedItemsFromPreviouslyPurchased({
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
    <FlatList
      refreshing={refreshing}
      data={itemsPurchasedAtStore}
      renderItem={renderItem}
      keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
        getKeyToUse(item)
      }
      ItemSeparatorComponent={() => <ListItemSeparator />}
    />
  );
}

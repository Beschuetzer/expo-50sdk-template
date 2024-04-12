import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { ListItemSeparator } from './ListItemSeparator';
import { ItemTileForPreviouslyPurchased } from '../tiles/ItemTileForPreviouslyPurchasedItems';

import {
  updateStoreSpecificValues,
  itemsPurchasedAtStoreSelector,
  updateSelectedItemsFromPreviouslyPurchased,
  setIsMultiSelectModeForPreviouslyPurchased,
  selectedItemsFromPreviouslyPurchasedSelector,
  ListName,
  isMultiSelectModeForPreviouslyPurchasedSelector,
  storeSpecificListSelector,
} from '@/state/slices/listsSlice';
import {
  ItemWithStoreSpecificValues,
  Key,
  PrevioulsyPurchasedItem,
} from '@/types/Item';
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

  const onAddPress = useCallback((key: Key) => {
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

  function renderItem({ item, index }: ListRow<PrevioulsyPurchasedItem>) {
    const keyToUse = getKeyToUse(item);
    const itemInCart = itemsInCart.find(
      (item) => getKeyToUse(item) === keyToUse,
    );
    const itemInShopping = itemsInShopping.find(
      (item) => getKeyToUse(item) === keyToUse,
    );

    return (
      <ItemTileForPreviouslyPurchased
        isInCart={!!itemInCart}
        isInShopping={!!itemInShopping}
        isRecommended={!!item.isRecommended}
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
        onAddPress={() => {
          onAddPress(item);
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

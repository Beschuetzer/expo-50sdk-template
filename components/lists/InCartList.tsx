import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTile } from './ItemTile';
import { ListItemSeparator } from './ListItemSeparator';
import { ListSorter } from './ListSorter';
import { shoppingListSortTypes } from './ShoppingLIst';
import { SwipeableRow } from './SwipeableRow';
import { SortType } from './sorters';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  ListName,
  addItemToCart,
  currentStoreSelector,
  moveItemToShoppingList,
  setSortOrder,
  shoppingListSelector,
  storeSpecificListSelector,
} from '@/state/slices/listsSlice';
import { ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { getKeyToUse } from '@/utils/helpers';

type InCartListProps = object;

const listName: ListName = ListName.InCartList;
export function InCartList(props: InCartListProps) {
  const shoppingList = useSelector(shoppingListSelector);
  const inCartList = useSelector(storeSpecificListSelector(listName));
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const onSortTypeChange = useCallback((sortType: SortType) => {
    dispatch(
      setSortOrder({ listName: ListName.ShoppingList, sortBy: sortType }),
    );
  }, []);

  const onSwipeRight = useCallback((item: ItemWithStoreSpecificValues) => {
    setRefreshing(false);
    dispatch(addItemToCart(item));
  }, []);

  const onSwipeLeft = useCallback(
    (key: Key) => {
      dispatch(moveItemToShoppingList(key));
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    [listRef],
  );

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    const key = {
      name: item.name,
      upc: item.upc,
    } as Key;
    return (
      <SwipeableRow
        leftSwipe={{
          title: (
            <Stack paddingRight={theme.space[2]} alignItems="center">
              <FontAwesome
                name="remove"
                color={theme.colors.white}
                size={theme.sizes[8]}
              />
              <Text color={theme.colors.white}>Remove</Text>
            </Stack>
          ),
          backgroundColor: theme.colors.red[900],
          onPress: onSwipeLeft.bind(null, key),
        }}
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
        <ItemTile item={item} />
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
        data={inCartList}
        renderItem={renderItem}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          getKeyToUse(item)
        }
        estimatedItemSize={120}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
      <ListSorter
        sortOrderValue={shoppingList.sortOrderValue}
        listName={ListName.ShoppingList}
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onValueChange={onSortTypeChange}
        sortTypes={shoppingListSortTypes}
        viewSize="small"
      />
    </>
  );
}

import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ListItemSeparator } from './ListItemSeparator';
import { ListSorter } from './ListSorter';
import { shoppingListSortTypes } from './ShoppingLIst';
import { SwipeableRow } from './SwipeableRow';
import { TotalListPrice } from './TotalListPrice';
import { SortType } from './sorters';
import { ItemTileProps, ItemTileViewingMode } from '../tiles/ItemTile';
import { ItemTileWithStoreSpecificValues } from '../tiles/ItemTileWithStoreSpecificValues';

import { ESTIMATED_SIZE_FOR_SHOPPING_LISTS } from '@/constants/general';
import {
  isMultiSelectModeForInCartSelector,
  moveItemToShoppingList,
  selectedItemsFromInCartSelector,
  setSortOrder,
  shoppingListSelector,
  storeSpecificListSelector,
  setIsMultiSelectModeForInCartCart,
  updateSelectedItemsFromInCart,
} from '@/state/slices/listsSlice';
import { ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { ListName } from '@/types/listSlice';
import { getKeyToUse } from '@/utils/helpers';

type InCartListProps = Pick<
  ItemTileProps<ItemWithStoreSpecificValues>,
  'viewingMode'
>;

const listName: ListName = ListName.InCartList;

/**
 *The items for this list are actually not in the inCartList.data POS in redux.
 *Instead they are calculated based on the storeSpecificValuesMap in the storeSpecificListSelector
 **/
export function InCartList(props: InCartListProps) {
  const { viewingMode } = props;
  const shoppingList = useSelector(shoppingListSelector);
  const inCartList = useSelector(storeSpecificListSelector(listName));
  const theme = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const selectedItems = useSelector(selectedItemsFromInCartSelector);
  const isMultiSelectMode = useSelector(isMultiSelectModeForInCartSelector);

  const iconSize = useMemo(() => {
    return theme.sizes[viewingMode === ItemTileViewingMode.Basic ? 4 : 8];
  }, [viewingMode]);

  const onSortTypeChange = useCallback((sortType: SortType) => {
    dispatch(
      setSortOrder({ listName: ListName.ShoppingList, sortBy: sortType }),
    );
  }, []);

  const onSwipeLeft = useCallback(
    (key: Key) => {
      dispatch(moveItemToShoppingList(key));
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    [listRef],
  );

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    if (index === 0) return <TotalListPrice listname={ListName.InCartList} />;
    return (
      <SwipeableRow
        leftSwipe={{
          title: (
            <Stack paddingRight={theme.space[2]} alignItems="center">
              <FontAwesome
                name="remove"
                color={theme.colors.white}
                size={iconSize}
              />
              <Text color={theme.colors.white}>Back to Shopping</Text>
            </Stack>
          ),
          backgroundColor: theme.colors.red[900],
          onPress: onSwipeLeft.bind(null, item),
        }}
      >
        <ItemTileWithStoreSpecificValues
          isMultiSelectMode={isMultiSelectMode}
          listName={listName}
          item={item}
          viewingMode={viewingMode}
          buttonProps={{
            onLongPress: () => {
              dispatch(
                updateSelectedItemsFromInCart({
                  operation: 'set',
                  item: isMultiSelectMode ? undefined : item,
                }),
              );
              dispatch(setIsMultiSelectModeForInCartCart(!isMultiSelectMode));
            },
          }}
          onSelect={(item) => {
            const isSelected = !!selectedItems.find(
              (itemLocal) => getKeyToUse(item) === getKeyToUse(itemLocal),
            );
            if (isSelected) {
              dispatch(
                updateSelectedItemsFromInCart({
                  operation: 'remove',
                  item,
                }),
              );
            } else {
              dispatch(
                updateSelectedItemsFromInCart({
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
        data={[{ name: 'in-cart price' } as any, ...inCartList]}
        renderItem={renderItem}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          getKeyToUse(item)
        }
        estimatedItemSize={ESTIMATED_SIZE_FOR_SHOPPING_LISTS}
        ItemSeparatorComponent={() => <ListItemSeparator />}
        stickyHeaderIndices={[0]}
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

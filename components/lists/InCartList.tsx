import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Stack, Text, useTheme, useToast } from 'native-base';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ListActionToast } from './ListActionToast';
import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';
import { TotalListPrice } from './TotalListPrice';
import { SortType } from './sorters';
import FilterListInput from '../FilterListInput';
import { ItemTileProps, ItemTileViewingMode } from '../tiles/ItemTile';
import { ItemTileWithStoreSpecificValues } from '../tiles/ItemTileWithStoreSpecificValues';

import {
  ESTIMATED_SIZE_FOR_SHOPPING_LISTS,
  LIST_HAPTICS,
  SORT_ORDER_VALUE_BY_AISLE_NUMBER_DEFAULT,
} from '@/constants/general';
import {
  isMultiSelectModeForInCartSelector,
  addItemToCart,
  moveItemToShoppingList,
  selectedItemsFromInCartSelector,
  storeSpecificListSelector,
  setIsMultiSelectModeForInCartCart,
  updateSelectedItemsFromInCart,
} from '@/state/slices/listsSlice';
import { ItemWithStoreSpecificValues } from '@/types/Item';
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
  const inCartList = useSelector(storeSpecificListSelector(listName));
  const theme = useTheme();
  const toast = useToast();
  const dispatch = useDispatch();
  const listRef = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const selectedItems = useSelector(selectedItemsFromInCartSelector);
  const isMultiSelectMode = useSelector(isMultiSelectModeForInCartSelector);
  const [inCartListToDisplay, setInCartListToDisplay] = useState(inCartList);

  const iconSize = useMemo(() => {
    return theme.sizes[viewingMode === ItemTileViewingMode.Basic ? 4 : 8];
  }, [viewingMode]);

  const onSwipeLeft = useCallback(
    (item: ItemWithStoreSpecificValues) => {
      LIST_HAPTICS.handleSwipeItem(true)();
      dispatch(moveItemToShoppingList(item));
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toast.closeAll();
      toast.show({
        id: 'in-cart-list-move',
        placement: 'bottom',
        duration: 4000,
        render: () => (
          <ListActionToast
            message={`'${item.name || item.upc || 'Item'}' moved back to Shopping.`}
            onUndo={() => {
              dispatch(addItemToCart(item));
              toast.closeAll();
            }}
          />
        ),
      });
    },
    [dispatch, listRef, theme, toast],
  );

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    if (index === 0) return <TotalListPrice listName={ListName.InCartList} />;
    return (
      <SwipeableRow
        key={getKeyToUse(item)}
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
              LIST_HAPTICS.handleMultipleItemSelect(isMultiSelectMode)();
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
            LIST_HAPTICS.handleIsSelected(isSelected)();
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
      <FilterListInput
        list={inCartList}
        onFilterChange={(filteredValues) => {
          setInCartListToDisplay(filteredValues);
        }}
        sortTypes={Object.values(SortType).filter(
          (sortType) =>
            sortType !== SortType.None && sortType !== SortType.Distance,
        )}
        startingSortOrderValue={SORT_ORDER_VALUE_BY_AISLE_NUMBER_DEFAULT}
      />
      <FlashList
        keyboardShouldPersistTaps="always"
        ref={listRef}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        data={[{ name: 'in-cart price' } as any, ...inCartListToDisplay]}
        renderItem={renderItem}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          getKeyToUse(item)
        }
        estimatedItemSize={ESTIMATED_SIZE_FOR_SHOPPING_LISTS}
        ItemSeparatorComponent={() => <ListItemSeparator />}
        stickyHeaderIndices={[0]}
      />
    </>
  );
}

import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';
import { TotalListPrice } from './TotalListPrice';
import { SortType } from './sorters';
import FilterListInput from '../FilterListInput';
import { StoreSelectionModal } from '../modals/StoreSelectionModal';
import { ItemTileProps, ItemTileViewingMode } from '../tiles/ItemTile';
import { ItemTileWithStoreSpecificValues } from '../tiles/ItemTileWithStoreSpecificValues';

import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_SHOPPING_LISTS,
  FORM_INTER_ITEM_SPACING,
  LIST_HAPTICS,
  SORT_ORDER_VALUE_BY_AISLE_NUMBER_DEFAULT,
} from '@/constants/general';
import {
  addItemToCart,
  currentStoreSelector,
  isMultiSelectModeForShoppingCartSelector,
  selectedItemsFromShoppingCartSelector,
  storeSpecificListSelector,
  setIsMultiSelectModeForShoppingCart,
  updateSelectedItemsFromShoppingCart,
  updateStoreSpecificValues,
  moveItemToAnotherCart,
} from '@/state/slices/listsSlice';
import { Item, ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { ListName } from '@/types/listSlice';
import { ensureMaxLength, getKeyToUse } from '@/utils/helpers';

type ShoppingListProps = Pick<
  ItemTileProps<ItemWithStoreSpecificValues>,
  'viewingMode'
>;

export const shoppingListSortTypes = [
  SortType.AisleNumber,
  SortType.Name,
  SortType.Upc,
  SortType.ItemId,
  SortType.Price,
  SortType.Quantity,
  SortType.AddedDate,
  SortType.LastUpdatedDate,
  SortType.Frequency,
] as SortType[];

const listName: ListName = ListName.ShoppingList;

/**
 *The items for this list are actually not in the shoppingList.data POS in redux.
 *Instead they are calculated based on the storeSpecificValuesMap in the storeSpecificListSelector
 **/
export function ShoppingList(props: ShoppingListProps) {
  const { viewingMode } = props;
  const shoppingList = useSelector(storeSpecificListSelector(listName));
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const selectedItems = useSelector(selectedItemsFromShoppingCartSelector);
  const isMultiSelectMode = useSelector(
    isMultiSelectModeForShoppingCartSelector,
  );
  const [itemToTransfer, setItemToTransfer] = useState<Item | null>(null);
  const [shoppingListToDisplay, setShoppingListToDisplay] =
    useState(shoppingList);

  const iconSize = useMemo(() => {
    return theme.sizes[viewingMode === ItemTileViewingMode.Basic ? 4 : 8];
  }, [viewingMode]);

  const onSwipeRight = useCallback((item: ItemWithStoreSpecificValues) => {
    LIST_HAPTICS.handleSwipeItem()();
    setRefreshing(false);
    dispatch(addItemToCart(item));
  }, []);

  const onSwipeLeft = useCallback(
    (key: Key) => {
      LIST_HAPTICS.handleSwipeItem(true)();
      dispatch(
        updateStoreSpecificValues({
          key,
          storeSpecificValuesToUpdate: {
            isInCart: (current) => false,
            quantity: (current) => 0,
          },
        }),
      );
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    [listRef],
  );

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    if (index === 0) return <TotalListPrice listname={ListName.ShoppingList} />;

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
              <Text color={theme.colors.white}>Remove</Text>
            </Stack>
          ),
          backgroundColor: theme.colors.red[900],
          onPress: onSwipeLeft.bind(null, item),
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
                size={iconSize}
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
          listName={listName}
          item={item}
          viewingMode={viewingMode}
          onTransferPress={() => {
            setItemToTransfer(item);
          }}
          buttonProps={{
            onLongPress: () => {
              dispatch(
                updateSelectedItemsFromShoppingCart({
                  operation: 'set',
                  item: isMultiSelectMode ? undefined : item,
                }),
              );
              dispatch(setIsMultiSelectModeForShoppingCart(!isMultiSelectMode));
              LIST_HAPTICS.handleMultipleItemSelect(isMultiSelectMode)();
            },
          }}
          onSelect={(item) => {
            const isSelected = !!selectedItems.find(
              (itemLocal) => getKeyToUse(item) === getKeyToUse(itemLocal),
            );
            if (isSelected) {
              dispatch(
                updateSelectedItemsFromShoppingCart({
                  operation: 'remove',
                  item,
                }),
              );
            } else {
              dispatch(
                updateSelectedItemsFromShoppingCart({
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
        list={shoppingList}
        onFilterChange={(filteredValues) => {
          setShoppingListToDisplay(filteredValues);
        }}
        sortTypes={Object.values(SortType).filter(
          (sortType) =>
            sortType !== SortType.None && sortType !== SortType.Distance,
        )}
        startingSortOrderValue={SORT_ORDER_VALUE_BY_AISLE_NUMBER_DEFAULT}
      />
      <FlashList
        ref={listRef}
        keyboardShouldPersistTaps="always"
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        data={[{ name: 'in-cart price' } as any, ...shoppingListToDisplay]}
        renderItem={renderItem}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          getKeyToUse(item)
        }
        estimatedItemSize={ESTIMATED_SIZE_FOR_SHOPPING_LISTS}
        ItemSeparatorComponent={() => <ListItemSeparator />}
        stickyHeaderIndices={[0]}
      />
      <StoreSelectionModal
        title={`Move '${ensureMaxLength(itemToTransfer?.name || EMPTY_STRING, 20)}' to:`}
        isVisible={!!itemToTransfer}
        onCancel={() => setItemToTransfer(null)}
        onConfirm={(selectedStore) => {
          setItemToTransfer(null);
          if (selectedStore && itemToTransfer) {
            dispatch(
              moveItemToAnotherCart({
                item: itemToTransfer,
                store: selectedStore,
              }),
            );
          }
        }}
      />
    </>
  );
}

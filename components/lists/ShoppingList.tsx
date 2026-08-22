import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Stack, Text, useTheme, useToast } from 'native-base';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import { ListActionToast } from './ListActionToast';
import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';
import { TotalListPrice } from './TotalListPrice';
import { SortOrder, SortType } from './sorters';
import FilterListInput from '../FilterListInput';
import { StoreSelectionModal } from '../modals/StoreSelectionModal';
import { ItemTileProps, ItemTileViewingMode } from '../tiles/ItemTile';
import { ItemTileWithStoreSpecificValues } from '../tiles/ItemTileWithStoreSpecificValues';
import { MutuallyExclusiveTile } from '../tiles/MutuallyExclusiveTile';
import { ReturnItemTile } from '../tiles/ReturnItemTile';

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
  mutuallyExclusiveGroupsSelector,
  returnItemsSelector,
  activeRouteSelector,
  selectedItemsFromShoppingCartSelector,
  storeSpecificListSelector,
  setIsMultiSelectModeForShoppingCart,
  updateSelectedItemsFromShoppingCart,
  updateStoreSpecificValues,
  moveItemToAnotherCart,
  moveItemToShoppingList,
  setActiveRouteId,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import {
  Item,
  ItemWithStoreSpecificValues,
  Key,
  StoreSpecificValueKey,
} from '@/types/Item';
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
  const shoppingList = useAppSelector(storeSpecificListSelector(listName));
  const currentStore = useAppSelector(currentStoreSelector);
  const meGroups = useAppSelector(mutuallyExclusiveGroupsSelector);
  const returnItemsMap = useAppSelector(returnItemsSelector);
  const theme = useTheme();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const listRef = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const selectedItems = useAppSelector(selectedItemsFromShoppingCartSelector);
  const isMultiSelectMode = useAppSelector(
    isMultiSelectModeForShoppingCartSelector,
  );
  const [itemToTransfer, setItemToTransfer] = useState<Item | null>(null);
  const [shoppingListToDisplay, setShoppingListToDisplay] =
    useState(shoppingList);
  // Tracks the last filter/sort values reported by FilterListInput so the
  // active route is only cleared when the user actually changes the filter
  // text or sort order, not whenever the underlying list data mutates (which
  // happens whenever a menu action anywhere adds/removes/updates items,
  // since this component stays mounted across tabs).
  const previousFilterStateRef = useRef<{
    filterValue: string;
    sortBy: SortType;
    sortOrder: SortOrder;
  } | null>(null);

  const currentStoreId = useMemo(
    () => (currentStore ? getKeyToUse(currentStore) : ''),
    [currentStore],
  );
  const activeRoute = useAppSelector(activeRouteSelector(currentStoreId));
  const returnItemKeys = useMemo(
    () => returnItemsMap[currentStoreId] ?? [],
    [returnItemsMap, currentStoreId],
  );
  // Keys belonging to any ME group that has at least one item in the live list
  // Resolved ME group entries with their item data (from live Redux list).
  // Always show all ME groups so newly created pairs are immediately visible
  // even if neither item has been added to the shopping list yet.
  const meEntries = useMemo(() => {
    if (!meGroups?.length) return [];
    return meGroups
      .filter((g) => !g.storeId || g.storeId === currentStoreId)
      .map((g) => ({
        _entryType: 'meGroup' as const,
        group: g,
        items1: g.itemKeys1.map((k) =>
          shoppingList.find((i) => getKeyToUse(i) === k),
        ),
        items2: g.itemKeys2.map((k) =>
          shoppingList.find((i) => getKeyToUse(i) === k),
        ),
      }));
  }, [meGroups, shoppingList, currentStoreId]);

  // All shopping-list items keep their own individual tiles; the ME tile
  // coexists as a relationship indicator above them.
  // When a route is active, items are sorted by their location's position in the route.
  const regularItems = useMemo(() => {
    if (!activeRoute) return shoppingListToDisplay;
    return [...shoppingListToDisplay].sort((a, b) => {
      const locA =
        (a as any)?.[StoreSpecificValueKey.Location]?.[activeRoute.id] ?? '';
      const locB =
        (b as any)?.[StoreSpecificValueKey.Location]?.[activeRoute.id] ?? '';
      const idxA = locA ? activeRoute.locations.indexOf(locA) : -1;
      const idxB = locB ? activeRoute.locations.indexOf(locB) : -1;
      const posA = idxA === -1 ? Number.MAX_SAFE_INTEGER : idxA;
      const posB = idxB === -1 ? Number.MAX_SAFE_INTEGER : idxB;
      return posA - posB;
    });
  }, [shoppingListToDisplay, activeRoute]);

  const iconSize = useMemo(() => {
    return theme.sizes[viewingMode === ItemTileViewingMode.Basic ? 4 : 8];
  }, [viewingMode]);

  const onSwipeRight = useCallback(
    (item: ItemWithStoreSpecificValues) => {
      LIST_HAPTICS.handleSwipeItem()();
      setRefreshing(false);
      dispatch(addItemToCart(item));
      toast.closeAll();
      toast.show({
        id: 'shopping-list-move',
        placement: 'bottom',
        duration: 4000,
        render: () => (
          <ListActionToast
            message={`${item.name || item.upc || 'Item'} moved to In Cart.`}
            onUndo={() => {
              dispatch(moveItemToShoppingList(item));
              toast.closeAll();
            }}
          />
        ),
      });
    },
    [dispatch, theme, toast],
  );

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
      toast.closeAll();
      toast.show({
        id: 'shopping-list-remove',
        placement: 'bottom',
        duration: 3000,
        render: () => <ListActionToast message="Item removed from Shopping." />,
      });
    },
    [dispatch, listRef, theme, toast],
  );

  function renderItem({ item, index }: { item: any; index: number }) {
    if (index === 0) return <TotalListPrice listName={ListName.ShoppingList} />;

    // Return items
    if (item._entryType === 'returnItem') {
      return <ReturnItemTile itemKey={item.itemKey} storeId={item.storeId} />;
    }

    // Mutually exclusive group entry
    if (item._entryType === 'meGroup') {
      return (
        <MutuallyExclusiveTile
          group={item.group}
          items1={item.items1}
          items2={item.items2}
          listName={listName}
          viewingMode={viewingMode}
        />
      );
    }

    const typedItem = item as ItemWithStoreSpecificValues;
    return (
      <SwipeableRow
        key={getKeyToUse(typedItem)}
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
          onPress: onSwipeLeft.bind(null, typedItem),
        }}
        rightSwipe={{
          backgroundColor: theme.colors.primary[900],
          onPress: onSwipeRight.bind(null, typedItem),
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
          item={typedItem}
          viewingMode={viewingMode}
          onTransferPress={() => {
            setItemToTransfer(typedItem);
          }}
          buttonProps={{
            onLongPress: () => {
              dispatch(
                updateSelectedItemsFromShoppingCart({
                  operation: 'set',
                  item: isMultiSelectMode ? undefined : typedItem,
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
              (itemLocal) => getKeyToUse(typedItem) === getKeyToUse(itemLocal),
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
        onFilterChange={(filteredValues, filterValue, sortOrderValue) => {
          setShoppingListToDisplay(filteredValues);
          const previous = previousFilterStateRef.current;
          const isUserFilterOrSortChange =
            previous !== null &&
            (previous.filterValue !== filterValue ||
              previous.sortBy !== sortOrderValue.sortBy ||
              previous.sortOrder !== sortOrderValue.sortOrder);
          previousFilterStateRef.current = {
            filterValue,
            sortBy: sortOrderValue.sortBy,
            sortOrder: sortOrderValue.sortOrder,
          };
          if (isUserFilterOrSortChange) {
            dispatch(
              setActiveRouteId({ storeId: currentStoreId, routeId: null }),
            );
          }
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
        data={[
          { name: 'in-cart price' } as any,
          ...returnItemKeys.map((itemKey) => ({
            _entryType: 'returnItem' as const,
            itemKey,
            storeId: currentStoreId,
          })),
          ...meEntries,
          ...regularItems,
        ]}
        renderItem={renderItem}
        keyExtractor={(item: any, index: number) => {
          if (item._entryType === 'returnItem') return `return-${item.itemKey}`;
          return item._entryType === 'meGroup'
            ? item.group.id
            : getKeyToUse(item);
        }}
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

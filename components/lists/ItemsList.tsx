import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useNavigation } from 'expo-router';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { Menu } from 'react-native-popup-menu';
import { useDispatch, useSelector } from 'react-redux';

import { ListFilter, ListFilterFilters } from './ListFilter';
import { ListItemSeparator } from './ListItemSeparator';
import { ListSorter } from './ListSorter';
import { SwipeableRow } from './SwipeableRow';
import { SortType } from './sorters';
import { AddButton } from '../header/AddButton';
import { ListHeaderRight } from '../header/ListHeaderRight';
import { useUpdatedListTitle } from '../hooks/useUpdateListTitle';
import { ConfirmModal, ConfirmModalProps } from '../modals/ConfirmModal';
import { ItemTile, ItemTileViewingMode } from '../tiles/ItemTile';

import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_ITEMS_LIST,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import {
  ListName,
  addAllToShoppingCart,
  currentStoreSelector,
  itemsListSelector,
  listToDisplaySelector,
  removeItemsListItems,
  resetListToDisplay,
  setFilters,
  setSortOrder,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import { Item, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { getKeyToUse, joinWithAnd } from '@/utils/helpers';

type ItemsListProps = object;

const itemsListSortTypes = [
  SortType.Name,
  SortType.Upc,
  SortType.AddedDate,
  SortType.LastUpdatedDate,
  SortType.Frequency,
] as SortType[];

const listName: ListName = ListName.ItemsList;
export function ItemsList(props: ItemsListProps) {
  const navigation = useNavigation();
  const itemsList = useSelector(itemsListSelector);
  const itemsListToDisplay = useSelector(
    listToDisplaySelector(listName),
  ) as Item[];
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlashList<Item> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {} as ConfirmModalProps,
  );
  const [viewingMode, setViewingMode] = useState(ItemTileViewingMode.Full);
  const lastSortTypeRef = useRef(itemsListSortTypes[0]);
  const menuRef = useRef<Menu>(null);
  useUpdatedListTitle({ list: itemsList, title: 'Items List' });

  const resetConfirmModalProps = useCallback(() => {
    setConfirmModalProps({ isVisible: false });
  }, []);

  const closeMenu = useCallback(() => {
    menuRef.current?.close();
  }, [menuRef]);

  function onAddItemPress() {
    closeMenu();
    navigation.navigate(Routes.ItemModal, {
      showBlank: true,
      key: { upc: EMPTY_STRING, name: EMPTY_STRING },
    });
  }

  const resetMultiSelectionMode = useCallback(() => {
    setIsMultiSelectMode(false);
    setSelectedItems([]);
  }, []);

  const onAddAllToShoppingPress = useCallback(() => {
    dispatch(addAllToShoppingCart(selectedItems));
    resetMultiSelectionMode();
  }, [selectedItems, resetMultiSelectionMode]);

  const onSortPress = useCallback(() => {
    setIsSortModalOpen(true);
  }, []);

  const onFilterPress = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  const onDeleteSelectedPress = useCallback(() => {
    setConfirmModalProps({
      isVisible: true,
      title: 'Deleting Items',
      message: `Are you sure you want to delete ${joinWithAnd(selectedItems.map((item) => `'${item.name || item.upc}'`))}?`,
      onCancel: () => resetConfirmModalProps(),
      onConfirm: () => {
        dispatch(removeItemsListItems(selectedItems));
        resetMultiSelectionMode();
        resetConfirmModalProps();
      },
    });
  }, [selectedItems, resetMultiSelectionMode]);

  const onResetPress = useCallback(() => {
    dispatch(resetListToDisplay({ listName }));
    setSelectedItems([]);
    setIsMultiSelectMode(false);
  }, []);

  const onSortTypeChange = useCallback((sortType: SortType) => {
    lastSortTypeRef.current = sortType;
    dispatch(setSortOrder({ listName, sortBy: sortType }));
  }, []);

  const onToggleViewingModePress = useCallback(() => {
    setViewingMode((current) => {
      return current === ItemTileViewingMode.Basic
        ? ItemTileViewingMode.Full
        : ItemTileViewingMode.Basic;
    });
  }, []);

  const onFilterValueChange = useCallback(
    (filters: ListFilterFilters<Item>) => {
      dispatch(setFilters({ listName, filters }));
    },
    [listName],
  );

  const onSwipeRight = useCallback(
    (key: Key) => {
      closeMenu();
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
    },
    [closeMenu],
  );

  const onSwipeLeft = useCallback(
    (item: Item) => {
      const keyToDisplay = item?.name || item?.upc;
      const isUpc = !item.name;
      const isUpcMessagePart = isUpc ? `the item with the upc of ` : '';

      closeMenu();
      setConfirmModalProps({
        isVisible: true,
        title: 'Delete Item',
        message: `Are you sure you want to delete ${isUpcMessagePart}'${keyToDisplay}'?`,
        onCancel: () => resetConfirmModalProps(),
        onConfirm: () => {
          dispatch(removeItemsListItems([item]));
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          resetConfirmModalProps();
        },
      });
    },
    [listRef, closeMenu],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          onSortPress={onSortPress}
          onFilterPress={onFilterPress}
          onResetPress={onResetPress}
          listName={listName}
          options={[
            selectedItems.length > 0
              ? {
                  text: 'Add Selected to Shopping List',
                  onPress: onAddAllToShoppingPress,
                }
              : undefined,
            selectedItems.length > 0
              ? {
                  text: 'Delete Selected Items',
                  onPress: onDeleteSelectedPress,
                }
              : undefined,
            {
              text: 'Toggle Viewing Mode',
              onPress: onToggleViewingModePress,
            },
          ]}
        />
      ),
      headerLeft: () => <AddButton onPress={onAddItemPress} />,
    });
  }, [navigation, isMultiSelectMode, selectedItems]);

  useFocusEffect(() => {
    closeMenu();
  });

  function renderItem({ item, index }: ListRow<Item>) {
    const key = {
      name: item.name,
      upc: item.upc,
    } as Key;
    return (
      <SwipeableRow
        swipeableProps={{
          onBegan: closeMenu,
        }}
        leftSwipe={{
          title: (
            <Stack paddingRight={theme.space[2]} alignItems="center">
              <FontAwesome
                name="trash"
                color={theme.colors.white}
                size={theme.sizes[8]}
              />
            </Stack>
          ),
          backgroundColor: theme.colors.red[900],
          onPress: onSwipeLeft.bind(null, item),
        }}
        rightSwipe={{
          backgroundColor: theme.colors.primary[900],
          onPress: onSwipeRight.bind(null, key),
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
              <Text color={theme.colors.white}>Shopping List</Text>
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
        <ItemTile
          listName={listName}
          isMultiSelectMode={isMultiSelectMode}
          item={item}
          viewingMode={viewingMode}
          buttonProps={{
            onLongPress: () => {
              setSelectedItems(isMultiSelectMode ? [] : [item]);
              setIsMultiSelectMode((current) => !current);
            },
          }}
          onSelect={(item) => {
            const isSelected = !!selectedItems.find(
              (itemLocal) => getKeyToUse(item) === getKeyToUse(itemLocal),
            );
            if (isSelected) {
              setSelectedItems((current) =>
                current.filter(
                  (itemLocal) => getKeyToUse(item) !== getKeyToUse(itemLocal),
                ),
              );
            } else {
              setSelectedItems((current) => {
                return [...current, item];
              });
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
        onTouchStart={closeMenu}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        data={itemsListToDisplay}
        renderItem={renderItem}
        keyExtractor={(item: Item, index: number) => getKeyToUse(item)}
        estimatedItemSize={ESTIMATED_SIZE_FOR_ITEMS_LIST}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
      <ListSorter
        sortOrderValue={itemsList.sortOrderValue}
        listName={listName}
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onValueChange={onSortTypeChange}
        sortTypes={itemsListSortTypes}
        viewSize="small"
      />
      <ListFilter
        list={itemsList}
        listName={listName}
        filterNames={['name', 'upc']}
        isVisible={isFilterModalOpen}
        setIsVisible={setIsFilterModalOpen}
        onValueChange={onFilterValueChange}
      />
      <ConfirmModal {...confirmModalProps} />
    </>
  );
}

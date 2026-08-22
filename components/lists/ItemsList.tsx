import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from 'expo-router';
import { Text, useTheme, Stack, useToast } from 'native-base';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import { ListActionToast } from './ListActionToast';
import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';
import { SortType } from './sorters';
import { AlphabeticalScroll } from '../AlphabeticalScroll';
import FilterListInput from '../FilterListInput';
import { AddButton } from '../header/AddButton';
import { ListHeaderRight } from '../header/ListHeaderRight';
import { useMenu } from '../hooks/useMenu';
import { useUpdatedListTitle } from '../hooks/useUpdateListTitle';
import { ConfirmModal, ConfirmModalProps } from '../modals/ConfirmModal';
import { ItemTile, ItemTileViewingMode } from '../tiles/ItemTile';

import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_ITEMS_LIST,
  FORM_INTER_ITEM_SPACING,
  LIST_HAPTICS,
  SORT_ORDER_VALUE_BY_NAME_DEFAULT,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import {
  addAllToShoppingCart,
  currentStoreSelector,
  itemsListSelector,
  removeItemsListItems,
  resetListToDisplay,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { deleteItems } from '@/state/thunks';
import { Item, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { ListName } from '@/types/listSlice';
import {
  getKeyToUse,
  getNewViewingMode,
  joinWithAnd,
  resetConfirmModalProps,
} from '@/utils/helpers';

type ItemsListProps = object;

const listName: ListName = ListName.ItemsList;
export function ItemsList(props: ItemsListProps) {
  const navigation = useNavigation();
  const itemsList = useAppSelector(itemsListSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const theme = useTheme();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const listRef = useRef<FlashList<Item> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [itemsListToDisplay, setItemsListToDisplay] = useState(itemsList.data);
  const [sortOrderValue, setSortOrderValue] = useState(
    SORT_ORDER_VALUE_BY_NAME_DEFAULT,
  );
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {} as ConfirmModalProps,
  );
  const [viewingMode, setViewingMode] = useState(ItemTileViewingMode.Full);
  useUpdatedListTitle({ list: itemsList, title: 'Items List' });

  const iconSize = useMemo(() => {
    return theme.sizes[viewingMode === ItemTileViewingMode.Basic ? 4 : 8];
  }, [viewingMode]);

  const [, closeMenu] = useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          onResetPress={onResetPress}
          options={[
            selectedItems.length > 0
              ? {
                  text: 'Add Selected to Shopping List',
                  onPress: onAddAllToShoppingPress,
                }
              : undefined,
            selectedItems.length > 0
              ? {
                  text: 'Delete Selected',
                  onPress: onDeleteSelectedPress,
                }
              : undefined,
            {
              text: 'Toggle Mode',
              onPress: onToggleViewingModePress,
            },
          ]}
        />
      ),
      headerLeft: () => <AddButton onPress={onAddItemPress} />,
    }),
  });

  const onAddItemPress = useCallback(() => {
    closeMenu();
    // @ts-ignore
    navigation.navigate(Routes.ItemModal, {
      showBlank: true,
      key: { upc: EMPTY_STRING, name: EMPTY_STRING },
      callerList: listName,
    });
  }, [closeMenu]);

  const onResetPress = useCallback(() => {
    dispatch(resetListToDisplay({ listName }));
    setSelectedItems([]);
    setIsMultiSelectMode(false);
  }, []);

  const resetMultiSelectionMode = useCallback(() => {
    setIsMultiSelectMode(false);
    setSelectedItems([]);
  }, []);

  const onAddAllToShoppingPress = useCallback(() => {
    const itemsAdded = [...selectedItems];
    dispatch(addAllToShoppingCart(itemsAdded));
    resetMultiSelectionMode();
    toast.closeAll();
    toast.show({
      id: 'items-list-add-all-to-shopping',
      placement: 'bottom',
      duration: 4000,
      render: () => (
        <ListActionToast
          message={`${itemsAdded.length} item${itemsAdded.length === 1 ? '' : 's'} added to Shopping List.`}
          onUndo={() => {
            for (const item of itemsAdded) {
              dispatch(
                updateStoreSpecificValues({
                  key: item,
                  storeSpecificValuesToUpdate: {
                    quantity: (currentQuantity: number) =>
                      Math.max(currentQuantity - 1, 0),
                  },
                }),
              );
            }
            toast.closeAll();
          }}
        />
      ),
    });
  }, [selectedItems, resetMultiSelectionMode, dispatch, toast]);

  const onDeleteSelectedPress = useCallback(() => {
    setConfirmModalProps({
      isVisible: true,
      title: 'Deleting Items',
      message: `Are you sure you want to delete ${joinWithAnd(selectedItems.map((item) => `'${item.name || item.upc}'`))}?`,
      onCancel: () => resetConfirmModalProps(setConfirmModalProps),
      onConfirm: () => {
        const itemsDeleted = [...selectedItems];
        dispatch(
          deleteItems({
            items: itemsDeleted,
          }),
        );
        resetMultiSelectionMode();
        resetConfirmModalProps(setConfirmModalProps);
        toast.closeAll();
        toast.show({
          id: 'items-list-delete',
          placement: 'bottom',
          duration: 4000,
          render: () => (
            <ListActionToast
              message={`${itemsDeleted.length} item${itemsDeleted.length === 1 ? '' : 's'} deleted.`}
            />
          ),
        });
      },
    });
  }, [selectedItems, resetMultiSelectionMode, dispatch, toast]);

  const onToggleViewingModePress = useCallback(() => {
    setViewingMode((current) => getNewViewingMode(current));
  }, []);

  const onSwipeRight = useCallback(
    (key: Key) => {
      closeMenu();
      setRefreshing(false);
      LIST_HAPTICS.handleSwipeItem()();
      dispatch(
        updateStoreSpecificValues({
          key,
          storeSpecificValuesToUpdate: {
            quantity: (currentQuantity: number) =>
              currentQuantity > 0 ? currentQuantity + 1 : 1,
          },
        }),
      );
      toast.closeAll();
      toast.show({
        id: 'items-list-add-to-shopping',
        placement: 'bottom',
        duration: 4000,
        render: () => (
          <ListActionToast
            message={`'${key.name || key.upc || 'Item'}' added to Shopping List.`}
            onUndo={() => {
              dispatch(
                updateStoreSpecificValues({
                  key,
                  storeSpecificValuesToUpdate: {
                    quantity: (currentQuantity: number) =>
                      Math.max(currentQuantity - 1, 0),
                  },
                }),
              );
              toast.closeAll();
            }}
          />
        ),
      });
    },
    [closeMenu, dispatch, toast],
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
        confirmButton: {
          text: 'Yes',
          colorScheme: 'danger',
        },
        cancelButton: {
          colorScheme: 'success',
        },
        onCancel: () => resetConfirmModalProps(setConfirmModalProps),
        onConfirm: () => {
          LIST_HAPTICS.handleSwipeItem(true)();
          dispatch(
            deleteItems({
              items: [item],
            }),
          );
          dispatch(removeItemsListItems([item]));
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          resetConfirmModalProps(setConfirmModalProps);
          toast.closeAll();
          toast.show({
            id: 'items-list-delete',
            placement: 'bottom',
            duration: 4000,
            render: () => (
              <ListActionToast
                message={`'${keyToDisplay || 'Item'}' deleted.`}
              />
            ),
          });
        },
      });
    },
    [listRef, closeMenu, dispatch, toast],
  );

  function renderItem({ item, index }: ListRow<Item>) {
    return (
      <SwipeableRow
        key={getKeyToUse(item)}
        swipeableProps={{
          onBegan: closeMenu,
        }}
        leftSwipe={{
          title: (
            <Stack paddingRight={theme.space[2]} alignItems="center">
              <FontAwesome
                name="trash"
                color={theme.colors.white}
                size={iconSize}
              />
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
              LIST_HAPTICS.handleMultipleItemSelect(isMultiSelectMode)();
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
        list={itemsList.data}
        onFilterChange={(filteredValues, _, sortOrderValue) => {
          setItemsListToDisplay(filteredValues);
          setSortOrderValue(sortOrderValue);
        }}
        sortTypes={Object.values(SortType).filter(
          (sortType) =>
            sortType === SortType.AddedDate ||
            sortType === SortType.Frequency ||
            sortType === SortType.LastUpdatedDate ||
            sortType === SortType.Name ||
            sortType === SortType.Upc,
        )}
        swapElementOrder
      />
      <FlashList
        ref={listRef}
        keyboardShouldPersistTaps="always"
        refreshing={refreshing}
        extraData={{ viewingMode, isMultiSelectMode }}
        onTouchStart={closeMenu}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        data={itemsListToDisplay}
        renderItem={renderItem}
        keyExtractor={(item: Item, index: number) =>
          item._id || getKeyToUse(item)
        }
        estimatedItemSize={ESTIMATED_SIZE_FOR_ITEMS_LIST}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
      <ConfirmModal {...confirmModalProps} />
      {sortOrderValue.sortBy === SortType.Name ? (
        <AlphabeticalScroll
          items={itemsListToDisplay}
          onCharPress={(index) => {
            if (listRef?.current) {
              listRef.current.scrollToIndex({ animated: false, index });
            }
          }}
          sortOrderValue={sortOrderValue}
        />
      ) : null}
    </>
  );
}

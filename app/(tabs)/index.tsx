import { useNavigation } from 'expo-router';
import { useTheme } from 'native-base';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useWindowDimensions } from 'react-native';
import { Menu } from 'react-native-popup-menu';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

import { AddButton } from '@/components/header/AddButton';
import {
  ListHeaderRight,
  ListHeaderRightOptions,
} from '@/components/header/ListHeaderRight';
import { useGpsCoordinate } from '@/components/hooks/useGeoLocation';
import { useInitializer } from '@/components/hooks/useInitializer';
import { InCartList } from '@/components/lists/InCartList';
import { ListSorter } from '@/components/lists/ListSorter';
import { PreviouslyPurchasedList } from '@/components/lists/PreviouslyPurchasedList';
import {
  ShoppingList,
  shoppingListSortTypes,
} from '@/components/lists/ShoppingLIst';
import { SortType } from '@/components/lists/sorters';
import {
  ConfirmModal,
  ConfirmModalProps,
} from '@/components/modals/ConfirmModal';
import { ItemTileViewingMode } from '@/components/tiles/ItemTile';
import { EMPTY_STRING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import {
  ListName,
  currentStoreSelector,
  inCartListSelector,
  moveAllToInCart,
  moveSelectedToCart,
  moveSelectedToShopping,
  resetListToDisplay,
  selectedItemsFromInCartSelector,
  selectedItemsFromShoppingCartSelector,
  setCurrentLocation,
  setSortOrder,
  shoppingListSelector,
  storeSpecificListSelector,
  setIsMultiSelectModeForInCartCart,
  setIsMultiSelectModeForShoppingCart,
  clearShopping,
  selectedItemsFromPreviouslyPurchasedSelector,
  moveSelectedPreviouslyPurchasedItemsToShopping,
  setIsMultiSelectModeForPreviouslyPurchased,
  previouslyPurchasedListSelector,
  resetSelectedItemsInShopping,
  removeShoppingListItems,
  addAllToShoppingCart,
  itemsPurchasedAtStoreSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { savePurchase } from '@/state/thunks';
import { getNewViewingMode, resetConfirmModalProps } from '@/utils/helpers';

export default function TabOneScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate));
    },
  });
  useInitializer();
  const layout = useWindowDimensions();
  const shoppingList = useAppSelector(shoppingListSelector);
  const inCartList = useAppSelector(inCartListSelector);
  const itemsPurchasedAtStore = useAppSelector(itemsPurchasedAtStoreSelector);
  const previouslyPurchasedList = useAppSelector(
    previouslyPurchasedListSelector,
  );
  const currentStore = useAppSelector(currentStoreSelector);
  const shoppingListItems = useAppSelector(
    storeSpecificListSelector(ListName.ShoppingList),
  );
  const inCartListItems = useAppSelector(
    storeSpecificListSelector(ListName.InCartList),
  );
  const selectedShoppingCartItems = useAppSelector(
    selectedItemsFromShoppingCartSelector,
  );
  const selectedInCartItems = useAppSelector(selectedItemsFromInCartSelector);
  const selectedPreviouslyPurchasedItems = useAppSelector(
    selectedItemsFromPreviouslyPurchasedSelector,
  );

  const [viewingMode, setViewingMode] = useState(ItemTileViewingMode.Basic);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {},
  );
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const menuRef = useRef<Menu>(null);
  const navigation = useNavigation();

  const renderScene = useMemo(
    () =>
      SceneMap({
        first: () => <ShoppingList viewingMode={viewingMode} />,
        second: () => <InCartList viewingMode={viewingMode} />,
        third: () => <PreviouslyPurchasedList />,
      }),
    [viewingMode],
  );

  const listName = useMemo(() => {
    let listToReturn = ListName.ShoppingList;
    switch (index) {
      case 1:
        listToReturn = ListName.InCartList;
        break;
      case 2:
        listToReturn = ListName.PreviouslyPurchased;
        break;
    }
    return listToReturn;
  }, [index]);

  const firstTabTitle = useMemo(() => {
    const main = 'Need';
    if (shoppingListItems.length === 0 && inCartListItems.length === 0) {
      return main;
    }
    return shoppingListItems.length > 0
      ? `${main} (${shoppingListItems.length})`
      : `Finished`;
  }, [shoppingListItems.length, inCartListItems.length]);

  const secondTabTitle = useMemo(() => {
    const main = 'In Cart';
    if (shoppingListItems.length === 0 && inCartListItems.length === 0) {
      return main;
    }
    return inCartListItems.length > 0
      ? `${main} (${inCartListItems.length})`
      : `Cart Empty`;
  }, [shoppingListItems.length, inCartListItems.length]);

  const thirdTabTitle = useMemo(() => {
    const main = 'Previously Purchased';
    return main;
  }, []);

  const routes = useMemo(
    () => [
      {
        key: 'first',
        title: firstTabTitle,
      },
      {
        key: 'second',
        title: secondTabTitle,
      },
      {
        key: 'third',
        title: thirdTabTitle,
      },
    ],
    [firstTabTitle, secondTabTitle, thirdTabTitle],
  );

  const onToggleViewingModePress = useCallback(() => {
    setViewingMode((current) => getNewViewingMode(current));
  }, []);

  const closeMenu = useCallback(() => {
    menuRef.current?.close();
  }, [menuRef]);

  const getMenuOptions = useCallback(() => {
    const options: ListHeaderRightOptions[] = [
      {
        text: 'Toggle Viewing Mode',
        onPress: onToggleViewingModePress,
      },
    ];
    if (index === 0) {
      if (selectedShoppingCartItems.length > 0) {
        options.push({
          onPress: onMoveSelectedToCartPress,
          text: 'Move Selected to Cart',
        });
        options.push({
          onPress: onRemoveSelectedPress,
          text: 'Remove Selected',
        });
      }
      options.push(
        ...[
          {
            onPress: onMoveAllCartPress,
            text: 'Move all to Cart',
          },
          {
            onPress: onClearAllPress,
            text: 'Clear all',
          },
        ],
      );
    } else if (index === 1) {
      if (selectedInCartItems.length > 0) {
        options.push({
          onPress: onMoveSelectedToShoppingPress,
          text: 'Move Selected to Shopping',
        });
      }
      options.push({
        onPress: onCompletePurchasePress,
        text: 'Mark all as Purchased',
      });
    } else if (index === 2) {
      if (selectedPreviouslyPurchasedItems.length > 0) {
        options.push({
          onPress: onMoveSelectedPreviouslyPurchasedToShoppingPress,
          text: 'Move Selected to Shopping',
        });
      }
      options.push({
        onPress: onMoveAllRecommendedToShoppingPress,
        text: 'Move All Recommended to Shopping',
      });
    }

    return options;
  }, [
    index,
    selectedInCartItems,
    selectedShoppingCartItems,
    selectedPreviouslyPurchasedItems,
  ]);

  const onAddItemPress = useCallback(() => {
    closeMenu();
    navigation.navigate(Routes.ItemModal, {
      showBlank: true,
      callerList: listName,
      key: { upc: EMPTY_STRING, name: EMPTY_STRING },
    });
  }, [closeMenu, listName]);

  const onClearAllPress = useCallback(() => {
    setConfirmModalProps({
      isVisible: true,
      message: 'Are you sure you want to clear the cart?',
      onCancel: () => resetConfirmModalProps(setConfirmModalProps),
      onConfirm: () => {
        dispatch(clearShopping());
        resetConfirmModalProps(setConfirmModalProps);
      },
    });
  }, []);

  const onCompletePurchasePress = useCallback(() => {
    dispatch(savePurchase());
  }, []);

  const onMoveAllRecommendedToShoppingPress = useCallback(() => {
    const recommended = itemsPurchasedAtStore.filter(
      (item) => item.isRecommended,
    );
    dispatch(addAllToShoppingCart(recommended));
  }, [itemsPurchasedAtStore]);

  const onMoveSelectedToCartPress = useCallback(() => {
    dispatch(moveSelectedToCart());
  }, []);

  const onMoveSelectedToShoppingPress = useCallback(() => {
    dispatch(moveSelectedToShopping());
  }, []);

  const onMoveSelectedPreviouslyPurchasedToShoppingPress = useCallback(() => {
    dispatch(moveSelectedPreviouslyPurchasedItemsToShopping());
  }, []);

  const onMoveAllCartPress = useCallback(() => {
    dispatch(moveAllToInCart());
  }, []);

  const onRemoveSelectedPress = useCallback(() => {
    dispatch(removeShoppingListItems(selectedShoppingCartItems));
  }, [selectedShoppingCartItems]);

  const onResetPress = useCallback(() => {
    dispatch(resetListToDisplay({ listName }));
  }, [listName]);

  const onSortPress = useCallback(() => {
    setIsSortModalOpen(true);
  }, []);

  const onSortTypeChange = useCallback(
    (sortType: SortType) => {
      dispatch(setSortOrder({ listName, sortBy: sortType }));
    },
    [listName],
  );

  useLayoutEffect(() => {
    if (index === 2) return;
    if (inCartListItems.length <= 0) {
      setIndex(0);
    } else if (shoppingListItems.length === 0) {
      setIndex(1);
    }
  }, [inCartListItems.length, shoppingListItems.length, index]);

  useEffect(() => {
    dispatch(setIsMultiSelectModeForInCartCart(false));
    dispatch(setIsMultiSelectModeForShoppingCart(false));
    dispatch(setIsMultiSelectModeForPreviouslyPurchased(false));
    dispatch(resetSelectedItemsInShopping());
  }, [index]);

  useEffect(() => {
    closeMenu();
    navigation.setOptions({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          onSortPress={onSortPress}
          onResetPress={onResetPress}
          options={getMenuOptions()}
        />
      ),
      headerLeft: () => <AddButton onPress={onAddItemPress} />,
      headerTitle: `Shopping (${currentStore.name})`,
    });
  }, [
    index,
    selectedShoppingCartItems.length,
    selectedInCartItems.length,
    currentStore.name,
    listName,
    getMenuOptions,
  ]);

  function renderTabBar(props: any) {
    return (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.colors.tertiary[100] }}
        style={{ backgroundColor: theme.colors.primary[900] }}
      />
    );
  }

  return (
    <>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
      <ListSorter
        sortOrderValue={
          index === 0
            ? shoppingList.sortOrderValue
            : index === 1
              ? inCartList.sortOrderValue
              : previouslyPurchasedList.sortOrderValue
        }
        listName={listName}
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onValueChange={onSortTypeChange}
        sortTypes={shoppingListSortTypes}
        viewSize="small"
      />
      <ConfirmModal {...confirmModalProps} />
    </>
  );
}

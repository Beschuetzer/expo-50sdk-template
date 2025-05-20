import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useTheme } from 'native-base';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useWindowDimensions, Share } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

import { AddButton } from '@/components/header/AddButton';
import {
  ListHeaderRight,
  ListHeaderRightOptions,
} from '@/components/header/ListHeaderRight';
import { useAutoLogin } from '@/components/hooks/useAutoLogin';
import { useAwakenBff } from '@/components/hooks/useAwakenBff';
import { useGpsCoordinate } from '@/components/hooks/useGeoLocation';
import { useInitializer } from '@/components/hooks/useInitializer';
import { useMenu } from '@/components/hooks/useMenu';
import { useNotificationsPermissions } from '@/components/hooks/useNotificationsPermissions';
import { InCartList } from '@/components/lists/InCartList';
import { PreviouslyPurchasedList } from '@/components/lists/PreviouslyPurchasedList';
import { ShoppingList } from '@/components/lists/ShoppingList';
import { getSorter, SortOrder, SortType } from '@/components/lists/sorters';
import {
  CompletePurchaseModal,
  CompletePurchaseModalItemToLocationMap,
} from '@/components/modals/CompletePurchaseModal';
import {
  ConfirmModal,
  ConfirmModalProps,
} from '@/components/modals/ConfirmModal';
import { StoreSelectionModal } from '@/components/modals/StoreSelectionModal';
import { ItemTileViewingMode } from '@/components/tiles/ItemTile';
import { EMPTY_STRING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { accountSelector, setError } from '@/state/slices/generalSlice';
import {
  currentStoreSelector,
  moveAllToInCart,
  moveSelectedToCart,
  moveSelectedToShopping,
  resetListToDisplay,
  selectedItemsFromInCartSelector,
  selectedItemsFromShoppingCartSelector,
  setCurrentLocation,
  storeSpecificListSelector,
  setIsMultiSelectModeForInCartCart,
  setIsMultiSelectModeForShoppingCart,
  clearShopping,
  selectedItemsFromPreviouslyPurchasedSelector,
  moveSelectedPreviouslyPurchasedItemsToShopping,
  setIsMultiSelectModeForPreviouslyPurchased,
  resetSelectedItemsInShopping,
  removeShoppingListItems,
  addAllToShoppingCart,
  itemsPurchasedAtStoreSelector,
  moveItemToAnotherCart,
  updateSelectedItemsFromShoppingCart,
  updateSelectedItemsFromInCart,
  processItemToLocationMap,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { getCurrentState, savePurchase } from '@/state/thunks';
import { StoreSpecificValueKey } from '@/types/Item';
import { Store } from '@/types/Store';
import { ListName } from '@/types/listSlice';
import {
  getKeyToUse,
  getNewViewingMode,
  getStoreDescriptor,
  resetConfirmModalProps,
} from '@/utils/helpers';

export default function TabOneScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate));
      dispatch(getCurrentState({ gpsCoordinate, showLoadingMsg: false }));
    },
  });
  useAwakenBff();
  useAutoLogin();
  useInitializer();
  useNotificationsPermissions();
  const layout = useWindowDimensions();
  const account = useAppSelector(accountSelector);
  const itemsPurchasedAtStore = useAppSelector(itemsPurchasedAtStoreSelector);
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
    {} as ConfirmModalProps,
  );
  const [isStoreSelectionModalVisible, setIsStoreSelectionModalVisible] =
    useState(false);
  const [index, setIndex] = useState(0);
  const [isCompletePurchaseModalVisible, setIsCompletePurchaseModalVisible] =
    useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [, closeMenu] = useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerRight: () => (
        <ListHeaderRight ref={menuRef} options={getMenuOptions()} />
      ),
      headerLeft: () => <AddButton onPress={onAddItemPress} />,
      headerTitle: `Shopping (${currentStore.name})`,
    }),
  });

  // Prepare a function to share the list.
  const onSharePress = useCallback(async () => {
    const currentStoreId = getKeyToUse(currentStore);
    const listContent = shoppingListItems
      .filter((item) => !!item.name)
      .sort(
        getSorter({
          sortType: SortType.AisleNumber,
          currentStoreId,
          sortOrder: SortOrder.Ascending,
        }),
      )
      .map((item) => {
        const base = `- ${item[StoreSpecificValueKey.Quantity]?.[currentStoreId] || 1} ${item.unit} of ${item.name}`;
        const link =
          item.images.length > 0 && item.imageToUseIndex != null
            ? ` - (${item.images[item.imageToUseIndex]})`
            : '';
        return `${base}${link}\n`;
      })
      .join('\n');
    const title = `Shopping List for '${getStoreDescriptor(currentStore)}'`;
    const message = `${title}:\n\n${listContent}`;

    try {
      await Share.share(
        {
          title,
          message,
        },
        {
          dialogTitle: title,
        },
      );
    } catch (error) {
      dispatch(setError(error as Error));
    }
  }, [shoppingListItems, currentStore]);

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

  const closeCompletePurchaseModal = useCallback(() => {
    setIsCompletePurchaseModalVisible(false);
  }, []);

  const onToggleViewingModePress = useCallback(() => {
    setViewingMode((current) => getNewViewingMode(current));
  }, []);

  const getMenuOptions = useCallback(() => {
    const options: ListHeaderRightOptions[] = [
      {
        text: 'Toggle Viewing Mode',
        onPress: onToggleViewingModePress,
      },
    ];
    if (index === 0) {
      options.push({
        text:
          selectedShoppingCartItems.length === shoppingListItems.length
            ? 'De-select All'
            : 'Select All',
        onPress:
          selectedShoppingCartItems.length === shoppingListItems.length
            ? onDeselectAllPress
            : onSelectAllPress,
      });
      if (selectedShoppingCartItems.length > 0) {
        options.push({
          onPress: onMoveSelectedToAnotherCartPress,
          text: 'Move Selected to Another Cart',
        });
        options.push({
          onPress: onMoveSelectedToCartPress,
          text: 'Move Selected to Cart',
        });
        options.push({
          onPress: onRemoveSelectedPress,
          text: 'Remove Selected',
        });
      }

      if (account._id && account.password) {
        options.push({
          onPress: onQuickAddPress,
          text: 'Quick Add',
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
          {
            text: 'Share Cart',
            onPress: onSharePress,
          },
        ],
      );
    } else if (index === 1) {
      options.push({
        text:
          selectedInCartItems.length === inCartListItems.length
            ? 'De-select All'
            : 'Select All',
        onPress:
          selectedInCartItems.length === inCartListItems.length
            ? onDeselectAllPress
            : onSelectAllPress,
      });
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
    shoppingListItems.length,
    inCartListItems.length,
    account,
  ]);

  const onAddItemPress = useCallback(() => {
    closeMenu();
    // @ts-ignore
    navigation.navigate(Routes.ItemModal, {
      showBlank: true,
      callerList: listName,
      key: { upc: EMPTY_STRING, name: EMPTY_STRING },
    });
  }, [closeMenu, listName]);

  const onClearAllPress = useCallback(() => {
    setConfirmModalProps({
      isVisible: true,
      title: 'Clear Cart',
      message: 'Are you sure you want to clear the cart?',
      onCancel: () => resetConfirmModalProps(setConfirmModalProps),
      onConfirm: () => {
        dispatch(clearShopping());
        resetConfirmModalProps(setConfirmModalProps);
      },
    });
  }, []);

  const onCompletePurchasePress = useCallback(() => {
    setIsCompletePurchaseModalVisible(true);
  }, []);

  const onCompletePurchaseModalConfirm = useCallback(
    (itemToLocationMap: CompletePurchaseModalItemToLocationMap) => {
      dispatch(savePurchase());
      dispatch(processItemToLocationMap({ itemToLocationMap }));
      closeCompletePurchaseModal();
    },
    [],
  );

  const onMoveAllRecommendedToShoppingPress = useCallback(() => {
    const recommended = itemsPurchasedAtStore.filter(
      (item) => item.isRecommended,
    );
    dispatch(addAllToShoppingCart(recommended));
  }, [itemsPurchasedAtStore]);

  const onMoveSelectedToAnotherCartPress = useCallback(() => {
    setIsStoreSelectionModalVisible(true);
  }, []);

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

  const onQuickAddPress = useCallback(() => {
    // @ts-ignore
    navigation.navigate(Routes.QuickAddModal);
  }, []);

  const onRemoveSelectedPress = useCallback(() => {
    dispatch(removeShoppingListItems(selectedShoppingCartItems));
  }, [selectedShoppingCartItems]);

  const onResetPress = useCallback(() => {
    dispatch(resetListToDisplay({ listName }));
  }, [listName]);

  const onDeselectAllPress = useCallback(() => {
    dispatch(resetSelectedItemsInShopping());
    if (index === 0) {
      dispatch(setIsMultiSelectModeForShoppingCart(false));
    } else if (index === 1) {
      dispatch(setIsMultiSelectModeForInCartCart(false));
    }
  }, [index]);

  const onSelectAllPress = useCallback(() => {
    if (index === 0) {
      dispatch(setIsMultiSelectModeForShoppingCart(true));
      for (const shoppingListItem of shoppingListItems) {
        dispatch(
          updateSelectedItemsFromShoppingCart({
            operation: 'add',
            item: shoppingListItem,
          }),
        );
      }
    }
    if (index === 1) {
      dispatch(setIsMultiSelectModeForInCartCart(true));
      for (const inCartItem of inCartListItems) {
        dispatch(
          updateSelectedItemsFromInCart({
            operation: 'add',
            item: inCartItem,
          }),
        );
      }
    }
  }, [index, inCartListItems, shoppingListItems]);

  const resetSelected = useCallback(() => {
    dispatch(setIsMultiSelectModeForInCartCart(false));
    dispatch(setIsMultiSelectModeForShoppingCart(false));
    dispatch(setIsMultiSelectModeForPreviouslyPurchased(false));
    dispatch(resetSelectedItemsInShopping());
  }, []);

  useFocusEffect(() => {
    if (isFocused) return;
    resetSelected();
  });

  useLayoutEffect(() => {
    if (index === 2) return;
    if (inCartListItems.length <= 0) {
      setIndex(0);
    } else if (shoppingListItems.length === 0) {
      setIndex(1);
    }
  }, [inCartListItems.length, shoppingListItems.length, index]);

  useEffect(() => {
    resetSelected();
  }, [index, resetSelected]);

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
      <StoreSelectionModal
        title="Move items to:"
        onCancel={() => setIsStoreSelectionModalVisible(false)}
        isVisible={isStoreSelectionModalVisible}
        onConfirm={(selectedStore: Store | null) => {
          setIsStoreSelectionModalVisible(false);
          if (selectedStore && selectedShoppingCartItems.length > 0) {
            for (const selectedItem of selectedShoppingCartItems) {
              dispatch(
                moveItemToAnotherCart({
                  store: selectedStore,
                  item: selectedItem,
                }),
              );
            }
          }
        }}
      />
      <ConfirmModal {...confirmModalProps} />
      <CompletePurchaseModal
        isVisible={isCompletePurchaseModalVisible}
        title="Select a Location for Each Item"
        onConfirm={onCompletePurchaseModalConfirm}
        onCancel={closeCompletePurchaseModal}
        onBlurPress={closeCompletePurchaseModal}
      />
    </>
  );
}

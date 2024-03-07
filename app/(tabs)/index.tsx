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
import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@/components/header/AddButton';
import { ListHeaderRight } from '@/components/header/ListHeaderRight';
import { useGpsCoordinate } from '@/components/hooks/useGeoLocation';
import { InCartList } from '@/components/lists/InCartList';
import { ListSorter } from '@/components/lists/ListSorter';
import {
  ShoppingList,
  shoppingListSortTypes,
} from '@/components/lists/ShoppingLIst';
import { SortType } from '@/components/lists/sorters';
import { EMPTY_STRING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import {
  ListName,
  completePurchase,
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
} from '@/state/slices/listsSlice';

const renderScene = SceneMap({
  first: () => <ShoppingList />,
  second: () => <InCartList />,
});

export default function TabOneScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate));
    },
  });
  const layout = useWindowDimensions();
  const shoppingList = useSelector(shoppingListSelector);
  const inCartList = useSelector(inCartListSelector);
  const currentStore = useSelector(currentStoreSelector);
  const shoppingListItems = useSelector(
    storeSpecificListSelector(ListName.ShoppingList),
  );
  const inCartListItems = useSelector(
    storeSpecificListSelector(ListName.InCartList),
  );
  const selectedShoppingCartItems = useSelector(
    selectedItemsFromShoppingCartSelector,
  );
  const selectedInCartItems = useSelector(selectedItemsFromInCartSelector);

  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const menuRef = useRef<Menu>(null);
  const navigation = useNavigation();
  const listName = useMemo(
    () => (index === 0 ? ListName.ShoppingList : ListName.InCartList),
    [index],
  );
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
    ],
    [firstTabTitle, secondTabTitle],
  );

  const closeMenu = useCallback(() => {
    menuRef.current?.close();
  }, [menuRef]);

  const onAddItemPress = useCallback(() => {
    closeMenu();
    navigation.navigate(Routes.ItemModal, {
      showBlank: true,
      callerList: listName,
      key: EMPTY_STRING,
    });
  }, [closeMenu]);

  const onClearAllPress = useCallback(() => {
    dispatch(clearShopping());
  }, []);

  const onCompletePurchasePress = useCallback(() => {
    dispatch(completePurchase());
  }, []);

  const onMoveSelectedToCartPress = useCallback(() => {
    dispatch(moveSelectedToCart());
  }, []);

  const onMoveSelectedToShoppingPress = useCallback(() => {
    dispatch(moveSelectedToShopping());
  }, []);

  const onMoveAllCartPress = useCallback(() => {
    dispatch(moveAllToInCart());
  }, []);

  const onResetPress = useCallback(() => {
    dispatch(resetListToDisplay({ listName }));
  }, []);

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
    if (inCartListItems.length <= 0) {
      setIndex(0);
    } else if (shoppingListItems.length === 0) {
      setIndex(1);
    }
  }, [inCartListItems.length]);

  useEffect(() => {
    dispatch(setIsMultiSelectModeForInCartCart(false));
    dispatch(setIsMultiSelectModeForShoppingCart(false));
  }, [index]);

  useEffect(() => {
    closeMenu();
    navigation.setOptions({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          onSortPress={onSortPress}
          onResetPress={onResetPress}
          listName={listName}
          options={[
            ...(index === 1
              ? [
                  selectedInCartItems.length > 0
                    ? {
                        onPress: onMoveSelectedToShoppingPress,
                        text: 'Move Selected to Shopping',
                      }
                    : undefined,
                  {
                    onPress: onCompletePurchasePress,
                    text: 'Mark all as Purchased',
                  },
                ]
              : [
                  selectedShoppingCartItems.length > 0
                    ? {
                        onPress: onMoveSelectedToCartPress,
                        text: 'Move Selected to Cart',
                      }
                    : undefined,
                  {
                    onPress: onMoveAllCartPress,
                    text: 'Move all to Cart',
                  },
                ]),
            {
              onPress: onClearAllPress,
              text: 'Clear all',
            },
          ]}
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
          index === 0 ? shoppingList.sortOrderValue : inCartList.sortOrderValue
        }
        listName={listName}
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onValueChange={onSortTypeChange}
        sortTypes={shoppingListSortTypes}
        viewSize="small"
      />
    </>
  );
}
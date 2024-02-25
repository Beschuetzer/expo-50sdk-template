import { FontAwesome } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useFocusEffect, useNavigation } from 'expo-router'
import { Text, useTheme, Stack } from 'native-base'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LayoutAnimation } from 'react-native'
import { Menu } from 'react-native-popup-menu'
import { useDispatch, useSelector } from 'react-redux'

import { ItemTile } from './ItemTile'
import { ListItemSeparator } from './ListItemSeparator'
import { ListSorter } from './ListSorter'
import { SwipeableRow } from './SwipeableRow'
import { SortType } from './sorters'
import { AddButton } from '../header/AddButton'
import { ListHeaderRight } from '../header/ListHeaderRight'

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general'
import { Routes } from '@/constants/navigation'
import {
  ListName,
  addItemToCart,
  currentStoreSelector,
  removeShoppingListItem,
  setSortOrder,
  storeSpecificListSelector,
  shoppingListSelector,
} from '@/state/slices/listsSlice'
import { ItemWithStoreSpecificValues, Key } from '@/types/Item'
import { ListRow } from '@/types/general'
import { getKeyToUse } from '@/utils/helpers'

type ShoppingListProps = object

const shoppingListSortTypes = [
  SortType.Name,
  SortType.Upc,
  SortType.AddedDate,
  SortType.LastUpdatedDate,
  SortType.Frequency,
] as SortType[]

const listName: ListName = ListName.ShoppingList
export function ShoppingList(props: ShoppingListProps) {
  const navigation = useNavigation()
  const shoppingList = useSelector(shoppingListSelector)
  const shoppingListToDisplay = useSelector(storeSpecificListSelector(listName))
  const currentStore = useSelector(currentStoreSelector)
  const theme = useTheme()
  const dispatch = useDispatch()
  const listRef = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const lastSortTypeRef = useRef(shoppingListSortTypes[0])
  const menuRef = useRef<Menu>(null)

  const closeMenu = useCallback(() => {
    menuRef.current?.close()
  }, [menuRef])

  function onAddItemPress() {
    closeMenu()
    navigation.navigate(Routes.ItemModal, {
      showBlank: true,
      callerList: ListName.ShoppingList,
      key: EMPTY_STRING,
    })
  }

  const onSortPress = useCallback(() => {
    setIsSortModalOpen(true)
  }, [])

  const onSortTypeChange = useCallback((sortType: SortType) => {
    lastSortTypeRef.current = sortType
    dispatch(setSortOrder({ listName, sortBy: sortType }))
  }, [])

  const onSwipeRight = useCallback(
    (item: ItemWithStoreSpecificValues) => {
      closeMenu()
      setRefreshing(false)
      dispatch(addItemToCart(item))
    },
    [closeMenu],
  )

  const onSwipeLeft = useCallback(
    (key: Key) => {
      closeMenu()
      dispatch(removeShoppingListItem(key))
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    },
    [listRef, closeMenu],
  )

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          onSortPress={onSortPress}
          listName={listName}
        />
      ),
      headerLeft: () => <AddButton onPress={onAddItemPress} />,
    })
  }, [navigation])

  useFocusEffect(() => {
    closeMenu()
  })

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    const key = {
      name: item.name,
      upc: item.upc,
    } as Key
    return (
      <SwipeableRow
        swipeableProps={{
          onBegan: closeMenu,
        }}
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
    )
  }

  return (
    <>
      <FlashList
        ref={listRef}
        refreshing={refreshing}
        onTouchStart={closeMenu}
        onRefresh={() => {
          setRefreshing(true)
          setTimeout(() => {
            setRefreshing(false)
          }, 2000)
        }}
        data={shoppingListToDisplay}
        renderItem={renderItem}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          getKeyToUse(item)
        }
        estimatedItemSize={120}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
      <ListSorter
        sortOrderValue={shoppingList.sortOrderValue}
        listName={listName}
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onValueChange={onSortTypeChange}
        sortTypes={shoppingListSortTypes}
        viewSize="small"
      />
    </>
  )
}

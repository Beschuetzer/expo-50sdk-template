import { FontAwesome } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useFocusEffect, useNavigation } from 'expo-router'
import { Text, useTheme, Stack, Heading } from 'native-base'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LayoutAnimation } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Menu } from 'react-native-popup-menu'
import { useDispatch, useSelector } from 'react-redux'

import { ItemTile } from './ItemTile'
import { ListFilter, ListFilterFilters } from './ListFilter'
import { ListItemSeparator } from './ListItemSeparator'
import { ListSorter } from './ListSorter'
import { SwipeableRow } from './SwipeableRow'
import { SortType } from './sorters'
import { AddButton } from '../header/AddButton'
import { ListHeaderRight } from '../header/ListHeaderRight'
import { useUpdatedListTitle } from '../hooks/useUpdateListTitle'

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general'
import { Routes } from '@/constants/navigation'
import {
  ListName,
  currentStoreSelector,
  removeShoppingListItem,
  setFilters,
  setSortOrder,
  shoppingListItemsSelector,
  shoppingListSelector,
} from '@/state/slices/listsSlice'
import { Item, Key } from '@/types/Item'
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
  const shoppingListToDisplay = useSelector(shoppingListItemsSelector) as Item[]
  const currentStore = useSelector(currentStoreSelector)
  const theme = useTheme()
  const dispatch = useDispatch()
  const listRef = useRef<FlashList<Item> | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [itemsInCart, setItemsInCart] = useState<Item[]>([])
  const lastSortTypeRef = useRef(shoppingListSortTypes[0])
  const menuRef = useRef<Menu>(null)
  useUpdatedListTitle({
    list: shoppingList,
    title: `Shopping List for ${currentStore.name}`,
  })

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

  const onFilterPress = useCallback(() => {
    setIsFilterModalOpen(true)
  }, [])

  const onSortTypeChange = useCallback((sortType: SortType) => {
    lastSortTypeRef.current = sortType
    dispatch(setSortOrder({ listName, sortBy: sortType }))
  }, [])

  const onFilterValueChange = useCallback(
    (filters: ListFilterFilters<Item>) => {
      dispatch(setFilters({ listName, filters }))
    },
    [listName],
  )

  const onSwipeRight = useCallback(
    (item: Item) => {
      closeMenu()
      setRefreshing(false)
      setItemsInCart((current) => [...current, item])
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
          onFilterPress={onFilterPress}
          listName={listName}
        />
      ),
      headerLeft: () => <AddButton onPress={onAddItemPress} />,
    })
  }, [navigation])

  useFocusEffect(() => {
    closeMenu()
  })

  function renderItem({ item, index }: ListRow<Item>) {
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
        ListHeaderComponent={
          <Stack backgroundColor={theme.colors.white} justifyContent={'center'}>
            <Heading marginLeft={'auto'} marginRight={'auto'}>In Cart</Heading>
            <FlatList
              data={itemsInCart}
              renderItem={(itemToRender) => {
                const { item } = itemToRender
                return <ItemTile item={item} />
              }}
              ItemSeparatorComponent={() => <ListItemSeparator />}
            />
            <Heading>Shopping List</Heading>
          </Stack>
        }
        data={shoppingListToDisplay}
        renderItem={renderItem}
        keyExtractor={(item: Item, index: number) => getKeyToUse(item)}
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
      <ListFilter
        list={shoppingList}
        listName={listName}
        filterNames={['name', 'upc']}
        isVisible={isFilterModalOpen}
        setIsVisible={setIsFilterModalOpen}
        onValueChange={onFilterValueChange}
      />
    </>
  )
}

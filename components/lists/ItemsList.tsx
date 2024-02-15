import { FontAwesome } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useNavigation } from 'expo-router'
import { View, Text, useTheme, Stack } from 'native-base'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LayoutAnimation, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu'
import { useDispatch, useSelector } from 'react-redux'

import { ItemTile } from './ItemTile'
import { ListSorter } from './ListSorter'
import { SwipeableRow } from './SwipeableRow'
import { SORTERS, SortType } from './sorters'

import { FORM_INTER_ITEM_SPACING } from '@/constants/general'
import { Routes } from '@/constants/navigation'
import {
  currentStoreSelector,
  itemsListSelector,
  removeItemsListItem,
  setItemsList,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice'
import { ItemWithStoreSpecificValues, Key } from '@/types/Item'
import { ListRow } from '@/types/general'
import { getKeyToUse } from '@/utils/helpers'

type ItemsListProps = object

const itemsListSortTypes = [
  SortType.Name,
  SortType.Upc,
  SortType.DateAdded,
  SortType.DateLastUpdated,
  SortType.Frequency,
] as SortType[]

const { SlideInMenu } = renderers;

export function ItemsList(props: ItemsListProps) {
  const navigation = useNavigation()
  const itemsList = useSelector(itemsListSelector)
  const currentStore = useSelector(currentStoreSelector)
  const theme = useTheme()
  const dispatch = useDispatch()
  const list = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const shouldSortOnMountRef = useRef(true)
  const lastItemsListLengthRef = useRef(itemsList.length)
  const lastSortTypeRef = useRef(itemsListSortTypes[0])

  function onAddItemPress() {
    navigation.navigate(Routes.ItemModal)
  }

  const onSortPress = useCallback(() => {
    setIsSortModalOpen(true)
  }, [])

  const onSortTypeChange = useCallback(
    (sortType: SortType) => {
      lastSortTypeRef.current = sortType
      const sortedList = [...itemsList]
      sortedList.sort(SORTERS[sortType])
      dispatch(setItemsList(sortedList))
    },
    [itemsList],
  )

  function onSwipeRight(key: Key) {
    setRefreshing(false)
    dispatch(
      updateStoreSpecificValues({
        key,
        storeSpecificValuesToUpdate: {
          quantity: (currentQuantity: number) =>
            currentQuantity > 0 ? currentQuantity + 1 : 1,
        },
      }),
    )
  }

  function onSwipeLeft(key: Key) {
    dispatch(removeItemsListItem(key))
    list.current?.prepareForLayoutAnimationRender()
    // after removing the item, we start animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu renderer={SlideInMenu}>
          <MenuTrigger
            children={
              <View pr={theme.space[1]}>
                <View pl={theme.space[1]}>
                  <FontAwesome
                    name="ellipsis-v"
                    size={20}
                    color={theme.colors.black}
                  />
                </View>
              </View>
            }
          />
          <MenuOptions
            customStyles={{
              optionsContainer: { backgroundColor: theme.colors.black },
            }}
          >
            <MenuOption
              customStyles={{
                optionText: {
                  color: theme.colors.white,
                  fontWeight: '300',
                  fontSize: 20,
                  textAlign: 'center',
                },
              }}
              onSelect={onSortPress}
              text="Sort"
            />
          </MenuOptions>
        </Menu>
      ),
      headerLeft: () => (
        <View ml={theme.space[1]}>
          <TouchableOpacity onPress={onAddItemPress}>
            <FontAwesome name="plus" size={20} color={theme.colors.black} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation])

  useEffect(() => {
    if (itemsList.length === lastItemsListLengthRef.current) return
    shouldSortOnMountRef.current = true
  }, [itemsList])

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    const key = {
      name: item.name,
      upc: item.upc,
    } as Key
    return (
      <SwipeableRow
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
          onPress: onSwipeLeft.bind(null, key),
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
        <ItemTile itemWithStoreSpecificValues={item} />
      </SwipeableRow>
    )
  }

  return (
    <>
      <FlashList
        ref={list}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          setTimeout(() => {
            setRefreshing(false)
          }, 2000)
        }}
        data={itemsList}
        renderItem={renderItem}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          getKeyToUse(item)
        }
        estimatedItemSize={120}
        ItemSeparatorComponent={() => (
          <View
            height={StyleSheet.hairlineWidth}
            backgroundColor={theme.colors.gray[500]}
          />
        )}
      />
      <ListSorter
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onMount={() => {
          if (!shouldSortOnMountRef.current) return
          shouldSortOnMountRef.current = false
          onSortTypeChange(lastSortTypeRef.current)
        }}
        onValueChange={onSortTypeChange}
        sortTypes={itemsListSortTypes}
        viewSize="small"
      />
    </>
  )
}

import { FontAwesome } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useFocusEffect, useNavigation } from 'expo-router'
import { useTheme, Row, View, Stack, Text } from 'native-base'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LayoutAnimation, StyleSheet } from 'react-native'
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler'
import { Menu } from 'react-native-popup-menu'
import { useSelector, useDispatch } from 'react-redux'

import { ListFilter, ListFilterFilters } from './ListFilter'
import { ListSorter } from './ListSorter'
import { SwipeableRow } from './SwipeableRow'
import { SortType } from './sorters'
import { AddButton } from '../header/AddButton'
import { ListHeaderRight } from '../header/ListHeaderRight'

import { FORM_INTER_ITEM_SPACING, EMPTY_STRING } from '@/constants/general'
import { Routes } from '@/constants/navigation'
import {
  ListName,
  currentStoreSelector,
  filterSelector,
  removeStoresListItem,
  setCurrentStoreName,
  setFilters,
  sortList,
  sortOrderSelector,
  storesListSelector,
} from '@/state/slices/listsSlice'
import { Key } from '@/types/Item'
import { Store } from '@/types/Store'
import { ListRow } from '@/types/general'
import { getFilteredList, getKeyToUse } from '@/utils/helpers'

const storesListSortTypes = [SortType.Name, SortType.Distance] as SortType[]

const listName: ListName = ListName.StoresList
export function StoresList() {
  const navigation = useNavigation()
  const storesList = useSelector(storesListSelector)
  const filtersFound = useSelector(filterSelector(listName))
  const currentStore = useSelector(currentStoreSelector)
  const sortOrderValue = useSelector(sortOrderSelector(listName))
  const theme = useTheme()
  const dispatch = useDispatch()
  const listRef = useRef<FlashList<Store> | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [listKey, setListKey] = useState(0)
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [listToDisplay, setListToDisplay] = useState(storesList)
  const shouldSortOnMountRef = useRef(true)
  const lastStoresListLengthRef = useRef(storesList.length)
  const lastSortTypeRef = useRef(storesListSortTypes[0])
  const menuRef = useRef<Menu>(null)

  const closeMenu = useCallback(() => {
    menuRef.current?.close()
  }, [menuRef])

  function onAddStorePress() {
    closeMenu()
    navigation.navigate(Routes.StoreModal)
  }

  const onSortPress = useCallback(() => {
    setIsSortModalOpen(true)
  }, [])

  const onFilterPress = useCallback(() => {
    setIsFilterModalOpen(true)
  }, [])

  const onSortTypeChange = useCallback(
    (sortType: SortType) => {
      lastSortTypeRef.current = sortType
      dispatch(sortList({ listName, sortBy: sortType }))
    },
    [storesList],
  )

  const onFilterValueChange = useCallback(
    (filters: ListFilterFilters<Store>) => {
      dispatch(setFilters({ listName, filters }))
      const filteredList = getFilteredList<Store>(storesList, filters)
      setListToDisplay(filteredList)
    },
    [storesList],
  )

  const onSwipeRight = useCallback(
    (key: Key) => {
      closeMenu()
      dispatch(setCurrentStoreName(key?.name))
    },
    [closeMenu],
  )

  const onSwipeLeft = useCallback(
    (keyToUse: Key) => {
      closeMenu()
      dispatch(removeStoresListItem(keyToUse))
      listRef.current?.prepareForLayoutAnimationRender()
      // after removing the item, we start animation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    },
    [listRef, closeMenu],
  )

  useEffect(() => {
    setListKey((current) => current + 1)
  }, [currentStore])

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
      headerLeft: () => <AddButton onPress={onAddStorePress} />,
      headerTitle: `Stores List${Object.keys(filtersFound || {}).length > 0 ? ' (filtered)' : ''}`,
    })
  }, [navigation, filtersFound])

  useEffect(() => {
    if (storesList.length === lastStoresListLengthRef.current) return
    shouldSortOnMountRef.current = true
    setListToDisplay(storesList)
  }, [storesList])

  useFocusEffect(() => {
    closeMenu()
  })

  function renderItem({ item, index }: ListRow<Store>) {
    const keyToUse = {
      name: item.name,
      upc: EMPTY_STRING,
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
                name="trash"
                color={theme.colors.white}
                size={theme.sizes[8]}
              />
            </Stack>
          ),
          backgroundColor: theme.colors.red[900],
          onPress: onSwipeLeft.bind(null, keyToUse),
        }}
        rightSwipe={{
          backgroundColor: theme.colors.primary[900],
          onPress: onSwipeRight.bind(null, keyToUse),
          title: (
            <Stack
              paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
              alignItems="center"
            >
              <Text color={theme.colors.white}>Set as Current</Text>
            </Stack>
          ),
        }}
      >
        <RectButton
          style={styles.rectButton}
          onPress={() => {
            navigation.navigate(Routes.StoreModal, {
              name: keyToUse.name,
            })
          }}
        >
          <Stack>
            <Row
              px={theme.space[FORM_INTER_ITEM_SPACING]}
              space={theme.space[2]}
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack flex={1} justifyContent="center">
                <Text fontSize={theme.fontSizes['lg']}>{item.name}</Text>
                {/* <Text>
                      ({item.gpsCoordinates?.lat}, {item.gpsCoordinates?.lon})
                    </Text> */}
                <Text>
                  Estimated Distance:{' '}
                  {!item?.calculatedDistance || item.calculatedDistance === -1
                    ? 'N/A'
                    : `${item.calculatedDistance}mi.`}
                </Text>
              </Stack>
              <Stack>
                {currentStore?.name !== keyToUse.name ? (
                  <TouchableOpacity
                    onPress={() => dispatch(setCurrentStoreName(keyToUse.name))}
                  >
                    <Text color={theme.colors.info[900]}>Set as Current</Text>
                  </TouchableOpacity>
                ) : (
                  <Text>Current</Text>
                )}
              </Stack>
            </Row>
          </Stack>
        </RectButton>
      </SwipeableRow>
    )
  }

  return (
    <>
      <FlashList
        ref={listRef}
        key={listKey}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          setTimeout(() => {
            setRefreshing(false)
          }, 2000)
        }}
        data={listToDisplay}
        estimatedItemSize={150}
        keyExtractor={(item: Store, index: number) =>
          getKeyToUse({ name: item.name, upc: EMPTY_STRING })
        }
        ItemSeparatorComponent={() => (
          <View
            height={StyleSheet.hairlineWidth}
            backgroundColor={theme.colors.gray[500]}
          />
        )}
        renderItem={renderItem}
      />
      <ListSorter
        sortOrderValue={sortOrderValue}
        listName={listName}
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onValueChange={onSortTypeChange}
        sortTypes={storesListSortTypes}
        viewSize="small"
      />
      <ListFilter
        sortOrderValue={sortOrderValue}
        filtersInitial={filtersFound}
        item={storesList[0]}
        filterNames={['name']}
        isVisible={isFilterModalOpen}
        setIsVisible={setIsFilterModalOpen}
        onValueChange={onFilterValueChange}
      />
    </>
  )
}

const styles = StyleSheet.create({
  rectButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  fromText: {
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  messageText: {
    color: '#999',
    backgroundColor: 'transparent',
  },
  dateText: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 20,
    top: 10,
    color: '#999',
    fontWeight: 'bold',
  },
})

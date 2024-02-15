import { FontAwesome } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useFocusEffect, useNavigation } from 'expo-router'
import { useTheme, Row, View, Stack, Text, Button, Center } from 'native-base'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LayoutAnimation, StyleSheet } from 'react-native'
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler'
import {
  MenuTrigger,
  MenuOptions,
  MenuOption,
  Menu,
  renderers,
} from 'react-native-popup-menu'
import { useSelector, useDispatch } from 'react-redux'

import { ListSorter } from './ListSorter'
import { SwipeableRow } from './SwipeableRow'
import { SortType, getSorter } from './sorters'
import { AddButton } from '../header/AddButton'
import { EllipsisButton } from '../header/EllipsisButton'

import { FORM_INTER_ITEM_SPACING, EMPTY_STRING } from '@/constants/general'
import { Routes } from '@/constants/navigation'
import {
  currentStoreSelector,
  removeStoresListItem,
  setCurrentStoreName,
  setStoresList,
  storesListSelector,
} from '@/state/slices/listsSlice'
import { Key } from '@/types/Item'
import { Store } from '@/types/Store'
import { ListRow } from '@/types/general'
import { getKeyToUse } from '@/utils/helpers'

const storesListSortTypes = [SortType.Name, SortType.Distance] as SortType[]
const { NotAnimatedContextMenu } = renderers

export function StoresList() {
  const navgation = useNavigation()
  const storesList = useSelector(storesListSelector)
  const currentStore = useSelector(currentStoreSelector)
  const theme = useTheme()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const listRef = useRef<FlashList<Store> | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [listKey, setListKey] = useState(0)
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const shouldSortOnMountRef = useRef(true)
  const lastStoresListLengthRef = useRef(storesList.length)
  const lastSortTypeRef = useRef(storesListSortTypes[0])
  const menuRef = useRef<Menu>(null)

  const closeMenu = useCallback(() => {
    menuRef.current?.close()
  }, [menuRef])

  function onAddStorePress() {
    navigation.navigate(Routes.StoreModal)
  }

  const onSortPress = useCallback(() => {
    setIsSortModalOpen(true)
  }, [])

  const onSortTypeChange = useCallback(
    (sortType: SortType) => {
      lastSortTypeRef.current = sortType
      const sortedList = [...storesList]
      sortedList.sort(getSorter(sortType))
      dispatch(setStoresList(sortedList))
    },
    [storesList],
  )

  const onSwipeLeft = useCallback(
    (keyToUse: Key) => {
      closeMenu()
      dispatch(removeStoresListItem(keyToUse))
      listRef.current?.prepareForLayoutAnimationRender()
      // after removing the item, we start animation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    },
    [listRef],
  )

  const onSwipeRight = useCallback((key: Key) => {
    closeMenu()
    dispatch(setCurrentStoreName(key?.name))
  }, [])

  useEffect(() => {
    setListKey((current) => current + 1)
  }, [currentStore])

  useEffect(() => {
    navgation.setOptions({
      headerRight: () => (
        <Menu ref={menuRef} renderer={NotAnimatedContextMenu}>
          <MenuTrigger children={<EllipsisButton />} />
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
      headerLeft: () => <AddButton onPress={onAddStorePress} />,
    })
  }, [navgation])

  useEffect(() => {
    if (storesList.length === lastStoresListLengthRef.current) return
    shouldSortOnMountRef.current = true
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
        data={storesList}
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
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onMount={() => {
          if (!shouldSortOnMountRef.current) return
          shouldSortOnMountRef.current = false
          onSortTypeChange(lastSortTypeRef.current)
        }}
        onValueChange={onSortTypeChange}
        sortTypes={storesListSortTypes}
        viewSize="small"
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

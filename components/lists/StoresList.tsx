import { FontAwesome } from '@expo/vector-icons'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { useNavigation } from 'expo-router'
import { useTheme, Center, Heading, Row, View, Stack, Text } from 'native-base'
import { useCallback, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
import { FlatList, RectButton } from 'react-native-gesture-handler'
import { useSelector, useDispatch } from 'react-redux'

import { ListSorter } from './ListSorter'
import { SwipeableRow } from './SwipeableRow'
import { SORTERS, SortType } from './sorters'

import { FORM_INTER_ITEM_SPACING, EMPTY_STRING } from '@/constants/general'
import { Routes } from '@/constants/navigation'
import { currentLocationSelector } from '@/state/slices/generalSlice'
import {
  currentStoreSelector,
  removeStoresListItem,
  setCurrentStoreName,
  storesListArraySelector,
} from '@/state/slices/listsSlice'
import { Key } from '@/types/Item'
import { Store } from '@/types/Store'
import { ListRow } from '@/types/general'
import { calculateDistance, getKeyToUse } from '@/utils/helpers'
import { StoreManager } from '../StoreManager'

export function StoresList() {
  const storesList = useSelector(storesListArraySelector)
  const currentLocation = useSelector(currentLocationSelector)
  const currentStore = useSelector(currentStoreSelector)
  const theme = useTheme()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const arrayWithDistances = useMemo(() => {
    return storesList.map((store) => {
      return {
        ...store,
        calculatedDistance: calculateDistance(
          currentLocation,
          store.gpsCoordinates,
        ),
      }
    })
  }, [storesList, currentLocation]) as Store[]
  const [sortedList, setSortedList] = useState(arrayWithDistances)

  const onSortTypeChange = useCallback(
    (sortType: SortType) => {
      const newSorted = [...sortedList.sort(SORTERS[sortType])]
      setSortedList(newSorted)
    },
    [sortedList, setSortedList],
  )

  console.log({ sortedList, arrayWithDistances })

  return (
    <Stack>
      <ListSorter
        onValueChange={onSortTypeChange}
        sortTypes={[SortType.Distance, SortType.Name]}
      />
      <FlatList
        data={sortedList}
        renderItem={({ item, index }: ListRow<Store>) => {
          const keyToUse = {
            name: item.name,
            upc: EMPTY_STRING,
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
                onPress: () => {
                  dispatch(removeStoresListItem(keyToUse))
                },
              }}
              rightSwipe={{
                backgroundColor: theme.colors.primary[900],
                onPress: () => {
                  dispatch(setCurrentStoreName(keyToUse?.name))
                },
                title: (
                  <Stack
                    paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
                    alignItems="center"
                  >
                    <Text color={theme.colors.white}>Set as Current</Text>
                  </Stack>
                ),
              }}
              key={`${index}-${getKeyToUse({ name: item?.name || EMPTY_STRING, upc: item?.upc || EMPTY_STRING })}`}
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
                    <Stack justifyContent="center">
                      <Text fontSize={16}>
                        {item.name} ({item.gpsCoordinates?.lat},{' '}
                        {item.gpsCoordinates?.lon})
                      </Text>
                      <Text>
                        Estimated Distance:{' '}
                        {!item?.calculatedDistance ||
                        item.calculatedDistance === -1
                          ? 'N/A'
                          : `${item.calculatedDistance}mi.`}
                      </Text>
                    </Stack>
                    <Stack>
                      {currentStore?.name !== keyToUse.name ? (
                        <TouchableOpacity
                          onPress={() =>
                            dispatch(setCurrentStoreName(keyToUse.name))
                          }
                        >
                          <Text color={theme.colors.info[900]}>
                            Set as Current
                          </Text>
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
        }}
        keyExtractor={(item: Store, index: number) => `${item.name}-${index}`}
        ItemSeparatorComponent={() => (
          <View
            height={StyleSheet.hairlineWidth}
            backgroundColor={theme.colors.gray[500]}
          />
        )}
      />
    </Stack>
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

import { Button, FlatList, Heading, Row, Stack, Text, View } from 'native-base'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { getRandomEnumValue, getRandomInt, getRandomItem } from './helpers'
import { MOCK_STORES } from './mockStores'
import { MOCKS_UPCS } from './mockUpcData'

import {
  EMPTY_STRING,
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
} from '@/constants/general'
import { UPC_REQUIRED_CHAR_LENGTH } from '@/constants/regexs'
import {
  addItemsListItem,
  addMockItems,
  addStoresListItem,
  currentLocationSelector,
  currentStoreSelector,
  resetCurrentLocation,
  resetCurrentStoreName,
  resetItemsList,
  resetStoresList,
} from '@/state/slices/listsSlice'
import {
  resetUpcProducts,
  upcProductsSelector,
} from '@/state/slices/scannerSlice'
import { ItemsList, StoreSpecificValueKey } from '@/types/Item'
import { TimeSpan } from '@/types/general'
import {
  calculateDistance,
  displayAlert,
  getFrequencyValue,
} from '@/utils/helpers'

const NUMBER_OF_ITEM_TO_MOCK_INITIAL = 500
const NUMBER_OF_ITEMS_TO_SORT_INITIAL = 1000
export function ReduxViewer() {
  const [selectedUrl, setSelectedUrl] = useState(EMPTY_STRING)
  const lastUpcIndexRef = useRef(0)
  const lastUpcNumberRef = useRef(1)
  const lastStoreIndexRef = useRef(0)
  const [numberOfMockItems, setNumberOfMockItems] = useState(
    NUMBER_OF_ITEM_TO_MOCK_INITIAL,
  )
  const upcProducts = useSelector(upcProductsSelector)
  const currentLocation = useSelector(currentLocationSelector)
  const currentStore = useSelector(currentStoreSelector)
  const dispatch = useDispatch()

  // useEffect(() => {
  //   dispatch(resetItemsList())
  //   dispatch(resetStoresList())
  // }, [])

  function renderFieldAndText(key: string, value: any) {
    return (
      <Text fontWeight="bold">
        {key}: <Text fontWeight="normal">{value}</Text>
      </Text>
    )
  }

  return (
    <FlatList
      data={Object.values(upcProducts || {})}
      renderItem={(data) => {
        const { item, index } = data
        return (
          <View key={`${index}-${item.id}`}>
            <Heading size="sm" mt={3}>
              '{item.id}' details:
            </Heading>
            {renderFieldAndText('Name', item.product_name)}
            {/* {renderFieldAndText(
              "Fetched At",
              new Date(item.timestamp).toLocaleString(),
            )}
            {renderFieldAndText("Selected Image", selectedUrl)} */}
            {/* <ThumbnailPicker
              upcProduct={item}
              setSelectedUrl={setSelectedUrl}
              selectedUrl={selectedUrl}
            /> */}
          </View>
        )
      }}
      ListHeaderComponent={
        <>
          <Stack space={1}>
            <Text>Resetting:</Text>
            <Row space={1}>
              <Button onPress={() => dispatch(resetUpcProducts())}>
                upcProducts
              </Button>
              <Button
                onPress={() => {
                  lastUpcIndexRef.current = 0
                  dispatch(resetItemsList())
                }}
              >
                itemsList
              </Button>
              <Button onPress={() => dispatch(resetCurrentLocation())}>
                currentLocation
              </Button>
            </Row>
            <Row space={1}>
              <Button onPress={() => dispatch(resetCurrentStoreName())}>
                currentStoreName
              </Button>
              <Button
                onPress={() => {
                  lastStoreIndexRef.current = 0
                  dispatch(resetStoresList())
                  dispatch(resetCurrentStoreName())
                }}
              >
                storeList
              </Button>
            </Row>
          </Stack>
          <Stack space={1}>
            <Text>Adding Mock:</Text>
            <Row space={1}>
              <Button
                onPress={() => {
                  const storeToUse = MOCK_STORES?.[lastStoreIndexRef.current]
                  if (lastStoreIndexRef.current >= MOCK_STORES.length - 1) {
                    lastStoreIndexRef.current = 0
                  } else {
                    lastStoreIndexRef.current += 1
                  }
                  dispatch(addStoresListItem(storeToUse))
                }}
              >
                Store
              </Button>
              <Button
                onPress={() => {
                  const upcToUse = MOCKS_UPCS?.[lastUpcIndexRef.current]
                  if (lastUpcIndexRef.current >= MOCKS_UPCS.length - 1) {
                    lastUpcIndexRef.current = 0
                  } else {
                    lastUpcIndexRef.current += 1
                  }

                  const randomItem = getRandomItem(lastUpcIndexRef.current);
                  dispatch(
                    addItemsListItem({
                      item: {
                        addedDate: randomItem.addedDate,
                        frequency: randomItem.frequency,
                        images: randomItem.images,
                        imageToUseIndex: 0,
                        lastUpdatedDate: randomItem.lastUpdatedDate,
                        name: randomItem.name,
                        unit: randomItem.unit,
                        upc: upcToUse,
                      },
                      storeSpecificValues: {
                        aisle: randomItem[StoreSpecificValueKey.Aisle],
                        itemId: randomItem[StoreSpecificValueKey.ItemId],
                        price: randomItem[StoreSpecificValueKey.Price],
                        quantity: randomItem[StoreSpecificValueKey.Quantity],
                      },
                      currentStore: MOCK_STORES[1],
                    }),
                  )
                }}
              >
                Item
              </Button>
            </Row>
            <Row space={1}>
              <Button
                onPress={() => {
                  const itemsList = [] as ItemsList
                  for (let index = 0; index < numberOfMockItems; index++) {
                    itemsList.push(getRandomItem(lastUpcNumberRef.current))
                    lastUpcNumberRef.current += 1
                  }
                  dispatch(addMockItems(itemsList))
                }}
              >
                Add {numberOfMockItems} items
              </Button>
            </Row>
            <Button
              onPress={() => {
                const items = []
                for (
                  let index = 0;
                  index < NUMBER_OF_ITEMS_TO_SORT_INITIAL;
                  index++
                ) {
                  items.push({
                    id: Math.random(),
                    users: Array(50)
                      .fill()
                      .map((_, index) => index + 1),
                  })
                }
                const start = performance.now()
                items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
                const end = performance.now()
                displayAlert({
                  [`timeToSort${NUMBER_OF_ITEMS_TO_SORT_INITIAL}`]: end - start,
                })
              }}
            >
              Test Sort
            </Button>
          </Stack>

          <Text>
            Current Location: (Lat: {currentLocation?.lat}, Lon:{' '}
            {currentLocation?.lon})
          </Text>
          <Text>
            Distance to Store from Current:{' '}
            {calculateDistance(currentLocation, currentStore?.gpsCoordinates)}
          </Text>
        </>
      }
    />
  )
}

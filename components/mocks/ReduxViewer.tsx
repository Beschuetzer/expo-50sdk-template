import { Button, FlatList, Heading, Row, Stack, Text, View } from 'native-base';
import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getRandomItem, getRandomStoreSpecificValues } from './helpers';
import { MOCK_STORES } from './mockStores';
import { MOCKS_UPCS } from './mockUpcData';

import { UPC_REQUIRED_CHAR_LENGTH } from '@/constants/regexs';
import {
  addItemsListItem,
  setItemsList,
  addStoresListItem,
  currentLocationSelector,
  currentStoreSelector,
  resetCurrentLocation,
  resetCurrentStoreName,
  resetItemsList,
  resetStoresList,
  setStoreSpecificValues,
} from '@/state/slices/listsSlice';
import {
  resetUpcProducts,
  upcProductsSelector,
} from '@/state/slices/scannerSlice';
import { Item, StoreSpecificValuesMap } from '@/types/Item';
import { calculateDistance, displayAlert, getEmptyList } from '@/utils/helpers';

const NUMBER_OF_ITEM_TO_MOCK_INITIAL = 500;
const NUMBER_OF_ITEMS_TO_SORT_INITIAL = 1000;
export function ReduxViewer() {
  const lastUpcIndexRef = useRef(0);
  const lastUpcNumberRef = useRef(1);
  const lastStoreIndexRef = useRef(0);
  const [numberOfMockItems, setNumberOfMockItems] = useState(
    NUMBER_OF_ITEM_TO_MOCK_INITIAL,
  );
  const upcProducts = useSelector(upcProductsSelector);
  const currentLocation = useSelector(currentLocationSelector);
  const currentStore = useSelector(currentStoreSelector);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(resetItemsList())
  //   dispatch(resetStoresList())
  // }, [])

  function renderFieldAndText(key: string, value: any) {
    return (
      <Text fontWeight="bold">
        {key}: <Text fontWeight="normal">{value}</Text>
      </Text>
    );
  }

  return (
    <FlatList
      data={Object.values(upcProducts || {})}
      renderItem={(data) => {
        const { item, index } = data;
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
              imagesToRender={new Set(getImagesFromUpcProduct(item))}
            /> */}
          </View>
        );
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
                  lastUpcIndexRef.current = 0;
                  dispatch(resetItemsList());
                }}
              >
                Lists
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
                  lastStoreIndexRef.current = 0;
                  dispatch(resetStoresList());
                  dispatch(resetCurrentStoreName());
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
                  const storeToUse = MOCK_STORES?.[lastStoreIndexRef.current];
                  if (lastStoreIndexRef.current >= MOCK_STORES.length - 1) {
                    lastStoreIndexRef.current = 0;
                  } else {
                    lastStoreIndexRef.current += 1;
                  }
                  dispatch(addStoresListItem({ newStore: storeToUse }));
                }}
              >
                Store
              </Button>
              <Button
                onPress={() => {
                  if (lastUpcIndexRef.current >= MOCKS_UPCS.length - 1) {
                    lastUpcIndexRef.current = 0;
                  } else {
                    lastUpcIndexRef.current += 1;
                  }
                  dispatch(
                    addItemsListItem({
                      item: getRandomItem(lastUpcIndexRef.current),
                      storeSpecificValues: getRandomStoreSpecificValues(),
                      currentStore: MOCK_STORES[1],
                    }),
                  );
                }}
              >
                Item
              </Button>
            </Row>
            <Row space={1}>
              <Button
                onPress={() => {
                  const itemsList = getEmptyList<Item>();
                  const storeSpecificValuesMap: StoreSpecificValuesMap = {};

                  for (let index = 0; index < numberOfMockItems; index++) {
                    const upcToUse = lastUpcNumberRef.current
                      .toString()
                      .padStart(UPC_REQUIRED_CHAR_LENGTH, '0');

                    itemsList.data.push(
                      getRandomItem(lastUpcNumberRef.current),
                    );
                    storeSpecificValuesMap[upcToUse] =
                      getRandomStoreSpecificValues();

                    lastUpcNumberRef.current += 1;
                  }
                  const keys = Object.keys(storeSpecificValuesMap);
                  dispatch(setItemsList(itemsList));
                  dispatch(setStoreSpecificValues(storeSpecificValuesMap));
                }}
              >
                Add {numberOfMockItems} items
              </Button>
            </Row>
            <Button
              onPress={() => {
                const items = [];
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
                  });
                }
                const start = performance.now();
                items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
                const end = performance.now();
                displayAlert({
                  [`timeToSort${NUMBER_OF_ITEMS_TO_SORT_INITIAL}`]: end - start,
                });
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
  );
}

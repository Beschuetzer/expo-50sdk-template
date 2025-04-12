import { Button, FlatList, Heading, Row, Stack, Text, View } from 'native-base';
import React, { useRef } from 'react';

import { getRandomItem, getRandomStoreSpecificValues } from './helpers';
import { MOCK_STORES } from './mockStores';

import {
  getMockItemsListWithStoreSpecificValues,
  getMockStoresList,
} from '@/constants/testing';
import {
  setItemsList,
  addStoresListItem,
  currentLocationSelector,
  currentStoreSelector,
  resetCurrentLocation,
  resetCurrentStoreId,
  resetItemsList,
  resetStoresList,
  setStoreSpecificValues,
  addItemsListItem,
  currentLocationStateSelector,
  resetCurrentLocationState,
  addStoreSpecificValues,
  setStoresList,
  addItemsToItemsList,
  setCurrentStoreId,
  setLastPurchasedMap,
} from '@/state/slices/listsSlice';
import { resetQuickAddListSlice } from '@/state/slices/quickAddSlice';
import {
  resetUpcProducts,
  upcProductsSelector,
} from '@/state/slices/scannerSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { saveItem, saveStore } from '@/state/thunks';
import { LastPurchasedMap, StoreSpecificValueKey } from '@/types/Item';
import { calculateDistance, displayAlert, getKeyToUse } from '@/utils/helpers';

const NUMBER_OF_ITEM_TO_MOCK_INITIAL = 1000;
const NUMBER_OF_ITEMS_TO_SORT_INITIAL = 1000;
export function ReduxViewer() {
  const lastUpcIndexRef = useRef(0);
  const lastUpcNumberRef = useRef(1);
  const lastStoreIndexRef = useRef(0);
  const upcProducts = useAppSelector(upcProductsSelector);
  const currentLocationState = useAppSelector(currentLocationStateSelector);
  const currentLocation = useAppSelector(currentLocationSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const dispatch = useAppDispatch();

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

  function onStoreItemsCountPress() {
    dispatch(resetItemsList());
    dispatch(resetStoresList());
    dispatch(resetCurrentStoreId());
    const mockStoresList = getMockStoresList(100);
    for (let index = 0; index < 10; index++) {
      const itemCount = 500;
      const { itemsList, storeSpecificValuesMap } =
        getMockItemsListWithStoreSpecificValues(
          itemCount,
          0 + index * itemCount,
        );
      dispatch(setStoresList(mockStoresList));
      dispatch(addItemsToItemsList(itemsList));
      dispatch(addStoreSpecificValues(storeSpecificValuesMap));
      dispatch(
        setCurrentStoreId(
          mockStoresList.data[mockStoresList.data.length - 1]._id,
        ),
      );
    }
  }

  function onCopyStoreSpecificValuesPress() {
    dispatch(resetItemsList());
    dispatch(resetStoresList());
    dispatch(resetCurrentStoreId());
    const mockStoresList = getMockStoresList(2);
    const itemCount = 50;
    const { itemsList, storeSpecificValuesMap } =
      getMockItemsListWithStoreSpecificValues(itemCount, 0);

    const seedData = {
      [getKeyToUse(itemsList.data[0])]: {
        [StoreSpecificValueKey.Price]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 2,
        },
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 2,
        },
        [StoreSpecificValueKey.AisleNumber]: {
          [mockStoresList.data[0]._id]: 'Aisle store-0',
        },
        [StoreSpecificValueKey.Note]: {
          [mockStoresList.data[0]._id]: 'This is a note from store-0',
        },
      },
      [getKeyToUse(itemsList.data[1])]: {
        [StoreSpecificValueKey.Price]: {
          [mockStoresList.data[0]._id]: 3.99,
          [mockStoresList.data[1]._id]: 4.99,
        },
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 2,
          [mockStoresList.data[1]._id]: 2,
        },
        [StoreSpecificValueKey.AisleNumber]: {
          [mockStoresList.data[1]._id]: 'Aisle store-1',
        },
        [StoreSpecificValueKey.ItemId]: {
          [mockStoresList.data[1]._id]: 'ItemId for store-1',
        },
      },
      [getKeyToUse(itemsList.data[2])]: {
        [StoreSpecificValueKey.Price]: {
          [mockStoresList.data[1]._id]: 1,
        },
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
        [StoreSpecificValueKey.AisleNumber]: {
          [mockStoresList.data[1]._id]: 'Aisle store-1',
        },
        [StoreSpecificValueKey.ItemId]: {
          [mockStoresList.data[1]._id]: 'ItemId for store-1',
        },
      },
      [getKeyToUse(itemsList.data[3])]: {
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
      },
      [getKeyToUse(itemsList.data[4])]: {
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
      },
      [getKeyToUse(itemsList.data[5])]: {
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
      },
      [getKeyToUse(itemsList.data[6])]: {
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
      },
      [getKeyToUse(itemsList.data[7])]: {
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
      },
      [getKeyToUse(itemsList.data[8])]: {
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
      },
      [getKeyToUse(itemsList.data[9])]: {
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
      },
      [getKeyToUse(itemsList.data[10])]: {
        [StoreSpecificValueKey.Quantity]: {
          [mockStoresList.data[0]._id]: 1,
          [mockStoresList.data[1]._id]: 1,
        },
      },
    };

    for (const key in seedData) {
      storeSpecificValuesMap[key] = seedData[key];
    }

    const lastPurchasedMap: LastPurchasedMap = {
      [getKeyToUse(itemsList.data[0])]: {
        [mockStoresList.data[1]._id]: Date.now() - 1000,
      },
      [getKeyToUse(itemsList.data[1])]: {
        [mockStoresList.data[1]._id]: Date.now() - 1000,
      },
      [getKeyToUse(itemsList.data[2])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[3])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[4])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[5])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[6])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[7])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[8])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[9])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[10])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[11])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[12])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[13])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[14])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[15])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      [getKeyToUse(itemsList.data[16])]: {
        [mockStoresList.data[0]._id]: Date.now() - 60 * 1000 * 60 * 24 * 30,
        [mockStoresList.data[1]._id]: Date.now(),
      },
      
    };

    dispatch(setLastPurchasedMap(lastPurchasedMap));
    dispatch(setStoresList(mockStoresList));
    dispatch(addItemsToItemsList(itemsList));
    dispatch(addStoreSpecificValues(storeSpecificValuesMap));
    dispatch(setCurrentStoreId(mockStoresList.data[0]._id));
  }

  return (
    <FlatList
      keyboardShouldPersistTaps="always"
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
          <Stack paddingY={2}>
            <Heading>Resetting:</Heading>
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
              <Button
                onPress={() => {
                  dispatch(resetQuickAddListSlice());
                }}
              >
                Quick Add List
              </Button>
              <Button
                onPress={() => {
                  dispatch(resetCurrentLocation());
                  dispatch(resetCurrentLocationState());
                }}
              >
                currentLocation
              </Button>
            </Row>
            <Row space={1}>
              <Button onPress={() => dispatch(resetCurrentStoreId())}>
                currentStoreId
              </Button>
              <Button
                onPress={() => {
                  lastStoreIndexRef.current = 0;
                  dispatch(resetStoresList());
                  dispatch(resetCurrentStoreId());
                }}
              >
                storeList
              </Button>
            </Row>
          </Stack>
          <Stack paddingY={2}>
            <Heading>Adding Mock:</Heading>
            <Row space={1}>
              <Button
                onPress={() => {
                  const storeToUse = MOCK_STORES?.[lastStoreIndexRef.current];
                  if (lastStoreIndexRef.current >= MOCK_STORES.length - 1) {
                    lastStoreIndexRef.current = 0;
                  } else {
                    lastStoreIndexRef.current += 1;
                  }
                  dispatch(
                    saveStore({
                      newStore: storeToUse,
                    }),
                  );
                }}
              >
                Store
              </Button>
              <Button
                onPress={() => {
                  const storeToUse = MOCK_STORES?.[lastStoreIndexRef.current];
                  if (lastStoreIndexRef.current >= MOCK_STORES.length - 1) {
                    lastStoreIndexRef.current = 0;
                  } else {
                    lastStoreIndexRef.current += 1;
                  }
                  dispatch(
                    addStoresListItem({
                      newStore: {
                        ...storeToUse,
                        needsSaving: true,
                      },
                    }),
                  );
                }}
              >
                Store Local
              </Button>
              <Button
                onPress={() => {
                  lastUpcIndexRef.current += 1;
                  const randomItem = getRandomItem(lastUpcIndexRef.current);
                  dispatch(
                    saveItem({
                      item: randomItem,
                      storeSpecificValues: getRandomStoreSpecificValues(),
                      originalKey: randomItem,
                      hasKeyChanged: false,
                    }),
                  );
                }}
              >
                Item
              </Button>
              <Button
                onPress={() => {
                  lastUpcIndexRef.current += 1;
                  const randomItem = getRandomItem(lastUpcIndexRef.current);
                  dispatch(
                    addItemsListItem({
                      item: {
                        ...randomItem,
                        needsSaving: true,
                      },
                      storeSpecificValues: getRandomStoreSpecificValues(),
                    }),
                  );
                }}
              >
                Item Local
              </Button>
            </Row>
            <Row space={1}>
              <Button
                onPress={() => {
                  const { itemsList, storeSpecificValuesMap } =
                    getMockItemsListWithStoreSpecificValues(
                      NUMBER_OF_ITEM_TO_MOCK_INITIAL,
                      lastUpcIndexRef.current,
                    );
                  lastUpcIndexRef.current += NUMBER_OF_ITEM_TO_MOCK_INITIAL;
                  dispatch(setItemsList(itemsList));
                  dispatch(setStoreSpecificValues(storeSpecificValuesMap));
                }}
              >
                Add {NUMBER_OF_ITEM_TO_MOCK_INITIAL} items
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
                      .fill(0)
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
          <Stack paddingY={2}>
            <Heading>Setting up Specific Env:</Heading>
            <Button onPress={onStoreItemsCountPress}>storeItemsCount</Button>
            <Button onPress={onCopyStoreSpecificValuesPress}>
              copyStoreSpecificValues
            </Button>
          </Stack>
          <Text>
            Current Location: (Lat: {currentLocation?.lat}, Lon:{' '}
            {currentLocation?.lon}, State: {currentLocationState})
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

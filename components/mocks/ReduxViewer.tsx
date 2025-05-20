import { Button, Heading, Row, Stack, Text } from 'native-base';
import React, { useRef } from 'react';

import { MOCK_SCAN_TEST_UPC } from './constants';
import {
  getRandomInt,
  getRandomItem,
  getRandomStoreSpecificValues,
} from './helpers';
import { MOCK_STORES } from './mockStores';

import {
  getMockItemsListWithStoreSpecificValues,
  getMockLocationsList,
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
  addInventoryLocation,
  insertInventoryItem,
  resetInventoryItems,
  resetInventoryLocations,
  setCurrentInventoryLocationId,
} from '@/state/slices/listsSlice';
import { resetQuickAddListSlice } from '@/state/slices/quickAddSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { saveItem, saveStore } from '@/state/thunks';
import { LastPurchasedMap, StoreSpecificValueKey } from '@/types/Item';
import { calculateDistance, displayAlert, getKeyToUse } from '@/utils/helpers';
import { setIsUpToDate } from '@/state/slices/generalSlice';

const NUMBER_OF_ITEM_TO_MOCK_INITIAL = 1000;
const NUMBER_OF_ITEMS_TO_SORT_INITIAL = 1000;
export function ReduxViewer() {
  const lastUpcIndexRef = useRef(0);
  const lastUpcNumberRef = useRef(1);
  const lastStoreIndexRef = useRef(0);
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

  function onInventoryLocationPress(
    itemCount: number,
    includeInventoryItems = true,
  ) {
    resetEverything();

    const mockStoresList = getMockStoresList(10);
    const { itemsList, storeSpecificValuesMap } =
      getMockItemsListWithStoreSpecificValues(
        itemCount,
        0,
        mockStoresList.data.map((s) => s.name),
      );
    itemsList.data[0].upc = MOCK_SCAN_TEST_UPC;
    itemsList.data[0].inventoryMinimum = 7;

    storeSpecificValuesMap[getKeyToUse(itemsList.data[0])] = {
      [StoreSpecificValueKey.Quantity]: {
        [mockStoresList.data[0]._id]: 1,
        [mockStoresList.data[1]._id]: 1,
        [mockStoresList.data[2]._id]: 1,
      },
      [StoreSpecificValueKey.IsInCart]: {
        [mockStoresList.data[0]._id]: false,
        [mockStoresList.data[1]._id]: false,
        [mockStoresList.data[2]._id]: true,
      },
    };

    storeSpecificValuesMap[
      getKeyToUse(itemsList.data[itemsList.data.length - 1])
    ] = {
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
      [StoreSpecificValueKey.IsInCart]: {
        [mockStoresList.data[0]._id]: true,
        [mockStoresList.data[1]._id]: true,
      },
    };

    storeSpecificValuesMap[
      getKeyToUse(itemsList.data[itemsList.data.length - 2])
    ] = {
      [StoreSpecificValueKey.Price]: {
        [mockStoresList.data[0]._id]: 3,
        [mockStoresList.data[1]._id]: 4,
      },
      [StoreSpecificValueKey.Quantity]: {
        [mockStoresList.data[0]._id]: 4,
        [mockStoresList.data[1]._id]: 5,
      },
      [StoreSpecificValueKey.AisleNumber]: {
        [mockStoresList.data[0]._id]: 'Aisle store-1',
      },
      [StoreSpecificValueKey.Note]: {
        [mockStoresList.data[0]._id]: 'This is a note from store-1',
      },
      [StoreSpecificValueKey.IsInCart]: {
        [mockStoresList.data[0]._id]: true,
        [mockStoresList.data[1]._id]: true,
      },
    };
    dispatch(setStoresList(mockStoresList));
    dispatch(setCurrentStoreId(mockStoresList.data[0]._id));
    dispatch(setStoreSpecificValues(storeSpecificValuesMap));
    dispatch(setItemsList(itemsList));

    if (includeInventoryItems) {
      const locations = getMockLocationsList(20);
      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        dispatch(addInventoryLocation(location));

        dispatch(
          insertInventoryItem({
            locationId: locations[0]._id,
            itemId: itemsList.data[i]._id || `item-${i}-id`,
            item: {
              expirationDates: {
                [Date.now() +
                1000 * 60 * 60 * 24 * Math.ceil(Math.random() * 100)]: 1,
              },
            },
          }),
        );
      }

      const idsToAdd = [
        itemsList.data[0]._id || 'item-0-id',
        itemsList.data[1]._id || 'item-1-id',
      ];
      const locationsToAdd = locations.slice(0, 2);
      for (let i = 0; i < locationsToAdd.length; i++) {
        const location = locationsToAdd[i];
        for (const id of idsToAdd) {
          for (let i = 0; i <= 5; i++) {
            dispatch(
              insertInventoryItem({
                locationId: location._id,
                itemId: id,
                item: {
                  expirationDates: {
                    [Date.now() + 1000 * 60 * 60 * 24 * getRandomInt(1, 100)]:
                      1,
                  },
                },
              }),
            );
          }
        }
      }
      dispatch(setCurrentInventoryLocationId(locations[0]._id));
    }

    //#region last purchased map
    const lastPurchasedMap: LastPurchasedMap = {
      [getKeyToUse(itemsList.data[0])]: {
        [mockStoresList.data[0]._id]: Date.now() - 100000,
        [mockStoresList.data[1]._id]: Date.now() - 1000000,
        [mockStoresList.data[2]._id]: Date.now() - 20000000,
      },
    };
    dispatch(setLastPurchasedMap(lastPurchasedMap));
    // #endregion
  }

  function resetEverything() {
    dispatch(resetItemsList());
    dispatch(resetStoresList());
    dispatch(resetCurrentStoreId());
    dispatch(resetInventoryLocations());
    dispatch(resetInventoryItems());
    dispatch(resetCurrentLocation());
    dispatch(resetCurrentLocationState());
    dispatch(setIsUpToDate(false));
  }

  function onBlankSlatePress() {
    resetEverything();
  }

  function onStoreItemsCountPress() {
    resetEverything();
    const mockStoresList = getMockStoresList(100);
    for (let index = 0; index < 10; index++) {
      const itemCount = 500;
      const { itemsList, storeSpecificValuesMap } =
        getMockItemsListWithStoreSpecificValues(
          itemCount,
          0 + index * itemCount,
          mockStoresList.data.map((s) => s.name),
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

  function onCopyStoreSpecificValuesPress(itemCount = 50) {
    dispatch(resetItemsList());
    dispatch(resetStoresList());
    dispatch(resetCurrentStoreId());
    const mockStoresList = getMockStoresList(2);
    const { itemsList, storeSpecificValuesMap } =
      getMockItemsListWithStoreSpecificValues(
        itemCount,
        0,
        mockStoresList.data.map((s) => s.name),
      );

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
    return itemsList;
  }

  return (
    <>
      <Stack paddingY={2}>
        <Heading>Resetting:</Heading>
        <Row space={1}>
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
          <Button
            onPress={() => {
              dispatch(resetInventoryItems());
              dispatch(resetInventoryLocations());
            }}
          >
            Inventory
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
        <Button onPress={onBlankSlatePress}>Blank Slate</Button>
        <Button onPress={onStoreItemsCountPress}>storeItemsCount</Button>
        <Button onPress={() => onCopyStoreSpecificValuesPress()}>
          copyStoreSpecificValues
        </Button>
        <Row>
          <Button onPress={() => onInventoryLocationPress(2000, false)}>
            Inventory Empty
          </Button>
          <Button onPress={() => onInventoryLocationPress(50)}>
            Inventory Small
          </Button>
          <Button onPress={() => onInventoryLocationPress(2000)}>
            Inventory Large
          </Button>
        </Row>
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
  );
}

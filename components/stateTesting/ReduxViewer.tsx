import { Button, FlatList, Heading, Row, Stack, Text, View } from "native-base";
import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { MOCK_STORES } from "../mocks/mockStores";
import { MOCKS_UPCS } from "../mocks/mockUpcData";

import { EMPTY_STRING } from "@/constants/general";
import {
  currentLocationSelector,
  resetCurrentLocation,
} from "@/state/slices/generalSlice";
import {
  addItemsListItem,
  addStoresListItem,
  currentStoreSelector,
  resetCurrentStoreName,
  resetItemsList,
  resetStoresList,
} from "@/state/slices/listsSlice";
import {
  resetUpcProducts,
  upcProductsSelector,
} from "@/state/slices/scannerSlice";
import { calculateDistance } from "@/utils/helpers";

export function ReduxViewer() {
  const [selectedUrl, setSelectedUrl] = useState(EMPTY_STRING);
  const lastUpcIndexRef = useRef(0);
  const lastStoreIndexRef = useRef(0);
  const upcProducts = useSelector(upcProductsSelector);
  const currentLocation = useSelector(currentLocationSelector);
  const currentStore = useSelector(currentStoreSelector);
  const dispatch = useDispatch();

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
            {renderFieldAndText("Name", item.product_name)}
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
              <Button onPress={() => dispatch(resetItemsList())}>
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
                  if (lastStoreIndexRef.current > MOCK_STORES.length - 1) {
                    lastStoreIndexRef.current = 0;
                  } else {
                    lastStoreIndexRef.current += 1;
                  }
                  dispatch(addStoresListItem(storeToUse))
                }}
              >
                Store
              </Button>
              <Button
                onPress={() => {
                  const upcToUse = MOCKS_UPCS?.[lastUpcIndexRef.current];
                  if (lastUpcIndexRef.current > MOCKS_UPCS.length - 1) {
                    lastUpcIndexRef.current = 0;
                  } else {
                    lastUpcIndexRef.current += 1;
                  }
                  dispatch(
                    addItemsListItem({
                      frequency: 604800000,
                      imageToUseIndex: 0,
                      images: [
                        "https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg",
                      ],
                      name: "Cholocate",
                      unit: "bar",
                      upc: upcToUse,
                      itemId: {},
                      aisle: {},
                      price: {},
                      quantity: {},
                    }),
                  );
                }}
              >
                Item
              </Button>
            </Row>
          </Stack>

          <Text>
            Current Location: (Lat: {currentLocation?.lat}, Lon:{" "}
            {currentLocation?.lon})
          </Text>
          <Text>
            Distance to Store from Current:{" "}
            {calculateDistance(currentLocation, currentStore?.gpsCoordinates)}
          </Text>
        </>
      }
    />
  );
}

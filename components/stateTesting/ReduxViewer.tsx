import { Button, FlatList, Heading, Text, View } from "native-base";
import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { EMPTY_STRING } from "@/constants/general";
import {
  currentLocationSelector,
  currentStoreSelector,
  resetCurrentStore,
} from "@/state/slices/generalSlice";
import {
  addStoresListItem,
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
            {renderFieldAndText(
              "Fetched At",
              new Date(item.timestamp).toLocaleString(),
            )}
            {renderFieldAndText("Selected Image", selectedUrl)}
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
          <Button onPress={() => dispatch(resetUpcProducts())}>
            Reset upcProducts
          </Button>
          <Button onPress={() => dispatch(resetItemsList())}>
            Reset Items
          </Button>
          <Button
            onPress={() => {
              dispatch(resetStoresList());
              dispatch(resetCurrentStore());
            }}
          >
            Reset Stores
          </Button>
          <Button
            onPress={() => {
              dispatch(
                addStoresListItem({
                  name: `Costco`,
                  gpsCoordinates: {
                    lat: "45.0297043",
                    lon: "-93.0393775",
                  },
                }),
              );
            }}
          >
            Add Mock Store
          </Button>
          <Text>
            Current Location: (Lat: {currentLocation?.lat}, Lon:{" "}
            {currentLocation?.lon})
          </Text>
          <Text>
            Distance to Store from Current:{" "}
            {calculateDistance(currentLocation, currentStore)}
          </Text>
        </>
      }
    />
  );
}

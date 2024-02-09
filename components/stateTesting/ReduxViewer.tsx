import { Button, FlatList, Heading, Text, View } from "native-base";
import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { resetCurrentStore } from "@/state/slices/generalSlice";
import {
  addStoresListItem,
  resetItemsList,
  resetStoresList,
} from "@/state/slices/listsSlice";
import {
  resetUpcProducts,
  upcProductsSelector,
} from "@/state/slices/scannerSlice";

export function ReduxViewer() {
  const [selectedUrl, setSelectedUrl] = useState("");
  const currentStoreNumberRef = useRef(1);
  const upcProducts = useSelector(upcProductsSelector);
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
                  name: `Store-${currentStoreNumberRef.current}`,
                  gpsCoordinates: {
                    lat: "34.232",
                    long: "-94.28801",
                  },
                }),
              );
              currentStoreNumberRef.current += 1;
            }}
          >
            Add Mock Store
          </Button>
        </>
      }
    />
  );
}

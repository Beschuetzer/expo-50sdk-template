import { Button, FlatList, Heading, Text, View } from "native-base";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { ThumbnailPicker } from "../ThumbnailPicker";

import {
  lastUpcScannedSelector,
  resetLastUpcScanned,
} from "@/state/slices/generalSlice";
import { addItemsListItem, resetItemsList } from "@/state/slices/listsSlice";
import {
  resetUpcProducts,
  upcProductsSelector,
} from "@/state/slices/scannerSlice";

export function ReduxViewer() {
  const [selectedUrl, setSelectedUrl] = useState("");
  const lastUpcScanned = useSelector(lastUpcScannedSelector);
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
          <View key={index}>
            <Heading size="sm" mt={3}>
              '{item.id}' details:
            </Heading>
            {renderFieldAndText("Name", item.product_name)}
            {renderFieldAndText(
              "Fetched At",
              new Date(item.timestamp).toLocaleString(),
            )}
            {renderFieldAndText("Selected Image", selectedUrl)}
            <ThumbnailPicker
              upcProduct={item}
              setSelectedUrl={setSelectedUrl}
              selectedUrl={selectedUrl}
            />
          </View>
        );
      }}
      ListHeaderComponent={
        <>
          <Button onPress={() => dispatch(resetLastUpcScanned())}>
            Reset lastUpcScanned
          </Button>
          <Button onPress={() => dispatch(resetUpcProducts())}>
            Reset upcProducts
          </Button>
          <Button onPress={() => dispatch(resetItemsList())}>
            Reset Items
          </Button>
          <Button
            onPress={() =>
              dispatch(
                addItemsListItem({
                  frequency: 10000,
                  imageUri: 'test.com',
                  name: "test",
                  upc: "00999348348",
                }),
              )
            }
          >
            Save Item
          </Button>
          <Text>The lastUpcScanned is: {lastUpcScanned}</Text>
        </>
      }
    />
  );
}

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  lastUpcScannedSelector,
  resetLastUpcScanned,
  setLastUpcScanned,
} from "@/state/slices/generalSlice";
import { Button, FlatList, Heading, Text, View } from "native-base";
import {
  resetUpcProducts,
  upcProductsSelector,
} from "@/state/slices/scannerSlice";
import { ThumbnailPicker } from "../ThumbnailPicker";

export function ReduxViewer() {
  const [selectedUrl, setSelectedUrl] = useState("");
  const lastUpcScanned = useSelector(lastUpcScannedSelector);
  const upcProducts = useSelector(upcProductsSelector);
  const dispatch = useDispatch();

  function renderFieldAndText(key: string, value: any) {
    return (
      <Text fontWeight={"bold"}>
        {key}: <Text fontWeight={"normal"}>{value}</Text>
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
            <Heading size={"sm"} mt={3}>
              '{item.id}' details:
            </Heading>
            {renderFieldAndText("Name", item.product_name)}
            {renderFieldAndText(
              "Fetched At",
              new Date(item.timestamp).toLocaleString()
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
          <Button
            onPress={() => {
              dispatch(resetUpcProducts());
              dispatch(resetLastUpcScanned());
            }}
          >
            Reset upcProducts
          </Button>
        </>
      }
    />
  );
}

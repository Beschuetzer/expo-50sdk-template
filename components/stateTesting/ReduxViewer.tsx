import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  lastUpcScannedSelector,
  resetLastUpcScanned,
  setLastUpcScanned,
} from "@/state/slices/generalSlice";
import {
  Button,
  FlatList,
  Heading,
  Text,
  View,
} from "native-base";
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
        const { item } = data;
        console.log({ data });
        return (
          <View>
            <Heading size={"sm"} mt={3}>
              '{item._id}' details:
            </Heading>
            {renderFieldAndText("Name", item.product_name)}
            {renderFieldAndText(
              "Fetched At",
              new Date(item.timestamp).toLocaleString()
            )}
            {renderFieldAndText(
              "Selected Image",
              selectedUrl,
            )}
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
          <Button onPress={() => dispatch(setLastUpcScanned("test"))}>
            Set to 'test'
          </Button>
          <Button onPress={() => dispatch(resetLastUpcScanned())}>
            Reset lastUpcScanned
          </Button>
          <Button onPress={() => dispatch(resetUpcProducts())}>
            Reset upcProducts
          </Button>
          <Text>The lastUpcScanned is: {lastUpcScanned}</Text>
        </>
      }
    />
  );
}

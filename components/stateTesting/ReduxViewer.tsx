import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { View } from "react-native";
import {
  lastUpcScannedSelector,
  resetLastUpcScanned,
  setLastUpcScanned,
} from "@/state/slices/generalSlice";
import { Text } from "@/components/Themed";
import { Button, FlatList } from "native-base";
import ObjectRenderer from "../ObjectRenderer";
import { upcProductsSelector } from "@/state/slices/scannerSlice";

export function ReduxViewer() {
  const lastUpcScanned = useSelector(lastUpcScannedSelector);
  const upcProducts = useSelector(upcProductsSelector);
  const dispatch = useDispatch();

  return (
    <FlatList
      data={Object.values(upcProducts || {})}
      renderItem={(data) => {
        console.log({ data });
        return <ObjectRenderer object={data.item} />;
      }}
      ListHeaderComponent={
        <>
          <Button onPress={() => dispatch(setLastUpcScanned("test"))}>
            Set to 'test'
          </Button>
          <Button onPress={() => dispatch(resetLastUpcScanned())}>Reset</Button>
          <Text>The lastUpcScanned is: {lastUpcScanned}</Text>
        </>
      }
    />
  );
}

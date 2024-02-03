import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { View } from "react-native";
import {
  lastUpcScannedSelector,
  resetLastUpcScanned,
  setLastUpcScanned,
} from "@/state/slices/generalSlice";
import { Text } from "@/components/Themed";
import { Button } from "native-base";
import ObjectRenderer from "../ObjectRenderer";
import { upcProductsSelector } from "@/state/slices/scannerSlice";
import { ScrollView } from "react-native-gesture-handler";

export function ReduxViewer() {
  const lastUpcScanned = useSelector(lastUpcScannedSelector);
  const upcProducts = useSelector(upcProductsSelector);
  const dispatch = useDispatch();

  return (
    <ScrollView>
      <Button onPress={() => dispatch(setLastUpcScanned("test"))}>
        Set to 'test'
      </Button>
      <Button onPress={() => dispatch(resetLastUpcScanned())}>Reset</Button>
      <Text>The lastUpcScanned is: {lastUpcScanned}</Text>
      <ObjectRenderer object={upcProducts}/>
    </ScrollView>
  );
}

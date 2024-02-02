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

export function ReduxViewer() {
  const lastUpcScanned = useSelector(lastUpcScannedSelector);
  const dispatch = useDispatch();

  return (
    <View>
      <Button onPress={() => dispatch(setLastUpcScanned("test"))}>
        Set to 'test'
      </Button>
      <Button onPress={() => dispatch(resetLastUpcScanned())}>Reset</Button>
      <Text>The lastUpcScanned is: {lastUpcScanned}</Text>
    </View>
  );
}

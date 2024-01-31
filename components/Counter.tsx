import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { View } from "react-native";
import {
  counterValueSelector,
  decrement,
  increment,
} from "@/state/slices/counterSlice";
import { Text } from "@/components/Themed";
import { Button } from "native-base";

export function Counter() {
  const count = useSelector(counterValueSelector);
  const dispatch = useDispatch();

  return (
    <View>
      <Button onPress={() => dispatch(increment())}>Increment</Button>
      <Button onPress={() => dispatch(decrement())}>Decrement</Button>
      <Text>The count is: {count}</Text>
    </View>
  );
}

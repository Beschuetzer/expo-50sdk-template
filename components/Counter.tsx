import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { View } from "react-native";
import {
  counterValueSelector,
  decrement,
  increment,
} from "@/state/slices/counterSlice";
import { Text } from "@/components/Themed";
import { Button } from "./Button";

export function Counter() {
  const count = useSelector(counterValueSelector);
  const dispatch = useDispatch();

  return (
    <View>
      <Button onPress={() => dispatch(increment())} title="incrment" />
      <Button onPress={() => dispatch(decrement())} title="decrement" />
      <Text>The count is: {count}</Text>
    </View>
  );
}

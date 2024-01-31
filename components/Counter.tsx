import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { TouchableOpacity, View } from "react-native";
import {
  counterValueSelector,
  decrement,
  increment,
} from "@/state/slices/counterSlice";
import { Text } from "@/components/Themed";

export function Counter() {
  const count = useSelector(counterValueSelector);
  const dispatch = useDispatch();

  return (
    <View>
      <TouchableOpacity onPress={() => dispatch(increment())}>
        <Text >Increment</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => dispatch(decrement())}>
        <Text>Decrement</Text>
      </TouchableOpacity>
      <Text>The count is: {count}</Text>
    </View>
  );
}

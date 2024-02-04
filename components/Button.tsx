import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/Sizes";
import { StyleProp } from "@/types/general";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type ButtonProps = {
  onPress: () => void;
  title: string;
} & StyleProp;

export function Button(props: ButtonProps) {
  const { onPress, style = {}, title } = props;
  return (
    <TouchableOpacity
      style={{ ...styles.button, ...style }}
      onPress={() => onPress && onPress()}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.dark.background,
    paddingVertical: FONT_SIZES.three,
    paddingHorizontal: FONT_SIZES.three * 2,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: COLORS.dark.text,
    fontSize: FONT_SIZES.three,
    fontWeight: "500",
  },
});

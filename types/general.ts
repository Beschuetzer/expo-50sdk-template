import { ViewStyle } from "react-native";

import { UpcProduct } from "./UpcResponse";

export type TimeSpan = "Hour" | "Day" | "Week";
export type Frequency = {
  number: number;
  timeSpan: TimeSpan;
};

export type UpcProductProp = {
  upcProduct: UpcProduct;
};

export type StyleProp = {
  style?: ViewStyle;
};

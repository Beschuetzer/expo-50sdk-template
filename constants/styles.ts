import { ResponsiveValue } from "native-base/lib/typescript/components/types";

export const maxWidth = {
  maxWidth: 800,
}

export const maxWidthCentered = {
  marginRight: "auto",
  marginLeft: "auto",
  ...maxWidth,
};

export const absolutePositioning = {
  position: "absolute" as ResponsiveValue<any>,
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
};

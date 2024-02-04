import { COLORS } from "@/constants/colors";
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  View,
  Text,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { useBottomTabHeight } from "./hooks/useBottomTabHeight";

type FullscreenSpinnerProps = {
  activityIndicatorProps?: ActivityIndicatorProps;
  text?: string;
};

export function FullscreenSpinner(props: FullscreenSpinnerProps) {
  const { activityIndicatorProps, text } = props;
  const dimensions = useWindowDimensions();

  return (
    <View
      style={{
        width: dimensions.width,
        height: dimensions.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator
        size="large"
        color={COLORS.light.text}
        {...activityIndicatorProps}
      />
      <Text>{text}</Text>
    </View>
  );
}

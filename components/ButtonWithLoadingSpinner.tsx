import { Button, useTheme } from "native-base";
import { IButtonProps } from "native-base/lib/typescript/components/primitives/Button/types";
import { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  ColorValue,
  GestureResponderEvent,
} from "react-native";

type ButtonWithLoadingSpinnerProps = {
  onPress: (e: GestureResponderEvent) => void;
  children: ReactNode | ReactNode[];
  loadingSpinnerColor?: ColorValue;
} & IButtonProps;

export function ButtonWithLoadingSpinner(props: ButtonWithLoadingSpinnerProps) {
  const theme = useTheme();
  const {
    children,
    onPress,
    loadingSpinnerColor = theme.colors.white,
    ...rest
  } = props;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      {...rest}
      onPress={async (e) => {
        try {
          setIsLoading(true);
          onPress && onPress(e);
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? (
        <ActivityIndicator size={"small"} color={loadingSpinnerColor} />
      ) : (
        children
      )}
    </Button>
  );
}

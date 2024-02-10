import { useTheme, View, Text, theme } from "native-base";
import React, { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  I18nManager,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

import { EMPTY_STRING } from "@/constants/general";

type SwipeableRowDirection = "left" | "right";
type SwipeableRowAction = {
  title: string;
  backgroundColor: string;
  onPress: () => void;
};

type SwipeableRowProps = {
  leftActions?: SwipeableRowAction[];
  rightActions?: SwipeableRowAction[];
  leftSwipe?: SwipeableRowAction;
  rightSwipe?: SwipeableRowAction;
  children?: ReactNode | ReactNode[];
  width?: string | number;
  id?: any;
};

const OPEN_THRESHOLD = 125;
export function SwipeableRow(props: SwipeableRowProps) {
  const windowDimensions = Dimensions.get("window");
  const {
    children,
    width = windowDimensions.width,
    leftActions,
    rightActions,
    id,
    leftSwipe,
    rightSwipe,
  } = props;
  const swipeableRef = useRef<Swipeable>(null);

  function resetRow() {
    swipeableRef.current?.close();
  }

  useEffect(() => {
    resetRow();
  }, []);

  function renderLeftActions(
    progress: Animated.AnimatedInterpolation<string | number>,
  ) {
    if (rightSwipe)
      return renderAction(
        {
          backgroundColor:
            rightSwipe?.backgroundColor || theme.colors.primary[900],
          onPress: () => null,
          title: rightSwipe?.title || EMPTY_STRING,
        },
        "left",
      );
    return (
      <View
        width={width}
        flexDirection={I18nManager.isRTL ? "row-reverse" : "row"}
      >
        {leftActions?.map((action) => {
          return renderAction(action, "left");
        })}
      </View>
    );
  }

  function renderRightActions(
    progress: Animated.AnimatedInterpolation<string | number>,
  ) {
    if (leftSwipe)
      return renderAction(
        {
          backgroundColor:
            leftSwipe?.backgroundColor || theme.colors.primary[900],
          onPress: () => null,
          title: leftSwipe?.title || EMPTY_STRING,
        },
        "right",
      );
    return (
      <View
        width={width}
        flexDirection={I18nManager.isRTL ? "row-reverse" : "row"}
      >
        {rightActions?.map((action) => {
          return renderAction(action, "right");
        })}
      </View>
    );
  }

  function renderAction(
    action: SwipeableRowAction,
    direction: SwipeableRowDirection,
  ) {
    const { title, backgroundColor, onPress } = action;

    return (
      <Animated.View
        style={{
          flex: 1,
          transform: [
            {
              translateX:
                direction === "left"
                  ? 0
                  : windowDimensions.width - OPEN_THRESHOLD,
            },
          ],
          width: '100%',
        }}
      >
        <RectButton
          style={[
            styles.action,
            {
              backgroundColor,
              alignItems: direction === "left" ? "flex-start" : "flex-end",
              width: OPEN_THRESHOLD,
            },
          ]}
          onPress={onPress}
        >
          <Text style={styles.actionText}>{title}</Text>
        </RectButton>
      </Animated.View>
    );
  }

  return (
    <Swipeable
      key={id}
      ref={swipeableRef}
      friction={2}
      leftThreshold={Math.min(OPEN_THRESHOLD, windowDimensions.width / 2)}
      rightThreshold={Math.min(OPEN_THRESHOLD, windowDimensions.width / 2)}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={async (direction) => {
        if (direction === "left") {
          rightSwipe?.onPress && rightSwipe.onPress();
        } else {
          leftSwipe?.onPress && leftSwipe.onPress();
        }
        resetRow();
      }}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "transparent",
    padding: 10,
  },
  action: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
  },
});

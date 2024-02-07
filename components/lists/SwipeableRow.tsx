import { useTheme } from "native-base";
import React, { ReactNode, useRef } from "react";
import { Animated, StyleSheet, Text, View, I18nManager } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

type SwipeableRowProps = {
  children?: ReactNode | ReactNode[];
};
export function SwipeableRow(props: SwipeableRowProps) {
  const { children } = props;
  const theme = useTheme();
  const swipeableRef = useRef(null);

  function renderLeftActions(
    progress: Animated.AnimatedInterpolation<string | number>,
    dragX: Animated.AnimatedInterpolation<string | number>,
  ) {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton style={styles.leftAction} onPress={close}>
        <Animated.Text style={[styles.actionText]}>Archive</Animated.Text>
      </RectButton>
    );
  }

  function renderRightAction(
    text: string,
    color: string,
    x: number,
    progress: Animated.AnimatedInterpolation<string | number>,
  ) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      close();
      alert(text);
    };
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}
        >
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  }

  function renderRightActions(
    progress: Animated.AnimatedInterpolation<string | number>,
  ) {
    return (
      <View
        style={{
          width: 192,
          flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
        }}
      >
        {renderRightAction("Add", theme.colors.primary[900], 192, progress)}
        {renderRightAction("Edit", theme.colors.secondary[900], 128, progress)}
        {renderRightAction("Delete", theme.colors.tertiary[900], 64, progress)}
      </View>
    );
  }

  function close() {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={30}
      rightThreshold={40}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: "#497AFC",
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "transparent",
    padding: 10,
  },
  rightAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});

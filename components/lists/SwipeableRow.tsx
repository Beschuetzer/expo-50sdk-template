import { useTheme, View, Text } from 'native-base'
import React, { ReactNode, useRef } from 'react'
import { Animated, StyleSheet, I18nManager } from 'react-native'
import { RectButton, Swipeable } from 'react-native-gesture-handler'

type SwipeableRowProps = {
  children?: ReactNode | ReactNode[];
  width?: string | number;
}

export function SwipeableRow(props: SwipeableRowProps) {
  const { children, width = "50%" } = props;
  const theme = useTheme()
  const swipeableRef = useRef(null)

  function renderLeftActions(
    progress: Animated.AnimatedInterpolation<string | number>,
    dragX: Animated.AnimatedInterpolation<string | number>,
  ) {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    })

    return (
      <View
        width={width}
        flexDirection={I18nManager.isRTL ? 'row-reverse' : 'row'}
      >
        {renderAction('Add to Shopping List', theme.colors.primary[900], 192, progress, 'left')}
        {renderAction("Edit", theme.colors.warning[900], 128, progress, 'left')}
      </View>
    )
  }


  function renderAction(
    text: string,
    color: string,
    x: number,
    progress: Animated.AnimatedInterpolation<string | number>,
    direction: 'left' | 'right',
  ) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    })
    const pressHandler = () => {
      close()
      alert(text)
    }
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
        <RectButton
          style={[styles.action, { backgroundColor: color }]}
          onPress={pressHandler}
        >
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    )
  }

  function renderRightActions(
    progress: Animated.AnimatedInterpolation<string | number>,
  ) {
    return (
      <View
        width={width}
        flexDirection={I18nManager.isRTL ? 'row-reverse' : 'row'}
      >
        {renderAction('Delete', theme.colors.secondary[900], 0, progress, 'right')}
      </View>
    )
  }

  function close() {
    if (swipeableRef.current) {
      swipeableRef.current.close()
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
  )
}

const styles = StyleSheet.create({
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
  action: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center'
  },
})

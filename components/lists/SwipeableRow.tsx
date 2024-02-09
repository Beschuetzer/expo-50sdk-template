import { EMPTY_STRING } from '@/constants/general'
import { useTheme, View, Text, theme } from 'native-base'
import React, { ReactNode, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  I18nManager,
  ActivityIndicator,
} from 'react-native'
import { RectButton, Swipeable } from 'react-native-gesture-handler'

type SwipeableRowAction = {
  title: string
  backgroundColor: string
  onPress: () => void
}

type SwipeableRowProps = {
  leftActions?: SwipeableRowAction[]
  rightActions?: SwipeableRowAction[]
  leftSwipe?: SwipeableRowAction
  rightSwipe?: SwipeableRowAction;
  children?: ReactNode | ReactNode[]
  width?: string | number
  id?: any
}

export function SwipeableRow(props: SwipeableRowProps) {
  const {
    children,
    width = '50%',
    leftActions,
    rightActions,
    id,
    leftSwipe,
    rightSwipe,
  } = props
  const swipeableRef = useRef(null)

  function renderLeftActions(
    progress: Animated.AnimatedInterpolation<string | number>,
  ) {
   if (rightSwipe)
     return renderAction({
       backgroundColor: rightSwipe?.backgroundColor || theme.colors.primary[900],
       onPress: () => null,
       title: rightSwipe?.title || EMPTY_STRING,
     })
    return (
      <View
        width={width}
        flexDirection={I18nManager.isRTL ? 'row-reverse' : 'row'}
      >
        {leftActions.map((action) => {
          return renderAction(action)
        })}
      </View>
    )
  }

  function renderRightActions(
    progress: Animated.AnimatedInterpolation<string | number>,
  ) {
    if (leftSwipe)
      return renderAction({
        backgroundColor: leftSwipe?.backgroundColor || theme.colors.primary[900],
        onPress: () => null,
        title: leftSwipe?.title || EMPTY_STRING,
      })
    return (
      <View
        width={width}
        flexDirection={I18nManager.isRTL ? 'row-reverse' : 'row'}
      >
        {rightActions.map((action) => {
          return renderAction(action)
        })}
      </View>
    )
  }

  function renderAction(action: SwipeableRowAction) {
    const { title, backgroundColor, onPress } = action

    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
        <RectButton
          style={[styles.action, { backgroundColor }]}
          onPress={onPress}
        >
          {!title ? (
            <ActivityIndicator size={40} />
          ) : (
            <Text style={styles.actionText}>{title}</Text>
          )}
        </RectButton>
      </Animated.View>
    )
  }

  return (
    <Swipeable
      key={id}
      ref={swipeableRef}
      friction={2}
      leftThreshold={30}
      rightThreshold={40}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          rightSwipe?.onPress && rightSwipe.onPress()
        } else {
          leftSwipe?.onPress && leftSwipe.onPress()
        }
      }}
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
    textAlign: 'center',
  },
})

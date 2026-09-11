import { Box, Text } from '@gluestack-ui/themed';
import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, I18nManager, Dimensions } from 'react-native';
import {
  RectButton,
  Swipeable,
  SwipeableProps,
} from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { EMPTY_STRING } from '@/constants/general';
import { swipeableRowOpenThresholdSelector } from '@/state/slices/optionsSlice';

type SwipeableRowDirection = 'left' | 'right';
type SwipeableRowAction = {
  title: string | ReactNode | ReactNode[];
  backgroundColor: string;
  onPress: () => void;
} | null;

type SwipeableRowProps = {
  leftActions?: SwipeableRowAction[];
  rightActions?: SwipeableRowAction[];
  leftSwipe?: SwipeableRowAction;
  rightSwipe?: SwipeableRowAction;
  children?: ReactNode | ReactNode[];
  width?: string | number;
  id?: any;
  swipeableProps?: SwipeableProps;
};

export function SwipeableRow(props: SwipeableRowProps) {
  const windowDimensions = Dimensions.get('window');
  const {
    children,
    width = windowDimensions.width,
    leftActions,
    rightActions,
    id,
    leftSwipe,
    rightSwipe,
    swipeableProps,
  } = props;
  // The swipe-open threshold is user-configurable (see OptionsScreen) so it's read from redux
  // here instead of being hardcoded, even though this component doesn't otherwise touch redux.
  const openThreshold = useSelector(swipeableRowOpenThresholdSelector);
  const swipeableRef = useRef<Swipeable>(null);

  function resetRow() {
    swipeableRef.current?.close();
  }

  useEffect(() => {
    resetRow();
  }, []);

  function renderLeftActions() {
    if (rightSwipe)
      return renderAction(
        {
          backgroundColor: rightSwipe?.backgroundColor || '$primary900',
          onPress: () => null,
          title: rightSwipe?.title || EMPTY_STRING,
        },
        'left',
      );
    return (
      <Box
        width={width as number}
        flexDirection={I18nManager.isRTL ? 'row-reverse' : 'row'}
      >
        {leftActions?.map((action, index) => (
          <React.Fragment key={index}>
            {renderAction(action, 'left')}
          </React.Fragment>
        ))}
      </Box>
    );
  }

  function renderRightActions() {
    if (leftSwipe)
      return renderAction(
        {
          backgroundColor: leftSwipe?.backgroundColor || '$primary900',
          onPress: () => null,
          title: leftSwipe?.title || EMPTY_STRING,
        },
        'right',
      );
    return (
      <Box
        width={width as number}
        flexDirection={I18nManager.isRTL ? 'row-reverse' : 'row'}
      >
        {rightActions?.map((action, index) => (
          <React.Fragment key={index}>
            {renderAction(action, 'right')}
          </React.Fragment>
        ))}
      </Box>
    );
  }

  function renderAction(
    action: SwipeableRowAction,
    direction: SwipeableRowDirection,
  ) {
    const { title, backgroundColor, onPress } = action || {};

    return (
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: 0 }],
          width: '100%',
        }}
      >
        <RectButton
          style={[
            styles.action,
            {
              backgroundColor,
              alignItems: direction === 'left' ? 'flex-start' : 'flex-end',
            },
          ]}
          onPress={onPress}
        >
          {typeof title === 'string' ? (
            <Text style={styles.actionText}>{title}</Text>
          ) : (
            title
          )}
        </RectButton>
      </Animated.View>
    );
  }

  return (
    <Swipeable
      {...swipeableProps}
      key={id}
      ref={swipeableRef}
      containerStyle={{ position: 'relative' }}
      friction={2}
      leftThreshold={openThreshold}
      rightThreshold={openThreshold}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
});

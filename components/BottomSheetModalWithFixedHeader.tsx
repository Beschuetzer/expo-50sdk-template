import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  BottomSheetMethods,
  BottomSheetModalMethods,
} from '@gorhom/bottom-sheet/lib/typescript/types';
import { Stack, useTheme, Heading } from 'native-base';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dimensions, LayoutChangeEvent } from 'react-native';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { ChildrenProp } from '@/types/general';

type BottomSheetModalWithFixedHeaderProps = {
  title: string;
} & ChildrenProp &
  Omit<BottomSheetModalProps, 'children' | 'snapPoints' | 'index'>;

export const BottomSheetModalWithFixedHeader = forwardRef<
  BottomSheetMethods,
  BottomSheetModalWithFixedHeaderProps
>((props, ref) => {
  const { title, children, ...rest } = props;
  const theme = useTheme();
  const innerRef = useRef<BottomSheetModalMethods>(null);
  useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);

  const [contentHeight, setContentHeight] = useState(0);
  const [headingHeight, setHeadingHeight] = useState(0);
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);

  const snapPoints = useMemo(
    () => [
      contentHeight && headingHeight
        ? `${Math.ceil(((contentHeight + headingHeight + 17) / windowDimensions.height) * 100)}%`
        : '1%',
    ],
    [contentHeight, headingHeight, windowDimensions],
  );

  const onContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event?.nativeEvent?.layout?.height;
      setContentHeight(height);
    },
    [contentHeight, windowDimensions, headingHeight],
  );

  const onHeadingLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event?.nativeEvent?.layout?.height;
      setHeadingHeight(height);
    },
    [contentHeight, windowDimensions, headingHeight],
  );

  return (
    <BottomSheetModal
      {...rest}
      ref={innerRef}
      index={0}
      snapPoints={snapPoints}
    >
      <Heading
        size="md"
        textAlign="center"
        p={theme.space[FORM_INTER_ITEM_SPACING]}
        onLayout={onHeadingLayout}
      >
        {title}
      </Heading>
      <BottomSheetScrollView>
        <Stack
          px={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          pb={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          space={theme.space[FORM_INTER_ITEM_SPACING]}
          onLayout={onContentLayout}
        >
          {children}
        </Stack>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  BottomSheetMethods,
  BottomSheetModalMethods,
} from '@gorhom/bottom-sheet/lib/typescript/types';
import { Stack, useTheme, Heading, Row, Button } from 'native-base';
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
import { maxWidth } from '@/constants/styles';
import { ChildrenProp } from '@/types/general';

type BottomSheetModalWithFixedHeaderProps = {
  onSubmit?: () => void;
  onClose?: () => void;
  title: string;
} & ChildrenProp &
  Omit<BottomSheetModalProps, 'children' | 'snapPoints' | 'index'>;

export const BottomSheetModalWithFixedHeader = forwardRef<
  BottomSheetMethods,
  BottomSheetModalWithFixedHeaderProps
>((props, ref) => {
  const { onSubmit, onClose: onCancel, title, children, ...rest } = props;
  const theme = useTheme();
  const innerRef = useRef<BottomSheetModalMethods>(null);
  useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);

  const [contentHeight, setContentHeight] = useState(0);
  const [buttonsHeight, setButtonsHeight] = useState(0);
  const [headingHeight, setHeadingHeight] = useState(0);
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);
  const showButtonsRow = useMemo(
    () => onSubmit || onCancel,
    [onCancel, onSubmit],
  );

  const snapPoints = useMemo(
    () => [
      contentHeight && headingHeight
        ? `${Math.ceil(((contentHeight + headingHeight + buttonsHeight + 23) / windowDimensions.height) * 100)}%`
        : '1%',
    ],
    [buttonsHeight, contentHeight, headingHeight, windowDimensions],
  );

  const onGetCoordinatesPress = useCallback(() => {
    onSubmit && onSubmit();
  }, [onSubmit]);

  const onClosePress = useCallback(() => {
    innerRef.current?.dismiss();
    onCancel && onCancel();
  }, [onCancel]);

  const onButtonsLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event?.nativeEvent?.layout?.height;
    setButtonsHeight(height);
  }, []);

  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event?.nativeEvent?.layout?.height;
    setContentHeight(height);
  }, []);

  const onHeadingLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event?.nativeEvent?.layout?.height;
    setHeadingHeight(height);
  }, []);

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
          pb={!showButtonsRow ? theme.space[FORM_INTER_ITEM_SPACING] * 2 : 0}
          space={theme.space[FORM_INTER_ITEM_SPACING]}
          onLayout={onContentLayout}
        >
          {children}
        </Stack>
      </BottomSheetScrollView>
      {showButtonsRow ? (
        <Row
          space={theme.space[FORM_INTER_ITEM_SPACING]}
          p={theme.space[1]}
          justifyContent="space-between"
          onLayout={onButtonsLayout}
        >
          {onSubmit ? (
            <Button
              {...maxWidth}
              flex={1}
              onPress={onGetCoordinatesPress}
              colorScheme="success"
            >
              Get Coordinates
            </Button>
          ) : null}
          {onCancel ? (
            <Button
              {...maxWidth}
              flex={1}
              onPress={onClosePress}
              colorScheme="secondary"
            >
              Cancel
            </Button>
          ) : null}
        </Row>
      ) : null}
    </BottomSheetModal>
  );
});

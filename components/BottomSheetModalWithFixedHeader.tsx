import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  BottomSheetMethods,
  BottomSheetModalMethods,
} from '@gorhom/bottom-sheet/lib/typescript/types';
import { Stack, useTheme, Heading, Row, Button, Column } from 'native-base';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dimensions, LayoutChangeEvent } from 'react-native';

import {
  InputValidationMessage,
  InputValidationMessageProps,
} from './InputValidationMessage';
import { useKeyboard } from './hooks/useKeyboard';

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import { maxWidth } from '@/constants/styles';
import { ButtonOptions, ChildrenProp } from '@/types/general';

type SubmitButtonProps = {
  validation?: InputValidationMessageProps;
} & ButtonOptions;

export type BottomSheetModalWithFixedHeaderProps = {
  closeButton?: ButtonOptions;
  hideButtons?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  submitButton?: SubmitButtonProps;
  title: string;
  useFullscreen?: boolean;
} & ChildrenProp &
  Omit<BottomSheetModalProps, 'children' | 'snapPoints' | 'index'>;

export const BottomSheetModalWithFixedHeader = forwardRef<
  BottomSheetMethods,
  BottomSheetModalWithFixedHeaderProps
>((props, ref) => {
  const {
    children,
    closeButton,
    hideButtons = false,
    onClose: onCancel,
    onSubmit,
    submitButton,
    title,
    useFullscreen = false,
    ...rest
  } = props;
  const theme = useTheme();
  const innerRef = useRef<BottomSheetModalMethods>(null);
  useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);

  const isKeyboardVisible = useKeyboard();
  const [contentHeight, setContentHeight] = useState(0);
  const [buttonsHeight, setButtonsHeight] = useState(0);
  const [headingHeight, setHeadingHeight] = useState(0);
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);

  const submitButtonToUse = useMemo(() => {
    return {
      validation: {
        isValid:
          submitButton?.validation?.isValid != null
            ? submitButton.validation.isValid
            : true,
        message: submitButton?.validation?.message || EMPTY_STRING,
      },
      colorScheme: submitButton?.colorScheme || 'success',
      isEnabled:
        submitButton?.isEnabled != null ? submitButton.isEnabled : true,
      text: submitButton?.text || 'Submit',
    } as SubmitButtonProps;
  }, [submitButton]);

  const closeButtonToUse = useMemo(() => {
    return {
      colorScheme: closeButton?.colorScheme || 'secondary',
      isEnabled: closeButton?.isEnabled != null ? closeButton.isEnabled : true,
      text: closeButton?.text || 'Close',
    } as ButtonOptions;
  }, [closeButton]);

  const snapPoints = useMemo(
    () => [
      useFullscreen
        ? '100%'
        : contentHeight && headingHeight
          ? isKeyboardVisible
            ? '100%'
            : `${Math.ceil(((contentHeight + headingHeight + buttonsHeight + 23) / windowDimensions.height) * 100)}%`
          : '1%',
    ],
    [
      useFullscreen,
      isKeyboardVisible,
      buttonsHeight,
      contentHeight,
      headingHeight,
      windowDimensions,
    ],
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
    setButtonsHeight(hideButtons ? EMPTY_NUMBER : height);
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
      <BottomSheetScrollView keyboardShouldPersistTaps="always">
        <Stack
          px={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          space={theme.space[FORM_INTER_ITEM_SPACING]}
          onLayout={onContentLayout}
        >
          {children}
        </Stack>
      </BottomSheetScrollView>
      <Column
        p={theme.space[1]}
        pt={theme.space[FORM_INTER_ITEM_SPACING]}
        onLayout={onButtonsLayout}
      >
        <InputValidationMessage {...submitButtonToUse.validation} />
        {!hideButtons ? (
          <Row
            space={theme.space[FORM_INTER_ITEM_SPACING]}
            justifyContent="space-between"
          >
            {onSubmit ? (
              <Button
                {...maxWidth}
                flex={1}
                onPress={onGetCoordinatesPress}
                colorScheme={submitButtonToUse.colorScheme}
                isDisabled={!submitButtonToUse.isEnabled}
              >
                {submitButtonToUse.text}
              </Button>
            ) : null}
            <Button
              {...maxWidth}
              flex={1}
              onPress={onClosePress}
              colorScheme={closeButtonToUse.colorScheme}
              isDisabled={!closeButtonToUse.isEnabled}
            >
              {closeButtonToUse.text}
            </Button>
          </Row>
        ) : null}
      </Column>
    </BottomSheetModal>
  );
});

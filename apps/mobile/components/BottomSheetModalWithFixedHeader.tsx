import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  VStack,
} from '@gluestack-ui/themed';
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  BottomSheetMethods,
  BottomSheetModalMethods,
} from '@gorhom/bottom-sheet/lib/typescript/types';
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
      action: submitButton?.action || 'positive',
      isEnabled:
        submitButton?.isEnabled != null ? submitButton.isEnabled : true,
      text: submitButton?.text || 'Submit',
    } as SubmitButtonProps;
  }, [submitButton]);

  const closeButtonToUse = useMemo(() => {
    return {
      action: closeButton?.action || 'secondary',
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

  const onSubmitPress = useCallback(() => {
    onSubmit && onSubmit();
  }, [onSubmit]);

  const onClosePress = useCallback(() => {
    innerRef.current?.dismiss();
    onCancel && onCancel();
  }, [onCancel]);

  const onButtonsLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event?.nativeEvent?.layout?.height;
      setButtonsHeight(hideButtons ? EMPTY_NUMBER : height);
    },
    [hideButtons],
  );

  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    setContentHeight(event?.nativeEvent?.layout?.height);
  }, []);

  const onHeadingLayout = useCallback((event: LayoutChangeEvent) => {
    setHeadingHeight(event?.nativeEvent?.layout?.height);
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
        p={FORM_INTER_ITEM_SPACING}
        onLayout={onHeadingLayout}
      >
        {title}
      </Heading>
      <BottomSheetScrollView keyboardShouldPersistTaps="always">
        <VStack
          px={FORM_INTER_ITEM_SPACING * 2}
          space="sm"
          onLayout={onContentLayout}
        >
          {children}
        </VStack>
      </BottomSheetScrollView>
      <Box p="$1" pt={FORM_INTER_ITEM_SPACING} onLayout={onButtonsLayout}>
        <InputValidationMessage {...submitButtonToUse.validation} />
        {!hideButtons ? (
          <HStack space="sm" justifyContent="space-between">
            {onSubmit ? (
              <Button
                style={maxWidth as any}
                flex={1}
                onPress={onSubmitPress}
                action={submitButtonToUse.action}
                isDisabled={!submitButtonToUse.isEnabled}
              >
                <ButtonText>{submitButtonToUse.text}</ButtonText>
              </Button>
            ) : null}
            <Button
              style={maxWidth as any}
              flex={1}
              onPress={onClosePress}
              action={closeButtonToUse.action}
              isDisabled={!closeButtonToUse.isEnabled}
            >
              <ButtonText>{closeButtonToUse.text}</ButtonText>
            </Button>
          </HStack>
        ) : null}
      </Box>
    </BottomSheetModal>
  );
});
BottomSheetModalWithFixedHeader.displayName = 'BottomSheetModalWithFixedHeader';

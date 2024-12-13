import { BlurView } from 'expo-blur';
import { View, useTheme, Button, Row, Heading } from 'native-base';
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { Modal, ViewStyle } from 'react-native';

import { MODAL_BLUR_VIEW_COLOR } from '@/constants/colors';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { maxWidth } from '@/constants/styles';
import { ButtonOptions, ChildrenProp } from '@/types/general';

export type ModalWithBlurProps = {
  cancelButton?: ButtonOptions;
  confirmButton?: ButtonOptions;
  containerStyles?: IViewProps;
  isVisible?: boolean;
  title: string | ReactNode | ReactNode[];
  onConfirm?: () => void;
  onCancel?: () => void;
  onBlurPress?: () => void;
} & ChildrenProp;

export function ModalWithBlur(props: ModalWithBlurProps) {
  const {
    cancelButton,
    confirmButton,
    containerStyles,
    isVisible = false,
    title,
    children,
    onCancel,
    onConfirm,
    onBlurPress,
  } = props;
  const theme = useTheme();

  const cancelButtonToUse = useMemo(() => {
    return {
      text: 'Cancel',
      colorScheme: 'red',
      isEnabled: true,
      isVisible: true,
      ...cancelButton,
    } as ButtonOptions;
  }, [cancelButton]);
  const confirmButtonToUse = useMemo(() => {
    return {
      text: 'Confirm',
      colorScheme: 'green',
      isEnabled: true,
      isVisible: true,
      ...confirmButton,
    } as ButtonOptions;
  }, [confirmButton]);

  const onCancelPress = useCallback(() => {
    onCancel && onCancel();
  }, [onCancel]);

  const onConfirmPress = useCallback(() => {
    onConfirm && onConfirm();
  }, [onConfirm]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onCancelPress}
    >
      <BlurView
        intensity={100}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: MODAL_BLUR_VIEW_COLOR,
        }}
        onTouchEnd={() => {
          onBlurPress && onBlurPress();
        }}
      >
        <View
          style={
            {
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              ...containerStyles,
              ...maxWidth,
            } as ViewStyle
          }
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
        >
          {typeof title === 'string' ? (
            <Heading
              textAlign="center"
              size="sm"
              pb={theme.space[FORM_INTER_ITEM_SPACING]}
            >
              {title}
            </Heading>
          ) : (
            <View>{title}</View>
          )}
          {children}
          <Row
            space={theme.space[FORM_INTER_ITEM_SPACING]}
            justifyContent="space-around"
            mt={theme.space[FORM_INTER_ITEM_SPACING]}
            mb={-theme.space[FORM_INTER_ITEM_SPACING]}
          >
            {confirmButtonToUse.isVisible ? (
              <Button
                variant="ghost"
                isDisabled={!confirmButtonToUse.isEnabled}
                onPress={onConfirmPress}
                colorScheme={confirmButtonToUse.colorScheme}
              >
                {confirmButtonToUse.text}
              </Button>
            ) : null}
            {cancelButtonToUse.isVisible ? (
              <Button
                variant="ghost"
                isDisabled={!cancelButtonToUse.isEnabled}
                onPress={onCancelPress}
                colorScheme={cancelButtonToUse.colorScheme}
              >
                {cancelButtonToUse.text}
              </Button>
            ) : null}
          </Row>
        </View>
      </BlurView>
    </Modal>
  );
}

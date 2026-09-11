import { Box, Button, ButtonText, HStack, Heading } from '@gluestack-ui/themed';
import { BlurView } from 'expo-blur';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { Modal } from 'react-native';

import { MODAL_BLUR_VIEW_COLOR } from '@/constants/colors';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { maxWidth } from '@/constants/styles';
import { ButtonOptions, ChildrenProp } from '@/types/general';

export type ModalWithBlurProps = {
  cancelButton?: ButtonOptions;
  confirmButton?: ButtonOptions;
  containerStyles?: Record<string, unknown>;
  isVisible: boolean;
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

  const cancelButtonToUse = useMemo(() => {
    return {
      text: 'Cancel',
      action: 'negative',
      isEnabled: true,
      isVisible: true,
      ...cancelButton,
    } as ButtonOptions;
  }, [cancelButton]);
  const confirmButtonToUse = useMemo(() => {
    return {
      text: 'Confirm',
      action: 'positive',
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
        <Box
          style={
            {
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              maxHeight: '90%',
              ...maxWidth,
              ...containerStyles,
            } as any
          }
          onTouchEnd={(e: any) => {
            e.stopPropagation();
          }}
        >
          {typeof title === 'string' ? (
            <Heading textAlign="center" size="sm" pb={FORM_INTER_ITEM_SPACING}>
              {title}
            </Heading>
          ) : (
            <Box>{title}</Box>
          )}
          {children}
          <HStack
            space="sm"
            justifyContent="space-around"
            mt={FORM_INTER_ITEM_SPACING}
            mb={-FORM_INTER_ITEM_SPACING}
          >
            {confirmButtonToUse.isVisible ? (
              <Button
                variant="solid"
                isDisabled={!confirmButtonToUse.isEnabled}
                onPress={onConfirmPress}
                action={confirmButtonToUse.action}
              >
                <ButtonText>{confirmButtonToUse.text}</ButtonText>
              </Button>
            ) : null}
            {cancelButtonToUse.isVisible ? (
              <Button
                variant="solid"
                isDisabled={!cancelButtonToUse.isEnabled}
                onPress={onCancelPress}
                action={cancelButtonToUse.action}
              >
                <ButtonText>{cancelButtonToUse.text}</ButtonText>
              </Button>
            ) : null}
          </HStack>
        </Box>
      </BlurView>
    </Modal>
  );
}

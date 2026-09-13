import { HStack } from '@gluestack-ui/themed';
import { BlurView } from 'expo-blur';
import React, {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { Modal } from 'react-native';

import { ThemeAwareButton } from '@/components/ui/ThemeAwareButton';
import { ThemeAwareSurface } from '@/components/ui/ThemeAwareSurface';
import { ThemeAwareHeading } from '@/components/ui/ThemeAwareText';
import { MODAL_BLUR_VIEW_COLOR } from '@/constants/colors';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { maxWidth } from '@/constants/styles';

type ButtonOptions = {
  action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
  isEnabled?: boolean;
  isVisible?: boolean;
  text?: string;
};

export type ModalWithBlurProps = PropsWithChildren<{
  cancelButton?: ButtonOptions;
  confirmButton?: ButtonOptions;
  containerStyles?: Record<string, unknown>;
  isVisible: boolean;
  title: string | ReactNode | ReactNode[];
  onConfirm?: () => void;
  onCancel?: () => void;
  onBlurPress?: () => void;
}>;

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
        <ThemeAwareSurface
          style={
            {
              padding: 20,
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
            <ThemeAwareHeading
              textAlign="center"
              size="sm"
              pb={FORM_INTER_ITEM_SPACING}
            >
              {title}
            </ThemeAwareHeading>
          ) : (
            <ThemeAwareSurface>{title}</ThemeAwareSurface>
          )}
          {children}
          <HStack
            space="sm"
            justifyContent="space-around"
            mt={FORM_INTER_ITEM_SPACING}
            mb={-FORM_INTER_ITEM_SPACING}
          >
            {confirmButtonToUse.isVisible ? (
              <ThemeAwareButton
                variant="solid"
                isDisabled={!confirmButtonToUse.isEnabled}
                onPress={onConfirmPress}
                action={confirmButtonToUse.action}
              >
                {confirmButtonToUse.text}
              </ThemeAwareButton>
            ) : null}
            {cancelButtonToUse.isVisible ? (
              <ThemeAwareButton
                variant="solid"
                isDisabled={!cancelButtonToUse.isEnabled}
                onPress={onCancelPress}
                action={cancelButtonToUse.action}
              >
                {cancelButtonToUse.text}
              </ThemeAwareButton>
            ) : null}
          </HStack>
        </ThemeAwareSurface>
      </BlurView>
    </Modal>
  );
}

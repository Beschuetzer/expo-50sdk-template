import { BlurView } from 'expo-blur';
import { View, useTheme, Button, Row, Heading } from 'native-base';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { Modal } from 'react-native';

import { MODAL_BLUR_VIEW_COLOR } from '@/constants/colors';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { maxWidth } from '@/constants/styles';
import { ButtonOptions, ChildrenProp } from '@/types/general';

export type ModalWithBlurProps = {
  cancelButton?: ButtonOptions;
  confirmButton?: ButtonOptions;
  isVisible?: boolean;
  title: string | ReactNode | ReactNode[];
  onConfirm?: () => void;
  onCancel?: () => void;
} & ChildrenProp;

export function ModalWithBlur(props: ModalWithBlurProps) {
  const {
    cancelButton,
    confirmButton,
    isVisible = false,
    title,
    children,
    onCancel,
    onConfirm,
  } = props;
  const theme = useTheme();

  const cancelButtonToUse = useMemo(() => {
    return {
      text: 'Cancel',
      colorScheme: 'red',
      isEnabled: true,
      ...cancelButton,
    } as ButtonOptions;
  }, [cancelButton, theme]);
  const confirmButtonToUse = useMemo(() => {
    return {
      text: 'Confirm',
      colorScheme: 'green',
      isEnabled: true,
      ...confirmButton,
    } as ButtonOptions;
  }, [confirmButton, theme]);

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
      >
        <View
          style={{
            ...maxWidth,
            maxHeight: '85%',
            padding: 20,
            backgroundColor: 'white',
            borderRadius: 10,
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
            <Button
              variant="ghost"
              isDisabled={!confirmButtonToUse.isEnabled}
              onPress={onConfirmPress}
              colorScheme={confirmButtonToUse.colorScheme}
            >
              {confirmButtonToUse.text}
            </Button>
            <Button
              variant="ghost"
              isDisabled={!cancelButtonToUse.isEnabled}
              onPress={onCancelPress}
              colorScheme={cancelButtonToUse.colorScheme}
            >
              {cancelButtonToUse.text}
            </Button>
          </Row>
        </View>
      </BlurView>
    </Modal>
  );
}

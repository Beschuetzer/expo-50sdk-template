import { BlurView } from 'expo-blur';
import { View, useTheme, Text } from 'native-base';
import React, { useCallback, useMemo } from 'react';
import { Modal, TouchableOpacity } from 'react-native';

import { MODAL_BLUR_VIEW_COLOR } from '@/constants/colors';
import { ChildrenProp } from '@/types/general';
import { getButtonHitSlop } from '@/utils/helpers';

type ModalWithBlurButton = {
  text?: string;
  color?: string;
};

export type ModalWithBlurProps = {
  cancelButton?: ModalWithBlurButton;
  confirmButton?: ModalWithBlurButton;
  isVisible?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
} & ChildrenProp;

export function ModalWithBlur(props: ModalWithBlurProps) {
  const {
    cancelButton,
    confirmButton,
    isVisible = false,
    children,
    onCancel,
    onConfirm,
  } = props;
  const theme = useTheme();

  const cancelButtonToUse = useMemo(() => {
    return {
      text: 'Cancel',
      color: theme.colors.danger[900],
      ...cancelButton,
    } as ModalWithBlurButton;
  }, [cancelButton, theme]);
  const confirmButtonToUse = useMemo(() => {
    return {
      text: 'Confirm',
      color: theme.colors.green[900],
      ...confirmButton,
    } as ModalWithBlurButton;
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
            maxHeight: '85%',
            maxWidth: '85%',
            padding: 20,
            backgroundColor: 'white',
            borderRadius: 10,
          }}
        >
          {children}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              hitSlop={getButtonHitSlop(4)}
              onPress={onConfirmPress}
            >
              <Text style={{ color: confirmButtonToUse.color }}>
                {confirmButtonToUse.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={getButtonHitSlop(4)}
              onPress={onCancelPress}
            >
              <Text style={{ color: cancelButtonToUse.color }}>
                {cancelButtonToUse.text}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

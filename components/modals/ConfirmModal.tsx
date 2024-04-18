import { Text, useTheme, Heading } from 'native-base';
import React from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';

export type ConfirmModalProps = {
  message?: string;
  note?: string;
  title?: string;
} & ModalWithBlurProps;

export const ConfirmModal = (props: ConfirmModalProps) => {
  const theme = useTheme();
  const {
    isVisible = false,
    message = EMPTY_STRING,
    note = EMPTY_STRING,
    onCancel,
    onConfirm,
    title = EMPTY_STRING,
  } = props;

  return (
    <ModalWithBlur
      isVisible={isVisible}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {title ? (
        <Heading
          size="sm"
          textAlign="center"
          mb={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          {title}
        </Heading>
      ) : null}
      {message ? <Text>{message}</Text> : null}
      {note ? (
        <Text
          italic
          bold
          fontSize="xs"
          mt={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          *{note}
        </Text>
      ) : null}
    </ModalWithBlur>
  );
};

import { Text, useTheme } from 'native-base';
import React from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';

export type ConfirmModalProps = {
  message?: string;
  note?: string;
} & Omit<ModalWithBlurProps, 'children' | 'title'> &
  Partial<Pick<ModalWithBlurProps, 'title'>>;

export const ConfirmModal = (props: ConfirmModalProps) => {
  const theme = useTheme();
  const {
    message = EMPTY_STRING,
    note = EMPTY_STRING,
    title = EMPTY_STRING,
  } = props;

  return (
    <ModalWithBlur {...props} title={title}>
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

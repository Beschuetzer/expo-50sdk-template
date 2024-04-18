import { Text, useTheme, Heading } from 'native-base';
import React from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';

export type ConfirmModalProps = {
  message?: string;
  note?: string;
  title?: string;
} & Omit<ModalWithBlurProps, 'children'>;

export const ConfirmModal = (props: ConfirmModalProps) => {
  const theme = useTheme();
  const {
    message = EMPTY_STRING,
    note = EMPTY_STRING,
    title = EMPTY_STRING,
  } = props;

  return (
    <ModalWithBlur {...props}>
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

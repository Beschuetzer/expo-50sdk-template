import { Button, ScrollView, Text, useTheme } from 'native-base';
import React, { useCallback, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';

export type ConfirmModalProps = {
  items?: string[];
  message?: string;
  note?: string;
  onConfirm?: (selectedItem?: string) => void;
} & Omit<ModalWithBlurProps, 'children' | 'title' | 'onConfirm'> &
  Partial<Pick<ModalWithBlurProps, 'title'>>;

export const ConfirmModal = (props: ConfirmModalProps) => {
  const theme = useTheme();
  const {
    message = EMPTY_STRING,
    note = EMPTY_STRING,
    items = [],
    title = EMPTY_STRING,
    onCancel,
    onConfirm,
    ...rest
  } = props;
  const [currentlySelectedItem, setCurrentlySelectedItem] =
    useState(EMPTY_STRING);

  const onButtonPress = useCallback((item: string) => {
    setCurrentlySelectedItem(item);
  }, []);

  const reset = useCallback(() => {
    setCurrentlySelectedItem(EMPTY_STRING);
  }, []);

  const onCancelPress = useCallback(() => {
    onCancel && onCancel();
    reset();
  }, [reset, onCancel]);

  const onConfirmPress = useCallback(() => {
    onConfirm && onConfirm(currentlySelectedItem);
    reset();
  }, [currentlySelectedItem, reset, onConfirm]);

  return (
    <ModalWithBlur
      {...rest}
      title={title}
      onConfirm={onConfirmPress}
      onCancel={onCancelPress}
    >
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
      {items.length > 1 ? (
        <ScrollView keyboardShouldPersistTaps="handled">
          {items.map((item, index) => {
            return (
              <Button
                key={index}
                isDisabled={item === currentlySelectedItem}
                onPress={() => onButtonPress(item)}
              >
                {item}
              </Button>
            );
          })}
        </ScrollView>
      ) : null}
    </ModalWithBlur>
  );
};

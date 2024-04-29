import { FlashList } from '@shopify/flash-list';
import { theme, Button } from 'native-base';
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { itemsListSelector } from '@/state/slices/listsSlice';

export type CopyModalValues = { [key: string]: unknown };

type CopyValueModalProps = {
  onConfirm: (selectedValue: unknown) => void;
  values: CopyModalValues;
} & Omit<ModalWithBlurProps, 'children' | 'onConfirm'>;

export default function CopyValueModal(props: CopyValueModalProps) {
  const { onConfirm, onCancel, values } = props;
  const itemsList = useSelector(itemsListSelector);
  const [currentlySelectedKey, setCurrentlySelectedKey] =
    useState<string>(EMPTY_STRING);

  const itemsToShow = useMemo(() => {
    //todo:
    // return itemsList.data.filter(item => getKeyToUse(item) === )
    return Object.entries(values);
  }, [itemsList, values]);

  const reset = useCallback(() => {
    setCurrentlySelectedKey(EMPTY_STRING);
  }, []);

  const onConfirmPress = useCallback(() => {
    onConfirm && onConfirm(values[currentlySelectedKey]);
    reset();
  }, [onConfirm, reset, currentlySelectedKey]);

  const onCancelPress = useCallback(() => {
    onCancel && onCancel();
    reset();
  }, [onCancel, reset]);

  return (
    <ModalWithBlur
      {...props}
      isVisible={itemsToShow && itemsToShow.length > 0}
      confirmButton={{
        isEnabled: !!currentlySelectedKey,
      }}
      onConfirm={onConfirmPress}
      onCancel={onCancelPress}
    >
      <FlashList
        renderItem={(item) => {
          const { item: itemToRender } = item;
          const [key, value] = itemToRender;
          return (
            <Button
              key={key}
              mt={theme.space[FORM_INTER_ITEM_SPACING]}
              variant="subtle"
              isDisabled={currentlySelectedKey === key}
              onPress={() => setCurrentlySelectedKey(key)}
            >
              {key}
            </Button>
          );
        }}
        data={itemsToShow}
      />
    </ModalWithBlur>
  );
}

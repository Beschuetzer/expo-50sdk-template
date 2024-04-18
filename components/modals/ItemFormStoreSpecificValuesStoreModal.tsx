import { Text } from 'native-base';
import React from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

type ItemFormStoreSpecificValuesStoreModalProps = object &
  Omit<ModalWithBlurProps, 'children'>;

export function ItemFormStoreSpecificValuesStoreModal(
  props: ItemFormStoreSpecificValuesStoreModalProps,
) {
  const { isVisible, onCancel, onConfirm } = props;
  return (
    <ModalWithBlur
      isVisible={isVisible}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Text>ItemFormStoreSpecificValuesStoreModal</Text>
    </ModalWithBlur>
  );
}

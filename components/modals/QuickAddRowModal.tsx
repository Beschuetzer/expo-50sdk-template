import { Row, Input, Stack, useTheme } from 'native-base';
import React, { useCallback, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import FocusInput from '../FocusInput';
import { FontAwesomeButton } from '../FontAwesomeButton';
import { InputText } from '../forms/InputText';

import { EMPTY_STRING, QUANTITY_ROW_DEFAULT } from '@/constants/general';
import { logWhenDevelopmentMode } from '@/utils/logging';

type QuickAddRowModalProps = Omit<ModalWithBlurProps, 'onConfirm'> & {
  onConfirm: (name: string, quantity: number) => void;
};

export function QuickAddRowModal(props: QuickAddRowModalProps) {
  const { onConfirm } = props;
  const theme = useTheme();
  const [name, setName] = useState(EMPTY_STRING);
  const [quantity, setQuantity] = useState(`${QUANTITY_ROW_DEFAULT}`);

  const onConfirmLocal = useCallback(() => {
    if (!name) return;
    onConfirm && onConfirm(name, parseInt(quantity, 10));
  }, [onConfirm, name, quantity]);

  return (
    <ModalWithBlur {...props} onConfirm={onConfirmLocal}>
      <Row>
        <InputText>Name: </InputText>
        <FocusInput
          flex={1}
          value={name}
          onChangeText={(newText) => setName(newText)}
          onSubmitEditing={onConfirmLocal}
        />
      </Row>
      <Row>
        <InputText>Quantity: </InputText>
        <Input
          flex={1}
          keyboardType="numeric"
          value={quantity}
          onChangeText={(newQuantity) => setQuantity(newQuantity)}
          rightElement={
            <Stack alignItems="center" justifyContent="space-between">
              <FontAwesomeButton
                style={{ paddingVertical: 5, paddingHorizontal: 5 }}
                size={theme.sizes[3]}
                name="plus"
                onPress={() =>
                  setQuantity((current) => {
                    const parsedInt = parseInt(current, 10);
                    const newQuantity = parsedInt + 1;
                    logWhenDevelopmentMode({ newQuantity });

                    return newQuantity.toString();
                  })
                }
              />
              <FontAwesomeButton
                size={theme.sizes[3]}
                name="minus"
                onPress={() =>
                  setQuantity((current) => {
                    const parsedInt = parseInt(current, 10);
                    const newQuantity =
                      parsedInt > 1 ? parsedInt - 1 : QUANTITY_ROW_DEFAULT;
                    return newQuantity.toString();
                  })
                }
              />
            </Stack>
          }
        />
      </Row>
    </ModalWithBlur>
  );
}

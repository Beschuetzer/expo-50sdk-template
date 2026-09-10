import {
  Heading,
  HStack,
  Input,
  InputField,
  VStack,
} from '@gluestack-ui/themed';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { FontAwesomeButton } from '../FontAwesomeButton';

import { EMPTY_NUMBER } from '@/constants/general';

type QuantityModifierModalProps = {
  initialQuantity?: number;
  minimumQuantity?: number;
  onConfirm?: (quantity: string) => void;
  onQuantityChange?: (quantity: string) => void;
} & Omit<ModalWithBlurProps, 'onConfirm'>;

export default function QuantityModifierModal(
  props: QuantityModifierModalProps,
) {
  const {
    initialQuantity,
    minimumQuantity = EMPTY_NUMBER,
    onConfirm,
    onQuantityChange,
    onBlurPress,
    ...restProps
  } = props;
  const [quantity, setQuantity] = useState(1);

  const onChangeNumber = useCallback(
    (newValue: string) => {
      const parsedNumber = parseInt(newValue, 10);
      const isParsedNumberValid =
        !isNaN(parsedNumber) && parsedNumber >= minimumQuantity;
      const newQuantity = isParsedNumberValid ? parsedNumber : EMPTY_NUMBER;
      setQuantity(newQuantity);
      onQuantityChange && onQuantityChange(newQuantity.toString());
    },
    [minimumQuantity, onQuantityChange],
  );

  const onBlurPressLocal = useCallback(() => {
    if (quantity < minimumQuantity) {
      setQuantity(minimumQuantity);
      onQuantityChange && onQuantityChange(minimumQuantity.toString());
    }
    onBlurPress && onBlurPress();
  }, [quantity, minimumQuantity, onBlurPress, onQuantityChange]);

  const onConfirmPressLocal = useCallback(() => {
    onConfirm && onConfirm(quantity.toString());
  }, [quantity, onConfirm]);

  const onMinusButtonPress = useCallback(() => {
    const newQuantity = Math.max(minimumQuantity, quantity - 1);
    setQuantity(newQuantity);
    onQuantityChange && onQuantityChange(newQuantity.toString());
  }, [onQuantityChange, quantity, minimumQuantity]);

  const onPlusButtonPress = useCallback(() => {
    setQuantity((current) => current + 1);
    onQuantityChange && onQuantityChange((quantity + 1).toString());
  }, [onQuantityChange, quantity]);

  useEffect(() => {
    if (!initialQuantity || initialQuantity < minimumQuantity) return;
    setQuantity(initialQuantity);
  }, [initialQuantity, minimumQuantity]);

  return (
    <ModalWithBlur
      {...restProps}
      onBlurPress={onBlurPressLocal}
      onConfirm={onConfirmPressLocal}
    >
      <VStack>
        <HStack space="sm" justifyContent="space-between" alignItems="center">
          <Heading size="sm">Quantity:</Heading>
          <Input maxWidth={Dimensions.get('window').width * 0.25}>
            <InputField
              keyboardType="numeric"
              onChangeText={onChangeNumber}
              value={String(quantity)}
            />
          </Input>
          <FontAwesomeButton name="plus" onPress={onPlusButtonPress} />
          <FontAwesomeButton
            name="minus"
            onPress={onMinusButtonPress}
            disabled={quantity <= minimumQuantity}
          />
        </HStack>
      </VStack>
    </ModalWithBlur>
  );
}

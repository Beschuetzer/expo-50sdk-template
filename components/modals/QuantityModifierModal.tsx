import { Row, theme, Heading, Input, Stack, IInputProps } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { FontAwesomeButton } from '../FontAwesomeButton';

import { EMPTY_NUMBER, FORM_INTER_ITEM_SPACING } from '@/constants/general';

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
  const [cursorPosition, setCursorPosition] = useState<
    IInputProps['selection']
  >({
    start: 0,
    end: 0,
  });

  const updateCursorPosition = useCallback((quantity: number) => {
    const cursorPositionToUse = String(quantity).length;
    setCursorPosition({
      start: cursorPositionToUse,
      end: cursorPositionToUse,
    });
  }, []);

  const onChangeNumber = useCallback(
    (newValue: string) => {
      const parsedNumber = parseInt(newValue, 10);
      const isParsedNumberValid =
        !isNaN(parsedNumber) && parsedNumber >= minimumQuantity;

      const newQuantity = isParsedNumberValid ? parsedNumber : EMPTY_NUMBER;
      setQuantity(newQuantity);
      onQuantityChange && onQuantityChange(newQuantity.toString());
      updateCursorPosition(newQuantity);
    },
    [minimumQuantity, updateCursorPosition],
  );

  const onBlurPressLocal = useCallback(() => {
    if (quantity < minimumQuantity) {
      setQuantity(minimumQuantity);
      onQuantityChange && onQuantityChange(minimumQuantity.toString());
    }
    onBlurPress && onBlurPress();
  }, [quantity, minimumQuantity, onBlurPress, onQuantityChange]);

  const onCofirmPressLocal = useCallback(() => {
    onConfirm && onConfirm(quantity.toString());
  }, [quantity, onConfirm]);

  const onFocusNumberInput = useCallback(() => {
    updateCursorPosition(quantity);
  }, [updateCursorPosition, quantity]);

  const onMinusButtonPress = useCallback(() => {
    const newQuantity = Math.max(minimumQuantity, quantity - 1);
    setQuantity(newQuantity);
    onQuantityChange && onQuantityChange(newQuantity.toString());
  }, [onQuantityChange, quantity]);

  const onPlusButtonPress = useCallback(() => {
    setQuantity((current) => current + 1);
    onQuantityChange && onQuantityChange((quantity + 1).toString());
  }, [onQuantityChange, quantity]);

  useEffect(() => {
    if (!initialQuantity || initialQuantity < minimumQuantity) return;
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  return (
    <ModalWithBlur
      {...restProps}
      onBlurPress={onBlurPressLocal}
      onConfirm={onCofirmPressLocal}
    >
      <Stack>
        <Row
          space={theme.sizes[FORM_INTER_ITEM_SPACING] * 2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading size="sm">Quantity:</Heading>
          <Input
            keyboardType="numeric"
            onChangeText={onChangeNumber}
            selection={cursorPosition}
            value={String(quantity)}
            maxW={Dimensions.get('window').width * 0.25}
            onFocus={onFocusNumberInput}
          />
          <FontAwesomeButton name="plus" onPress={onPlusButtonPress} />
          <FontAwesomeButton
            name="minus"
            onPress={onMinusButtonPress}
            disabled={quantity <= minimumQuantity}
          />
        </Row>
      </Stack>
    </ModalWithBlur>
  );
}

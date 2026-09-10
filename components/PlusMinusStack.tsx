import { VStack } from '@gluestack-ui/themed';
import React from 'react';

import { FontAwesomeButton, FontAwesomeButtonProps } from './FontAwesomeButton';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { getButtonHitSlop } from '@/utils/helpers';

export type PlusMinusStackProps = {
  isMinusDisabled?: boolean;
  isPlusDisabled?: boolean;
  minusButtonProps?: Omit<FontAwesomeButtonProps, 'name' | 'onPress'>;
  onMinusPress: () => void;
  onPlusPress: () => void;
  plusButtonProps?: Omit<FontAwesomeButtonProps, 'name' | 'onPress'>;
};

export function PlusMinusStack(props: PlusMinusStackProps) {
  const {
    isMinusDisabled = false,
    isPlusDisabled = false,
    minusButtonProps = {},
    onMinusPress,
    onPlusPress,
    plusButtonProps = {},
  } = props;
  return (
    <VStack
      p={FORM_INTER_ITEM_SPACING}
      justifyContent="space-around"
      alignContent="center"
    >
      <FontAwesomeButton
        onPress={onPlusPress}
        name="plus"
        disabled={!!isPlusDisabled}
        size={15}
        buttonProps={{
          hitSlop: getButtonHitSlop(),
          ...plusButtonProps.buttonProps,
        }}
        fontAwesomeProps={{
          color: '#0d47a1',
          ...plusButtonProps.fontAwesomeProps,
        }}
        {...plusButtonProps}
      />
      <FontAwesomeButton
        onPress={onMinusPress}
        disabled={!!isMinusDisabled}
        name="minus"
        size={15}
        buttonProps={{
          hitSlop: getButtonHitSlop(),
          ...minusButtonProps.buttonProps,
        }}
        fontAwesomeProps={{
          color: '#0d47a1',
          ...minusButtonProps.fontAwesomeProps,
        }}
        {...minusButtonProps}
      />
    </VStack>
  );
}

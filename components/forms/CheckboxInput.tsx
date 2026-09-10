import { HStack, Text } from '@gluestack-ui/themed';
import Checkbox from 'expo-checkbox';
import React, { ComponentProps, useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { getButtonHitSlop } from '@/utils/helpers';

type CheckboxInputProps = {
  initialValue?: boolean;
  label?: string;
  onValueChange?: (value: boolean) => void;
  rowProps?: ComponentProps<typeof HStack>;
  buttonProps?: ComponentProps<typeof TouchableOpacity>;
  checkboxProps?: ComponentProps<typeof Checkbox>;
  textProps?: ComponentProps<typeof Text>;
};

export default function CheckboxInput(props: CheckboxInputProps) {
  const {
    buttonProps,
    checkboxProps,
    initialValue = false,
    label,
    onValueChange,
    rowProps,
    textProps,
  } = props;
  const [value, setValue] = useState(initialValue);

  const onValueChangeLocal = useCallback(() => {
    const newValue = !value;
    setValue(newValue);
    onValueChange && onValueChange(newValue);
  }, [value, onValueChange]);

  return (
    <HStack space="sm" alignItems="center" {...rowProps}>
      <TouchableOpacity
        hitSlop={getButtonHitSlop()}
        {...buttonProps}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onValueChangeLocal}
      >
        <Checkbox
          value={value}
          hitSlop={getButtonHitSlop()}
          onValueChange={onValueChangeLocal}
          {...checkboxProps}
        />
        {label ? (
          <Text ml="$2" {...textProps}>
            {label}
          </Text>
        ) : null}
      </TouchableOpacity>
    </HStack>
  );
}

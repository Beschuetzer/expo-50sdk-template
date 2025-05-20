import Checkbox from 'expo-checkbox';
import { Row, Text, useTheme } from 'native-base';
import React, { ComponentProps, useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { getButtonHitSlop } from '@/utils/helpers';

type CheckboxInputProps = {
  initialValue?: boolean;
  label?: string;
  onValueChange?: (value: boolean) => void;
  rowProps?: ComponentProps<typeof Row>;
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
  const theme = useTheme();
  const [value, setValue] = useState(initialValue);

  const onValueChangeLocal = useCallback(() => {
    const newValue = !value;
    setValue(newValue);
    onValueChange && onValueChange(newValue);
  }, [value]);

  return (
    <Row
      space={theme.space[FORM_INTER_ITEM_SPACING]}
      alignItems="center"
      {...rowProps}
    >
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
          <Text ml={theme.space[FORM_INTER_ITEM_SPACING]} {...textProps}>
            {label}
          </Text>
        ) : null}
      </TouchableOpacity>
    </Row>
  );
}

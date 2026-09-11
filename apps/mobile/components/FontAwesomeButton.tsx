import { FontAwesome } from '@expo/vector-icons';
import { IconProps } from '@expo/vector-icons/build/createIconSet';
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { TouchableOpacityProps } from 'react-native-gesture-handler';

import { FontAwesomeNames } from '@/types/fontAwesome';

export type FontAwesomeButtonProps = {
  buttonProps?: TouchableOpacityProps;
  disabled?: boolean;
  name: FontAwesomeNames;
  onPress: () => void;
  fontAwesomeProps?: Partial<IconProps<any>>;
  size?: number;
  style?: ViewStyle;
};

export function FontAwesomeButton(props: FontAwesomeButtonProps) {
  const {
    buttonProps,
    disabled,
    name,
    onPress,
    size = 24,
    style,
    fontAwesomeProps,
  } = props;

  return (
    <TouchableOpacity
      {...buttonProps}
      style={{
        ...style,
        opacity: disabled ? 0.25 : 1,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <FontAwesome
        name={name as any}
        size={size}
        {...fontAwesomeProps}
        disabled={disabled}
      />
    </TouchableOpacity>
  );
}

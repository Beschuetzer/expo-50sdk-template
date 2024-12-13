import { FontAwesome } from '@expo/vector-icons';
import { IconProps } from '@expo/vector-icons/build/createIconSet';
import { useTheme } from 'native-base';
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { TouchableOpacityProps } from 'react-native-gesture-handler';

import { FontAwesomeNames } from '@/types/fontAwesome';

type FontAwesomeButtonProps = {
  buttonProps?: TouchableOpacityProps;
  name: FontAwesomeNames;
  onPress: () => void;
  fontAwesomeProps?: Partial<IconProps<any>>;
  size?: number;
  style?: ViewStyle;
};

export function FontAwesomeButton(props: FontAwesomeButtonProps) {
  const theme = useTheme();
  const {
    buttonProps,
    name,
    onPress,
    size = theme.sizes[6],
    style,
    fontAwesomeProps,
  } = props;

  return (
    <TouchableOpacity {...buttonProps} style={style} onPress={onPress}>
      <FontAwesome name={name as any} size={size} {...fontAwesomeProps} />
    </TouchableOpacity>
  );
}

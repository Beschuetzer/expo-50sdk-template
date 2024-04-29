import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from 'native-base';
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

type CopyValueProps = {
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
};

export function CopyValue(props: CopyValueProps) {
  const theme = useTheme();
  const { onPress, size = theme.sizes[6], style } = props;

  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <FontAwesome name="copy" size={size} />
    </TouchableOpacity>
  );
}

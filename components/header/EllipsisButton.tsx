import { FontAwesome } from '@expo/vector-icons';
import { View, useTheme } from 'native-base';
import React from 'react';

type EllipsisButtonProps = {
  size?: number;
};
export function EllipsisButton(props: EllipsisButtonProps) {
  const theme = useTheme();
  const { size = theme.sizes[6] } = props;

  return (
    <View pr={theme.space[1]}>
      <View pl={theme.space[1]}>
        <FontAwesome name="ellipsis-v" size={size} />
      </View>
    </View>
  );
}

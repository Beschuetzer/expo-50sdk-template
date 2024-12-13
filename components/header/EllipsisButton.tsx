import { FontAwesome } from '@expo/vector-icons';
import { View, useTheme } from 'native-base';
import React from 'react';

import { HEADER_BUTTON_SIZE_DEFAULT } from '@/constants/general';

type EllipsisButtonProps = {
  size?: number;
};
export function EllipsisButton(props: EllipsisButtonProps) {
  const theme = useTheme();
  const { size = (theme.sizes as any)[HEADER_BUTTON_SIZE_DEFAULT - 1] } = props;

  return (
    <View pr={theme.space[1]}>
      <View pl={theme.space[1]}>
        <FontAwesome name="ellipsis-v" size={size} />
      </View>
    </View>
  );
}

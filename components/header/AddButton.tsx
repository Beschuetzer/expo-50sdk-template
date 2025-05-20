import { FontAwesome } from '@expo/vector-icons';
import { View, useTheme } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { HEADER_BUTTON_SIZE_DEFAULT } from '@/constants/general';

type AddButtonProps = {
  isEnabled?: boolean;
  onPress: () => void;
  size?: number;
};
export function AddButton(props: AddButtonProps) {
  const theme = useTheme();
  const {
    isEnabled = true,
    size = theme.sizes[HEADER_BUTTON_SIZE_DEFAULT],
    onPress,
  } = props;

  return (
    <View ml={theme.space[1]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!isEnabled}
        style={{ opacity: isEnabled ? 1 : 0.5 }}
      >
        <FontAwesome
          name="plus-square-o"
          size={size}
          color={theme.colors.black}
        />
      </TouchableOpacity>
    </View>
  );
}

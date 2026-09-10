import { FontAwesome } from '@expo/vector-icons';
import { Box } from '@gluestack-ui/themed';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { HEADER_BUTTON_SIZE_DEFAULT } from '@/constants/general';

type RemoveButtonProps = {
  isEnabled?: boolean;
  onPress: () => void;
  size?: number;
};
export function RemoveButton(props: RemoveButtonProps) {
  const {
    isEnabled = true,
    size = HEADER_BUTTON_SIZE_DEFAULT,
    onPress,
  } = props;

  return (
    <Box mr="$1">
      <TouchableOpacity
        onPress={onPress}
        disabled={!isEnabled}
        style={{ opacity: isEnabled ? 1 : 0.5 }}
      >
        <FontAwesome name="minus-square-o" size={size} color="black" />
      </TouchableOpacity>
    </Box>
  );
}

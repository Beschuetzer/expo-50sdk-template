import { FontAwesome } from '@expo/vector-icons';
import { Box } from '@gluestack-ui/themed';
import React from 'react';

import { HEADER_BUTTON_SIZE_DEFAULT } from '@/constants/general';

type EllipsisButtonProps = {
  size?: number;
};
export function EllipsisButton(props: EllipsisButtonProps) {
  const { size = HEADER_BUTTON_SIZE_DEFAULT - 4 } = props;

  return (
    <Box pr="$1">
      <Box pl="$1">
        <FontAwesome name="ellipsis-v" size={size} />
      </Box>
    </Box>
  );
}

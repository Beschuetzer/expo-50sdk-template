import { View, Text, useTheme } from 'native-base';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';

export function InCartPrice() {
  const theme = useTheme();
  return (
    <View
      backgroundColor="white"
      padding={theme.sizes[FORM_INTER_ITEM_SPACING]}
    >
      <Text>Price: $100.00</Text>
    </View>
  );
}

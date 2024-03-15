import { View, Text, useTheme, Heading } from 'native-base';
import { useSelector } from 'react-redux';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { ListName, priceOfItemsSelector } from '@/state/slices/listsSlice';
import { roundNumber } from '@/utils/helpers';

export function InCartPrice() {
  const priceOfItemsInCart = useSelector(
    priceOfItemsSelector(ListName.InCartList),
  );
  const theme = useTheme();
  return (
    <View
      backgroundColor="white"
      padding={theme.sizes[FORM_INTER_ITEM_SPACING]}
    >
      <Heading size="xs">Price: ${roundNumber(priceOfItemsInCart)}</Heading>
    </View>
  );
}

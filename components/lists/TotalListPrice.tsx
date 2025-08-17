import { View, useTheme, Heading } from 'native-base';
import { useSelector } from 'react-redux';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { priceOfItemsSelector } from '@/state/slices/listsSlice';
import { ListName } from '@/types/listSlice';
import { roundNumber } from '@/utils/helpers';

type TotalListPriceProps = {
  listName: ListName; // corrected prop name casing
};

export function TotalListPrice(props: TotalListPriceProps) {
  const { listName } = props;
  const priceOfItemsInCart = useSelector(priceOfItemsSelector(listName));
  const theme = useTheme();
  return (
    <View
      backgroundColor="white"
      padding={theme.sizes[FORM_INTER_ITEM_SPACING]}
    >
      <Heading size="xs">Total: ${roundNumber(priceOfItemsInCart)}</Heading>
    </View>
  );
}

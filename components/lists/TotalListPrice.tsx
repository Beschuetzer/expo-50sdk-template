import { View, useTheme, Heading } from 'native-base';
import { useSelector } from 'react-redux';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { ListName, priceOfItemsSelector } from '@/state/slices/listsSlice';
import { roundNumber } from '@/utils/helpers';

type TotalListPriceProps = {
  listname: ListName;
};

export function TotalListPrice(props: TotalListPriceProps) {
  const { listname } = props;
  const priceOfItemsInCart = useSelector(priceOfItemsSelector(listname));
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

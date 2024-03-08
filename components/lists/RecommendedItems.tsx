import { Text, View } from 'native-base';
import { useSelector } from 'react-redux';

import { recommendedShoppingListItemsSelector } from '@/state/slices/listsSlice';

type RecommendItemsProps = object;
export function RecommendItems(props: RecommendItemsProps) {
  const recommendedItems = useSelector(recommendedShoppingListItemsSelector);
  console.log({ recommendedItems });

  return (
    <View>
      <Text>Recommendations</Text>
    </View>
  );
}

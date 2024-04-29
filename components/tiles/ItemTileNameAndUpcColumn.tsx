import { Column, Text, useTheme } from 'native-base';

import { Item } from '@/types/Item';
import { ChildrenProp, ItemProp } from '@/types/general';

export type ItemTileNameAndUpcColumnProps = {
  color?: string;
  showUpc?: boolean;
} & Partial<ItemProp<Item>> &
  ChildrenProp;
export function ItemTileNameAndUpcColumn(props: ItemTileNameAndUpcColumnProps) {
  const theme = useTheme();
  const { children, color = theme.colors.black, item, showUpc = true } = props;

  if (!item) return null;
  return (
    <Column flex={1}>
      <Text noOfLines={1} color={color}>
        {item?.name}
      </Text>
      {showUpc ? <Text color={color}>{item?.upc}</Text> : null}
      {children}
    </Column>
  );
}

import { Column, Text, useTheme } from 'native-base';

import { Item } from '@/types/Item';
import { ChildrenProp, ItemProp } from '@/types/general';

type ItemTileNameAndUpcColumnProps = {
  color?: string;
} & ItemProp<Item> &
  ChildrenProp;
export function ItemTileNameAndUpcColumn(props: ItemTileNameAndUpcColumnProps) {
  const theme = useTheme();
  const { children, color = theme.colors.black, item } = props;

  return (
    <Column flex={1}>
      <Text noOfLines={1} color={color}>
        {item.name}
      </Text>
      <Text color={color}>{item.upc}</Text>
      {children}
    </Column>
  );
}

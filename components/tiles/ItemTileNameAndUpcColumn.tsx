import { Column, Text, useTheme } from 'native-base';

import { Item } from '@/types/Item';
import { ChildrenProp, ItemProp } from '@/types/general';

type ItemTileNameAndUpcColumnProps = {
  color?: string;
  showUpc?: boolean;
} & ItemProp<Item> &
  ChildrenProp;
export function ItemTileNameAndUpcColumn(props: ItemTileNameAndUpcColumnProps) {
  const theme = useTheme();
  const { children, color = theme.colors.black, item, showUpc = true } = props;

  return (
    <Column flex={1}>
      <Text noOfLines={1} color={color}>
        {item.name}
      </Text>
      {showUpc ? <Text color={color}>{item.upc}</Text> : null}
      {children}
    </Column>
  );
}
